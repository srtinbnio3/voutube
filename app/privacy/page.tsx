import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "プライバシーポリシー - IdeaTube",
  description: "IdeaTubeのプライバシーポリシーです。",
}

export default async function PrivacyPage() {
  const lastModified = await getFileLastModified('privacy/page.tsx')
  
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
              プライバシーポリシー
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              最終更新日: {lastModified}
            </p>
          </div>

          <div className="space-y-8">
            {/* 基本方針 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  1. 基本方針
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスは、ユーザーのプライバシー保護を重要な責務と考え、個人情報の適切な取り扱いに努めます。
                  本プライバシーポリシーでは、当サービスにおける個人情報の収集・利用・管理について定めています。
                </p>
              </CardContent>
            </Card>

            {/* 収集する情報 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. 収集する情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスでは、以下の情報を収集する場合があります：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・アカウント情報（メールアドレス、ユーザー名等）</li>
                  <li>・プロフィール情報（アバター画像、自己紹介等）</li>
                  <li>・利用履歴（アクセスログ、投稿内容等）</li>
                  <li>・端末情報（IPアドレス、ブラウザの種類等）</li>
                  <li>・決済情報（Stripeを通じて処理され、当サービスでは直接保存しません）</li>
                  <li>・クラウドファンディング関連情報（プロジェクト内容、支援履歴等）</li>
                </ul>
              </CardContent>
            </Card>

            {/* 情報の利用目的 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. 情報の利用目的
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  収集した情報は、以下の目的で利用します：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・サービスの提供・運営</li>
                  <li>・ユーザーサポート</li>
                  <li>・サービスの改善・新機能の開発</li>
                  <li>・利用規約違反の調査・対応</li>
                  <li>・統計データの作成</li>
                </ul>
              </CardContent>
            </Card>

            {/* 情報の管理 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. 情報の管理
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスは、収集した個人情報の安全管理のために、以下の対策を実施します：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・不正アクセス防止のためのセキュリティ対策</li>
                  <li>・個人情報へのアクセス制限</li>
                  <li>・従業員への教育・監督</li>
                </ul>
              </CardContent>
            </Card>

            {/* 情報の第三者提供 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. 情報の第三者提供
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスは、以下の場合を除き、収集した個人情報を第三者に提供しません：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・ユーザーの同意がある場合</li>
                  <li>・法令に基づく場合</li>
                  <li>・人の生命、身体または財産の保護のために必要な場合</li>
                  <li>・決済処理のため、Stripeに必要な情報を提供する場合</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300">
                  決済処理については、Stripeのプライバシーポリシーが適用されます。
                </p>
              </CardContent>
            </Card>

            {/* Cookieの使用 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  6. Cookieの使用
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスでは、ユーザー体験の向上やサービスの改善のために、Cookieを使用します。
                  ユーザーはブラウザの設定でCookieの使用を制限することができます。
                </p>
              </CardContent>
            </Card>

            {/* ユーザーの権利 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  7. ユーザーの権利
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  ユーザーは、自己の個人情報について、以下の権利を有します：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・個人情報の開示請求</li>
                  <li>・個人情報の訂正・削除請求</li>
                  <li>・個人情報の利用停止請求</li>
                </ul>
              </CardContent>
            </Card>

            {/* お問い合わせ */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  8. お問い合わせ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  個人情報の取り扱いに関するお問い合わせは、contact@ideatube.netまでご連絡ください。
                </p>
              </CardContent>
            </Card>

            {/* プライバシーポリシーの変更 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  9. プライバシーポリシーの変更
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
                  重要な変更がある場合は、サービス上で通知します。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 