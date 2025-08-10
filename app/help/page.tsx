import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "ヘルプ・サポート - IdeaTube",
  description: "IdeaTubeのヘルプ・サポートページです。よくある質問、トラブルシューティング、問い合わせ先をご案内します。",
}

export default async function HelpPage() {
  const lastModified = await getFileLastModified('help/page.tsx')

  return (
    <main className="relative overflow-hidden">
      {/* Background Elements - トップページと同じ背景デザイン */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ヘルプ・サポート
            </h1>
            <p className="text-gray-600 dark:text-gray-300">最終更新日: {lastModified}</p>
          </div>

          <div className="space-y-8">
            {/* はじめに */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  1. はじめに
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  IdeaTubeの使い方やよくある質問、トラブル時の対処方法をまとめています。お困りの際はまず本ページをご確認ください。
                </p>
              </CardContent>
            </Card>

            {/* カテゴリ */}
            <div>
              <h2 className="sr-only">カテゴリ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/help/about" className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md" aria-label="IdeaTubeについて">
                  <Card className="hover:shadow-md group-hover:shadow-md cursor-pointer transition-shadow bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      IdeaTubeについて
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 text-sm text-gray-600 dark:text-gray-300">
                    各種使い方や基本情報のガイド
                  </CardContent>
                  </Card>
                </Link>

                <Card className="hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      支援者の方へ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 text-sm text-gray-600 dark:text-gray-300">
                    支援方法や支援時のトラブル対応
                  </CardContent>
                </Card>

                <Link href="/help/start-project" className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md" aria-label="プロジェクトをはじめたい方へ">
                  <Card className="hover:shadow-md group-hover:shadow-md cursor-pointer transition-shadow bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        プロジェクトをはじめたい方へ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 text-sm text-gray-600 dark:text-gray-300">
                      プロジェクト作成や審査の基本
                    </CardContent>
                  </Card>
                </Link>

                <Card className="hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      プロジェクトを公開した方へ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 text-sm text-gray-600 dark:text-gray-300">
                    公開後の運用やよくある疑問
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      コミュニティ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 text-sm text-gray-600 dark:text-gray-300">
                    コメントや共有などのトピック
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      お知らせ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 text-sm text-gray-600 dark:text-gray-300">
                    新機能や重要なお知らせ
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* よくある質問（FAQ） */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. よくある質問（FAQ）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <div>
                  <p className="font-semibold">Q. ログインできません（Googleアカウント）</p>
                  <p className="mt-1">Googleアカウントでの認証のみ対応しています。シークレットウィンドウでの再試行、Google側のセキュリティ設定の確認、別ブラウザでのログインをお試しください。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. 支援のキャンセルはできますか？</p>
                  <p className="mt-1">原則として確定後の支援はキャンセルできません。入力内容と金額をご確認のうえお手続きください。誤入力等の緊急時はサポートまでご相談ください。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. 支援完了のお知らせメールが届きません</p>
                  <p className="mt-1">迷惑メールフォルダーや受信設定をご確認ください。改善しない場合はご利用のメールアドレスとともにサポートまでご連絡ください。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. 支援時に登録した届け先・備考欄の情報を変更したい</p>
                  <p className="mt-1">プロジェクトの進行状況によって対応可否が異なります。できるだけ早くサポートまでお問い合わせください。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. 支援したプロジェクトのリターンが届きません</p>
                  <p className="mt-1">プロジェクトページの更新情報をご確認ください。未解決の場合は、支援日時・プロジェクト名を添えてサポートまでご連絡ください。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. 領収書を発行してほしい</p>
                  <p className="mt-1">個別に対応します。支援完了メールと併せてサポートまでお問い合わせください。</p>
                </div>
                <div>
                  <p className="font-semibold">Q. 退会（アカウント削除）はできますか？</p>
                  <p className="mt-1">退会のご希望はサポートにて承ります。ご本人確認のうえ対応いたします。</p>
                </div>
              </CardContent>
            </Card>

            {/* トラブルシューティング */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. トラブルシューティング
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>画面が表示されない場合：ブラウザのキャッシュを削除し、再読み込みしてください。</li>
                  <li>メールが届かない場合：迷惑メールフォルダーをご確認ください。</li>
                  <li>支払いでエラーになる場合：カード情報・残高・利用制限をご確認の上、時間をおいて再度お試しください。</li>
                </ul>
              </CardContent>
            </Card>

            {/* お問い合わせ */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. お問い合わせ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  個別サポートが必要な場合は <span className="font-semibold">team@ideatube.net</span> までご連絡ください。
                </p>
              </CardContent>
            </Card>

            {/* 関連ポリシー */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. 関連ポリシー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li><a href="/terms" className="underline hover:text-blue-600">利用規約</a></li>
                  <li><a href="/privacy" className="underline hover:text-blue-600">プライバシーポリシー</a></li>
                  <li><a href="/specified-commercial-code" className="underline hover:text-blue-600">特定商取引法に基づく表記</a></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}


