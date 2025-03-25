import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Web Vitalsの評価基準
 * https://web.dev/vitals/ より
 */
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ミリ秒
  FID: { good: 100, poor: 300 },   // ミリ秒
  CLS: { good: 0.1, poor: 0.25 },  // スコア
  FCP: { good: 1800, poor: 3000 }, // ミリ秒
  TTFB: { good: 800, poor: 1800 }, // ミリ秒
};

/**
 * Web Vitalsデータを受け取るAPIエンドポイント
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, page, timestamp } = body;

    // メトリクスの評価を行う
    const threshold = VITALS_THRESHOLDS[metric.name as keyof typeof VITALS_THRESHOLDS];
    if (threshold && metric.rating === 'poor') {
      // Slackに通知を送信（パフォーマンスが悪い場合のみ）
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `⚠️ パフォーマンス警告: ${metric.name}`,
                  emoji: true,
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*ページ:*\n${page}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*値:*\n${metric.value.toFixed(2)}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*評価:*\n${metric.rating}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*閾値:*\n良: ${threshold.good}, 不良: ${threshold.poor}`
                  }
                ]
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `発生時刻: ${new Date(timestamp).toLocaleString('ja-JP')}`
                  }
                ]
              }
            ]
          }),
        });
      }
    }

    // 開発環境の場合はコンソールにも出力
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals Report:', {
        metric,
        page,
        timestamp: new Date(timestamp).toLocaleString('ja-JP'),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web Vitals APIエラー:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 