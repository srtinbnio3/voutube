import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "プロジェクトをはじめたい方へ - ヘルプ",
  description: "IdeaTubeでプロジェクトを開始する際の基本、審査、リターン設定、公開までの流れを解説します。",
}

export default async function HelpStartProjectPage() {
  const lastModified = await getFileLastModified('help/start-project/page.tsx')

  return (
    <main className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">プロジェクトをはじめたい方へ</h1>
            <p className="text-gray-600 dark:text-gray-300">最終更新日: {lastModified}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">プロジェクト立ち上げ前に</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 dark:text-gray-300">
                <ul className="list-disc pl-6 space-y-2">
                  <li>オーナーの責任：支援者への説明責任、進捗共有、リターンの履行</li>
                  <li>掲載要件：公序良俗に反しないこと、実現可能性とリスクの明記</li>
                  <li>手数料：決済手数料等が発生します（Stripe利用）</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">プロジェクト作成の流れ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-700 dark:text-gray-300">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Googleアカウントでサインイン</li>
                  <li>タイトル・概要・目標金額・期間を入力</li>
                  <li>画像・動画・ストーリーを追加</li>
                  <li>リターン（特典）を設定</li>
                  <li>審査依頼を送信</li>
                </ol>
              </CardContent>
            </Card>

            {/* カード全体をクリック可能にするために Link でラップします */}
            <Link
              href="/help/start-project/review"
              aria-label="審査についての詳細を見る"
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
            >
              <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">審査について</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>審査は実現性・適法性・安全性・表現の妥当性を基準に行います。期間は通常数営業日です。</p>
                  <p>必要に応じて追加資料の提出をお願いする場合があります。詳細はこちら。</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">リターン設定のポイント</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 dark:text-gray-300">
                <ul className="list-disc pl-6 space-y-2">
                  <li>実現可能な内容・スケジュールで設定する</li>
                  <li>在庫や数量に上限がある場合は限定数を設定</li>
                  <li>特定商取引法に基づく表示や配送情報を明確に</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">公開に向けて</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700 dark:text-gray-300">
                <ul className="list-disc pl-6 space-y-2">
                  <li>公開前プレビューで内容を最終確認</li>
                  <li>SNS共有素材や説明文を用意し初動の拡散を計画</li>
                  <li>公開後の更新計画（週次の進捗共有など）を準備</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}


