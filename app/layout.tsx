import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";

// デフォルトのURLを設定（開発環境とデプロイ環境で切り替え）
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

// サイトのメタデータ設定
export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "IdeaTube",
  description: "YouTuberと視聴者を繋ぐ、新しい企画プラットフォーム",
};

// フォントの設定
const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {/* テーマプロバイダー：ダークモード対応 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              {/* ヘッダーナビゲーション */}
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  {/* 左側：ロゴとデプロイボタン */}
                  <div className="flex gap-3 sm:gap-5 items-center font-semibold">
                    {/* ロゴとサイト名 - レスポンシブ対応 */}
                    <Link href="/" className="flex items-center gap-1">
                      <Image
                        src="/icon-512x512.png"
                        alt="IdeaTube Logo"
                        width={24}
                        height={24}
                        className="sm:w-8 sm:h-8"  // モバイル時は小さく、デスクトップでは大きく
                      />
                      {/* スマホでは非表示、タブレット以上で表示 */}
                      <span className="hidden sm:inline text-lg">IdeaTube</span>
                    </Link>
                    {/* デプロイボタン - モバイルでは非表示 */}
                    <div className="hidden sm:flex items-center gap-2">
                      <DeployButton />
                    </div>
                  </div>
                  {/* 右側：認証関連 */}
                  <div className="flex items-center">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </div>
              </nav>

              {/* メインコンテンツ */}
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>

              {/* フッター */}
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  Powered by{" "}
                  <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
        {/* トースト通知 */}
        <Toaster />
      </body>
    </html>
  );
}
