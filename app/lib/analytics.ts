import { type Metric } from 'web-vitals';

/**
 * Web Vitalsの計測結果をレポートする関数
 * 
 * @param metric - Web Vitalsの計測メトリクス
 * - CLS (Cumulative Layout Shift): 視覚的な安定性
 * - FID (First Input Delay): インタラクティブ性
 * - LCP (Largest Contentful Paint): 読み込みパフォーマンス
 * - FCP (First Contentful Paint): 初期表示速度
 * - TTFB (Time to First Byte): サーバーレスポンス時間
 */
export function reportWebVitals(metric: Metric) {
  // 開発環境の場合はコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vitals: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: metric.delta,
    });
    return;
  }

  // 本番環境の場合はAPIエンドポイントに送信
  const body = JSON.stringify({
    metric: {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType
    },
    // ページ情報
    page: window.location.pathname,
    // タイムスタンプ
    timestamp: Date.now(),
  });

  try {
    // `navigator.sendBeacon()`が利用可能な場合はそちらを使用
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', body);
    } else {
      // フォールバックとしてfetchを使用
      fetch('/api/analytics/vitals', {
        body,
        method: 'POST',
        keepalive: true,
      });
    }
  } catch (err) {
    console.error('Failed to send Web Vitals:', err);
  }
} 