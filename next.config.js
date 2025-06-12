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
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '**',
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
   * キャッシュ戦略の設定
   */
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
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
          {
            key: 'Content-Security-Policy',
            value: (() => {
              // 開発環境かどうかを判定（NODE_ENVが未設定の場合も開発環境として扱う）
              const isDevelopment = process.env.NODE_ENV !== 'production';
              console.log(`CSP設定: NODE_ENV=${process.env.NODE_ENV}, isDevelopment=${isDevelopment}`);
              
              // script-srcを個別に構築
              const scriptSrc = isDevelopment 
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
                : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com";
              
              const cspPolicy = [
                "default-src 'self'",
                scriptSrc,
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data:",
                "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://va.vercel-scripts.com",
                "frame-src 'self' https://www.youtube.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'self'"
              ].join('; ');
              
              console.log(`生成されたCSPポリシー: ${cspPolicy}`);
              return cspPolicy;
            })()
          },
        ],
      },
    ]
  },
}

export default nextConfig 