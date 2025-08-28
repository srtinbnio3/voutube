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
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  本サービスに関する知的財産権は、全て運営者に帰属します。
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  ユーザーは、自身が投稿したコンテンツについて、当社が本サービスの提供・運営・改善・広告宣伝のために必要な範囲で、全世界的・非独占・無償・譲渡可能・再許諾可能な利用（複製、翻案、編集、公衆送信、頒布等）を期間の定めなく許諾し、当該コンテンツに関する著作者人格権を行使しないものとします。
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
                  <li>・支援者は、プロジェクトの成功やリターンの履行が保証されないことを理解の上で支援を行ってください。</li>
                  <li>・All in型を採用しており、目標金額の達成有無にかかわらず、決済が確定した支援金は支払われます。</li>
                  <li>・決済はStripe等の決済事業者を通じて行われます。決済手数料は運営手数料に含まれ、支援金から控除されます。手数料率は事前の告知の上で変更される場合があります。</li>
                  <li>・運営手数料：現時点では集まった資金の11%（決済手数料を含む）を運営手数料として頂戴します。</li>
                  <li>・企画者への報酬還元：当社が認定した企画者に対し、当社基準を満たした場合に限り、集まった資金の3%を上限等当社所定の条件で報酬として還元します（税・手数料控除後、当社裁量で変更・停止する場合があります）。</li>
                  <li>・企画者報酬の支払条件：当該プロジェクトの支援金が5万円以上集まった場合に限り、企画者への報酬還元を行います（満たない場合は支払いを行いません）。</li>
                  <li>・手数料合計：原則として、運営手数料11%と企画者報酬3%の合計14%が支援金から差し引かれます（企画者報酬の支払条件を満たさない場合の控除合計は11%）。</li>
                  <li>・支払条件：本人確認（KYC）、税情報・銀行口座の確認、決済事業者の要件および当社のコンプライアンス審査の完了後に限り、原則毎月15日（銀行営業日でない場合は翌営業日）に、前月末までに確定した金額を支払います。当社はリスク管理のため留保・引当・相殺を行う場合があります。</li>
                  <li>・返金・チャージバック・不正検知等が生じた場合、関連費用・手数料は原則としてプロジェクト投稿者の負担とし、当社は支払停止・留保・相殺により調整できるものとします。</li>
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

            {/* 利用停止・削除等 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  10. 利用停止・削除等
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  当社は、ユーザーが本規約に違反した場合又は当社が必要と判断した場合、事前の通知なく、コンテンツの削除、アカウントの一時停止・利用停止、登録抹消、ログ等の保全・開示その他必要な措置を講じることができます。
                </p>
              </CardContent>
            </Card>

            {/* 責任の制限 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  11. 責任の制限
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・法令により制限される場合を除き、間接損害、特別損害、結果的損害、逸失利益等について当社は責任を負いません。</li>
                  <li>・当社の賠償責任が認められる場合でも、当社の総責任は、当該請求の原因が生じた時点から遡って直近12ヶ月間にユーザーから当社が受領した本サービスに係る手数料総額を上限とします。</li>
                </ul>
              </CardContent>
            </Card>

            {/* 表明保証および補償（Indemnity） */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  12. 表明保証および補償
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  ユーザーは、法令・本規約・第三者の権利に違反しないことを表明保証し、ユーザーの行為・コンテンツに起因して第三者との間で紛争・請求が生じた場合、当社を防御・補償・免責し、当社に生じた費用及び損害（合理的な弁護士費用を含む）を負担するものとします。
                </p>
              </CardContent>
            </Card>

            {/* 個人情報と第三者サービス */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  13. 個人情報と第三者サービス
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・個人情報の取扱いは当社のプライバシーポリシーに従います。</li>
                  <li>・Stripeその他の第三者サービスを利用する場合、当該事業者の規約・ポリシーが適用され、これらの変更に従うものとします。</li>
                </ul>
              </CardContent>
            </Card>

            {/* 未成年者 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  14. 未成年者の利用
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  未成年のユーザーは、親権者等の法定代理人の同意を得た上で本サービスを利用するものとします。
                </p>
              </CardContent>
            </Card>

            {/* サービスの変更・不可抗力 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  15. サービスの変更・不可抗力
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・当社は、運用上または技術上必要と判断した場合、事前の告知の有無を問わず、本サービスの全部又は一部を変更・停止・終了することができます。</li>
                  <li>・天災地変、停電、通信回線の障害、法令改正その他当社の合理的支配を超える事由により生じた不履行・遅延について、当社は責任を負いません。</li>
                </ul>
              </CardContent>
            </Card>

            {/* 雑則 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  16. 雑則
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>・ユーザーは、当社の事前の書面による承諾なく、本規約に基づく地位または権利義務を第三者に譲渡・担保提供できません。当社は事業譲渡等に伴い本規約上の地位を第三者に承継させることができます。</li>
                  <li>・本規約の一部が無効・取消し・執行不能と判断された場合でも、その他の部分は引き続き有効に存続します。</li>
                  <li>・本規約と個別規定・ポリシーとの間に矛盾がある場合、特段の定めがない限り個別規定・ポリシーが優先します。</li>
                  <li>・本規約は、本件に関する当社とユーザーとの完全な合意を構成します。</li>
                  <li>・本規約に基づき当社が行う通知は、アプリ内表示、電子メールその他当社が適当と認める方法により行います。</li>
                  <li>・税・公課は法令に従い取り扱い、消費税相当額は別途又は内税として課されます。</li>
                  <li>・本規約に基づき当然に存続すべき性質を有する条項（知的財産、免責・責任制限、補償、準拠法・管轄等）は、本規約終了後も有効に存続します。</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 