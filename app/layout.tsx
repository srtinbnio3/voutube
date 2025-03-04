import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeSwitcher } from "@/components/theme-switcher"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IdeaTube",
  description: "YouTuberと視聴者を繋ぐ、新しい企画プラットフォーム",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              {children}

              {/* フッター */}
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  &copy; {new Date().getFullYear()} Masayoshi Kimura
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
