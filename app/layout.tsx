import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import HeaderAuth from "@/components/header-auth"
import { Twitter } from "lucide-react"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { reportWebVitals as reportWebVitalsMetric } from './lib/analytics'

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeSwitcher } from "@/components/theme-switcher"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://voutube.vercel.app'),
  title: "IdeaTube - YouTuberと視聴者を繋ぐ企画プラットフォーム",
  description: "YouTuberと視聴者を繋ぐ、新しい企画プラットフォーム。あなたのアイデアが、次のバズる動画を創ります。",
  keywords: "YouTube, 企画, アイデア, クリエイター, 視聴者, プラットフォーム",
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
    description: "YouTuberと視聴者を繋ぐ、新しい企画プラットフォーム。あなたのアイデアが、次のバズる動画を創ります。",
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
    description: "YouTuberと視聴者を繋ぐ、新しい企画プラットフォーム。あなたのアイデアが、次のバズる動画を創ります。",
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

// Web Vitalsの計測を有効化
export function reportWebVitals(metric: any) {
  reportWebVitalsMetric(metric);
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
              "description": "YouTuberと視聴者を繋ぐ、新しい企画プラットフォーム。あなたのアイデアが、次のバズる動画を創ります。",
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
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
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
                  <span className="hidden sm:inline text-lg">IdeaTube</span>
                </Link>
              </div>
              {/* 右側：認証関連 */}
              <div className="flex items-center">
                <HeaderAuth />
              </div>
            </div>
          </nav>

          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              {children}

              {/* フッター */}
              <footer className="w-full flex flex-col items-center justify-center border-t mx-auto text-center text-xs gap-4 py-16">
                <div className="flex gap-8 items-center">
                  <Link
                    href="https://x.com/kmrmsys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    <Twitter size={16} />
                  </Link>
                  <Link href="/terms" className="hover:underline">利用規約</Link>
                  <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
                </div>
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
