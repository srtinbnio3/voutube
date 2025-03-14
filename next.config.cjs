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
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
}

module.exports = nextConfig 