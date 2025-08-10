import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "IdeaTubeについて - ヘルプ",
  description: "IdeaTubeの概要、基本的な使い方、主な機能をご紹介します。",
}

export default async function HelpAboutPage() {
  const lastModified = await getFileLastModified('help/about/page.tsx')

  return (
    <main className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">IdeaTubeについて</h1>
            <p className="text-gray-600 dark:text-gray-300">最終更新日: {lastModified}</p>
          </div>

          <div className="space-y-8">
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">IdeaTubeとは</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  IdeaTubeは、視聴者のアイデアとクリエイターの制作をつなぐプラットフォームです。視聴者はYouTubeに投稿した動画企画を提案し、クリエイターは魅力的な企画を選んで実行できます。クラウドファンディング機能により、企画の実現に必要な資金を集めることも可能です。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">主な機能</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>チャンネルに対する企画アイデアの投稿・共有</li>
                  <li>アイデアへの投票・コメントによるフィードバック</li>
                  <li>クラウドファンディングによる資金調達（Stripe決済）</li>
                  <li>プロジェクト更新・支援者へのお知らせ</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">使いはじめるには</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Googleアカウントでサインイン（Google OAuthのみ対応）</li>
                  <li>興味のあるチャンネルを探し、企画を閲覧・提案</li>
                  <li>気に入ったプロジェクトがあれば支援を検討</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">よくある質問</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold">Q. アカウントは無料ですか？</p>
                  <p className="mt-1">はい、登録・利用は無料です。支援や決済時に手数料が発生する場合があります。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. ログイン方法は？</p>
                  <p className="mt-1">Googleアカウントのみ対応しています。メール/パスワードでのログインは提供していません。</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}


