/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * 画像最適化の設定
   * 
   * YouTube APIから取得する画像を表示するために
   * 外部ドメインの画像を許可しています。
   * yt3.ggpht.com: YouTubeのチャンネルアイコン用
   * i.ytimg.com: YouTubeのサムネイル画像用
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb'
    }
  },
  /**
   * Vercelのアナリティクス設定
   * 
   * SpeedInsightsとWebVitalsの計測を有効化します
   * - SpeedInsights: ページの読み込み速度やパフォーマンスを計測
   * - WebVitals: Core Web Vitals（LCP、FID、CLS）を計測
   */
  analyticsId: true,
  speedInsights: {
    enabled: true,
  },
  /**
   * パフォーマンス最適化の設定
   */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  /**
   * キャッシュ戦略の設定
   */
  headers: async () => {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig 