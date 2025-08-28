import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "利用規約 - IdeaTube",
  description: "IdeaTubeの利用規約です。",
}

export default async function TermsPage() {
  const lastModified = await getFileLastModified('terms/page.tsx')
  
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
              利用規約
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              最終更新日: {lastModified}
            </p>
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
                  この利用規約（以下「本規約」）は、当サービス（以下「本サービス」）の利用条件を定めるものです。
                  ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
                </p>
              </CardContent>
            </Card>

            {/* 定義 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. 定義
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  本規約において使用する用語の定義は、以下の通りとします：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・「ユーザー」とは、本サービスを利用する全ての方を指します。</li>
                  <li>・「コンテンツ」とは、テキスト、画像、動画等、本サービスで投稿・共有される全ての情報を指します。</li>
                </ul>
              </CardContent>
            </Card>

            {/* 利用登録 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. 利用登録
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  本サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を行う必要があります。
                </p>
              </CardContent>
            </Card>

            {/* 禁止事項 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. 禁止事項
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・法令または公序良俗に違反する行為</li>
                  <li>・犯罪行為に関連する行為</li>
                  <li>・他のユーザーの権利を侵害する行為</li>
                  <li>・本サービスの運営を妨害する行為</li>
                  <li>・他のユーザーに迷惑をかける行為</li>
                </ul>
              </CardContent>
            </Card>

            {/* 知的財産権 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. 知的財産権
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  本サービスに関する知的財産権は、全て運営者に帰属します。
                  ユーザーは、自身が投稿したコンテンツについて、本サービスでの利用に必要な権利を運営者に許諾するものとします。
                </p>
              </CardContent>
            </Card>

            {/* クラウドファンディング機能 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  6. クラウドファンディング機能
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  本サービスでは、クラウドファンディング機能を提供します。以下の条項に従ってご利用ください：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・プロジェクトの投稿者は、正確で適法な情報を提供する責任があります。</li>
                  <li>・支援者は、プロジェクトの成功を保証するものではないことを理解の上で支援を行ってください。</li>
                  <li>・All in型を採用しており、目標金額の達成に関わらず、集まった支援金が支払われます。</li>
                  <li>・決済はStripeを通じて行われ、決済手数料は運営が負担いたします。</li>
                  <li>・企画者への報酬還元：クラウドファンディング成功時、企画を考案した投稿者に対して集まった資金の3%が報酬として還元されます。</li>
                  <li>・報酬還元の最低額は5万円以上とし、この金額に満たない場合は報酬の支払いは行いません。</li>
                  <li>・報酬は毎月15日に、前月末までに確定した分が支払われます。</li>
                </ul>
              </CardContent>
            </Card>

            {/* 免責事項 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  7. 免責事項
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  運営者は、本サービスに関して、以下の事項について一切の責任を負いません：
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・本サービスの利用により生じた損害</li>
                  <li>・本サービスで提供される情報の完全性、正確性、有用性</li>
                  <li>・本サービスの停止、中断、終了</li>
                </ul>
              </CardContent>
            </Card>

            {/* 規約の変更 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  8. 規約の変更
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  運営者は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。
                  変更後の規約は、本サービス上に表示した時点で効力を生じるものとします。
                </p>
              </CardContent>
            </Card>

            {/* 準拠法・管轄裁判所 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  9. 準拠法・管轄裁判所
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  本規約の解釈にあたっては、日本法を準拠法とします。
                  本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 