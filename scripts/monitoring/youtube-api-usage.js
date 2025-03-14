import fetch from 'node-fetch';

// 設定
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// YouTube APIの無料枠の制限
const FREE_TIER_LIMITS = {
  DAILY_QUOTA: 10000, // 1日あたりの制限ユニット
  WARNING_THRESHOLD: 80, // 警告を出す閾値（%）
};

/**
 * YouTube Data APIの使用量を監視する
 */
async function monitorYouTubeApiUsage() {
  if (!YOUTUBE_API_KEY) {
    console.error('環境変数が設定されていません: YOUTUBE_API_KEY');
    process.exit(1);
  }

  try {
    // YouTube APIの使用量を確認するためのテストリクエスト
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API request failed: ${response.statusText}`);
    }

    // APIの使用量をレスポンスヘッダーから取得
    const quotaUsed = parseInt(response.headers.get('x-quota-used') || '0', 10);
    const quotaPercentage = (quotaUsed / FREE_TIER_LIMITS.DAILY_QUOTA) * 100;

    // 警告メッセージを作成
    const warnings = [];
    if (quotaPercentage > FREE_TIER_LIMITS.WARNING_THRESHOLD) {
      warnings.push({
        resource: 'YouTube Data API',
        usage: quotaUsed,
        limit: FREE_TIER_LIMITS.DAILY_QUOTA,
        percentage: quotaPercentage.toFixed(1)
      });
    }

    // 警告があれば通知
    if (warnings.length > 0) {
      if (SLACK_WEBHOOK_URL) {
        await sendSlackAlert('YouTube API使用量警告', warnings);
        console.log('Slackに警告を送信しました');
      } else {
        console.log('警告：');
        console.table(warnings);
      }
    } else {
      console.log('YouTube APIの使用量は正常です');
      if (SLACK_WEBHOOK_URL) {
        await sendSlackAlert('YouTube API使用量 正常', [{
          resource: 'ステータス',
          usage: quotaUsed,
          limit: FREE_TIER_LIMITS.DAILY_QUOTA,
          percentage: quotaPercentage.toFixed(1)
        }]);
      }
    }

    return warnings;
  } catch (error) {
    console.error('監視中にエラーが発生:', error);
    
    if (SLACK_WEBHOOK_URL) {
      await sendSlackAlert('YouTube API監視エラー', [{
        resource: 'モニタリングシステム',
        usage: 'エラー発生',
        limit: '正常動作',
        percentage: '100'
      }]);
    }
    
    throw error;
  }
}

/**
 * Slack通知を送信
 */
async function sendSlackAlert(title, warnings) {
  if (!SLACK_WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL が設定されていません');
    return;
  }
  
  try {
    const warningsText = warnings.map(w => 
      `• *${w.resource}*: ${w.usage}/${w.limit} (${w.percentage}%)`
    ).join('\n');
    
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🎥 ${title}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: warnings[0].resource === 'ステータス' 
              ? `現在の使用状況：\n${warningsText}`
              : `YouTube Data APIの使用量が警告閾値（${FREE_TIER_LIMITS.WARNING_THRESHOLD}%）を超えています：\n${warningsText}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `実行時刻: ${new Date().toLocaleString('ja-JP')}`
            }
          ]
        }
      ]
    };
    
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Slack通知の送信に失敗: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Slack通知の送信中にエラーが発生:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorYouTubeApiUsage()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('エラー:', error);
      process.exit(1);
    });
}

export { monitorYouTubeApiUsage }; 