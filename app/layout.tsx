import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import HeaderAuth from "@/components/header-auth"
import { Twitter } from "lucide-react"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeSwitcher } from "@/components/theme-switcher"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ideatube.net'),
  title: "IdeaTube（アイデアチューブ）",
  description: "あなたのアイデアが、次のバズる動画を創ります。推しYoutuberに企画を提案しましょう！",
  keywords: "IdeaTube, アイデアチューブ, YouTube, YouTuber, クラウドファンディング, ユーチューバー, ユーチューブ, 企画, 動画企画, アイデア, 企画案, 企画提案, クリエイター, 動画クリエイター, 視聴者, コミュニティ, プラットフォーム, バズる, バズ動画, 動画作成, 動画制作, 動画編集, 面白い動画, 人気動画, 企画募集, アイデア募集, 視聴者参加型, コラボ企画, 視聴者投票, エンタメ, エンターテインメント",
  authors: [{ name: "IdeaTube Team" }],
  creator: "IdeaTube Team",
  publisher: "IdeaTube",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ideatube.net",
    siteName: "IdeaTube",
    title: "IdeaTube - YouTuberと視聴者を繋ぐ企画プラットフォーム",
    description: "あなたのアイデアが、次のバズる動画を創ります。推しYoutuberに企画を提案しましょう！",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IdeaTube - YouTuberと視聴者を繋ぐ企画プラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IdeaTube - YouTuberと視聴者を繋ぐ企画プラットフォーム",
    description: "あなたのアイデアが、次のバズる動画を創ります。推しYoutuberに企画を提案しましょう！",
    images: ["/og-image.png"],
    creator: "@kmrmsys",
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="あなたのメタタグ" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "IdeaTube",
              "url": "https://ideatube.net",
              "description": "あなたのアイデアが、次のバズる動画を創ります。推しYoutuberに企画を提案しましょう！",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ideatube.net/channels?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "IdeaTube",
              "url": "https://ideatube.net",
              "logo": "https://ideatube.net/icon-512x512.png",
              "sameAs": [
                "https://x.com/kmrmsys"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* ヘッダーナビゲーション */}
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-transparent">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
              {/* 左側：ロゴとサイト名 */}
              <div className="flex gap-3 sm:gap-5 items-center font-semibold">
                <Link href="/" className="flex items-center gap-1">
                  <Image
                    src="/icon-512x512.png"
                    alt="IdeaTube Logo"
                    width={24}
                    height={24}
                    className="sm:w-8 sm:h-8"
                  />
                  <span className="text-lg">IdeaTube</span>
                </Link>
              </div>
              {/* 右側：認証関連 */}
              <div className="flex items-center">
                <HeaderAuth />
              </div>
            </div>
          </nav>

          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              {children}

              {/* フッター */}
              <footer className="w-full flex flex-col items-center justify-center border-t mx-auto text-center text-xs gap-4 py-8 bg-transparent">
                {/* 連絡先情報 */}
                <div className="flex flex-col sm:flex-row gap-4 items-center text-gray-600 dark:text-gray-400">
                  <span>お問い合わせ: team@ideatube.net</span>
                  <span>事業所: 福岡県</span>
                </div>
                
                {/* リンク */}
                <div className="flex flex-wrap gap-6 items-center justify-center">
                  <Link
                    href="https://x.com/kmrmsys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="w-4 h-4 fill-current"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </Link>
                  <Link href="/terms" className="hover:underline">利用規約</Link>
                  <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
                  <Link href="/specified-commercial-code" className="hover:underline">特定商取引法に基づく表記</Link>
                </div>
                
                {/* コピーライト */}
                <div className="flex items-center gap-8">
                  <p>
                    &copy; {new Date().getFullYear()} IdeaTube
                  </p>
                  <ThemeSwitcher />
                </div>
              </footer>
            </div>
          </main>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
