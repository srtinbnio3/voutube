import fetch from 'node-fetch';
import { google } from 'googleapis';

// 設定
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const GOOGLE_CLOUD_CREDENTIALS = process.env.GOOGLE_CLOUD_CREDENTIALS;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'ideatube';

// YouTube APIの無料枠の制限
const FREE_TIER_LIMITS = {
  DAILY_QUOTA: 10000, // 1日あたりの制限ユニット
  WARNING_THRESHOLD: 80, // 警告を出す閾値（%）
};

// APIエンドポイントごとのquotaコスト
const QUOTA_COSTS = {
  CHANNELS_LIST: 1, // channels.listのコスト
  SEARCH: 100,      // search.listのコスト
};

/**
 * Google Cloud Monitoring APIを使ってYouTube Data APIの使用量を取得する
 */
async function getYouTubeQuotaUsage() {
  try {
    // 認証情報の設定
    let auth;
    
    if (GOOGLE_CLOUD_CREDENTIALS) {
      // 環境変数から認証情報を取得
      const credentials = JSON.parse(GOOGLE_CLOUD_CREDENTIALS);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/monitoring.read']
      });
    } else {
      console.warn('GOOGLE_CLOUD_CREDENTIALSが設定されていません。デフォルトの認証を試みます。');
      // デフォルトの認証を試みる
      auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/monitoring.read']
      });
    }
    
    const client = await auth.getClient();
    const monitoring = google.monitoring({
      version: 'v3',
      auth: client
    });
    
    // 現在の日付と24時間前の日付を取得
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // タイムスタンプをRFC3339形式に変換
    const endTime = now.toISOString();
    const startTime = oneHourAgo.toISOString();
    
    // メトリクスを取得
    const res = await monitoring.projects.timeSeries.list({
      name: `projects/${GOOGLE_CLOUD_PROJECT_ID}`,
      filter: 'metric.type="serviceruntime.googleapis.com/quota/allocation/usage" AND resource.type="consumer_quota" AND resource.labels.service="youtube.googleapis.com"',
      interval: {
        startTime,
        endTime
      }
    });
    
    // レスポンスからQuota使用量を抽出
    if (res.data && res.data.timeSeries && res.data.timeSeries.length > 0) {
      let maxQuotaUsage = 0;
      
      for (const timeSeries of res.data.timeSeries) {
        if (timeSeries.points && timeSeries.points.length > 0) {
          // 最新のポイントの値を取得
          const latestPoint = timeSeries.points[0];
          const quotaValue = parseInt(latestPoint.value.int64Value || 0);
          
          // 最大値を更新
          if (quotaValue > maxQuotaUsage) {
            maxQuotaUsage = quotaValue;
          }
        }
      }
      
      return maxQuotaUsage;
    }
    
    return 0; // データが見つからない場合は0を返す
    
  } catch (error) {
    console.error('YouTube APIクォータの使用量取得中にエラーが発生しました:', error);
    return null; // エラーの場合はnullを返す
  }
}

/**
 * フォールバックメソッド: API呼び出しでquotaの状態を確認する
 */
async function checkYouTubeApiStatus() {
  try {
    // YouTube APIのリクエスト回数をCounterとして取得するための変数
    let estimatedQuotaCost = 0;
    
    // channels.listリクエスト（コスト: 1ユニット）
    const channelsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${YOUTUBE_API_KEY}`
    );
    
    if (!channelsResponse.ok) {
      const error = await channelsResponse.json();
      if (error.error && error.error.errors && error.error.errors[0].reason === 'quotaExceeded') {
        return {
          status: 'exceeded',
          usage: FREE_TIER_LIMITS.DAILY_QUOTA
        };
      }
      return { status: 'error', usage: 0 };
    }
    
    // リクエストが成功したら、コストを加算
    estimatedQuotaCost += QUOTA_COSTS.CHANNELS_LIST;
    
    return { 
      status: 'ok', 
      usage: estimatedQuotaCost
    };
  } catch (error) {
    console.error('YouTube API状態確認中にエラーが発生:', error);
    return { status: 'error', usage: 0 };
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
    const blocks = [
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
            ? `現在の使用状況：\n${warnings.map(w => `• *${w.resource}*: ${w.usage}/${w.limit} (${w.percentage}%)`).join('\n')}`
            : `YouTube Data APIの使用量が警告閾値（${FREE_TIER_LIMITS.WARNING_THRESHOLD}%）を超えています：\n${warnings.map(w => `• *${w.resource}*: ${w.usage}/${w.limit} (${w.percentage}%)`).join('\n')}`
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
    ];
    
    const payload = {
      blocks: blocks
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

/**
 * YouTube Data APIの使用量を監視する
 */
async function monitorYouTubeApiUsage() {
  if (!YOUTUBE_API_KEY) {
    console.error('環境変数が設定されていません: YOUTUBE_API_KEY');
    process.exit(1);
  }

  try {
    // Google Cloud APIを使ってQuota使用量を取得
    let quotaUsed = null;
    let status = 'ok';
    
    // Google Cloud認証情報がある場合のみCloud APIを使用
    if (GOOGLE_CLOUD_CREDENTIALS && GOOGLE_CLOUD_CREDENTIALS !== '{"type":"service_account","project_id":"ideatube","private_key_id":"private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n","client_email":"youtube-api-monitor@ideatube.iam.gserviceaccount.com","client_id":"client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/youtube-api-monitor%40ideatube.iam.gserviceaccount.com","universe_domain":"googleapis.com"}') {
      try {
        quotaUsed = await getYouTubeQuotaUsage();
      } catch (cloudError) {
        console.error('Google Cloud APIでの取得に失敗:', cloudError);
        quotaUsed = null;
      }
    } else {
      console.log('有効なGOOGLE_CLOUD_CREDENTIALS環境変数が設定されていないため、Cloud APIは使用しません。');
    }
    
    // Cloud APIでの取得に失敗したか、使用しない場合はテストリクエストでステータスを確認
    if (quotaUsed === null) {
      console.log('YouTube APIステータスを直接チェックします。');
      const apiStatus = await checkYouTubeApiStatus();
      status = apiStatus.status;
      quotaUsed = apiStatus.usage;
    }
    
    // クォータ使用率の計算
    const quotaPercentage = (quotaUsed / FREE_TIER_LIMITS.DAILY_QUOTA) * 100;
    
    // 警告メッセージを作成
    const warnings = [];
    const isWarning = quotaPercentage > FREE_TIER_LIMITS.WARNING_THRESHOLD || status === 'exceeded';
    
    if (isWarning) {
      warnings.push({
        resource: 'YouTube Data API',
        usage: quotaUsed,
        limit: FREE_TIER_LIMITS.DAILY_QUOTA,
        percentage: status === 'exceeded' ? '100' : quotaPercentage.toFixed(1)
      });
      
      console.log(`YouTube APIの使用量が閾値を超えています: ${quotaPercentage.toFixed(1)}%`);
    } else {
      console.log(`YouTube APIの使用量は正常です: ${quotaPercentage.toFixed(1)}%`);
    }
    
    // Slack通知の送信
    if (SLACK_WEBHOOK_URL) {
      if (isWarning) {
        await sendSlackAlert('YouTube API使用量警告', warnings);
      } else {
        await sendSlackAlert('YouTube API使用量 正常', [{
          resource: 'ステータス',
          usage: quotaUsed,
          limit: FREE_TIER_LIMITS.DAILY_QUOTA,
          percentage: quotaPercentage.toFixed(1)
        }]);
      }
    }
    
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