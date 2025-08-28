import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | IdeaTube",
  description: "IdeaTubeの特定商取引法に基づく表記です。",
}

export default async function SpecifiedCommercialCodePage() {
  const lastModified = await getFileLastModified('specified-commercial-code/page.tsx')
  
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
              特定商取引法に基づく表記
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              最終更新日: {lastModified}
            </p>
          </div>

          <div className="space-y-8">
            {/* 事業者情報 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  事業者の名称
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">事業者名</h3>
                    <p className="text-gray-600 dark:text-gray-300">IdeaTube</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">代表者名</h3>
                    <p className="text-gray-600 dark:text-gray-300">木村 正義</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">事業形態</h3>
                    <p className="text-gray-600 dark:text-gray-300">個人事業主</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">事業内容</h3>
                    <p className="text-gray-600 dark:text-gray-300">インターネットサービス業</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 連絡先情報 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  連絡先情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">所在地</h3>
                    <p className="text-gray-600 dark:text-gray-300">〒812-0011<br />福岡県福岡市博多区博多駅前1丁目23番2号<br />ParkFront博多駅前1丁目5F-B</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">メールアドレス</h3>
                    <p className="text-gray-600 dark:text-gray-300">team@ideatube.net</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">電話番号</h3>
                    <p className="text-gray-600 dark:text-gray-300">請求があった場合は遅滞なく開示します</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">URL</h3>
                    <p className="text-gray-600 dark:text-gray-300">https://www.ideatube.net</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 取引条件 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  取引条件
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">決済方法</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  クレジットカード決済（Visa、Mastercard、American Express、JCB）
                </p>
                
                {/* クレジットカードロゴ */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <span className="text-blue-600 font-bold text-lg">VISA</span>
                  </div>
                  <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <span className="text-red-600 font-bold text-lg">Mastercard</span>
                  </div>
                  <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <span className="text-blue-500 font-bold text-lg">AMEX</span>
                  </div>
                  <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <span className="text-green-600 font-bold text-lg">JCB</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                  決済通貨：日本円（JPY）
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">セキュリティについて</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  当サービスはSSL/TLS暗号化通信（HTTPS）を使用し、Stripe社のPCI DSS準拠決済システムを採用しています。お客様のクレジットカード情報は当サービスで保存されません。
                </p>
              </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">手数料等の追加料金</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    クラウドファンディング機能利用時：運営手数料は支援金から控除されます（運営手数料11%には決済手数料を含みます）。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">プロジェクトオーナーが支払う対価</h3>
                  <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                    <li>運営手数料：支援金の11%（決済手数料を含む）。支援金から控除されます。</li>
                    <li>企画者報酬：当該プロジェクトの支援金が5万円以上集まった場合に限り、支援金の3%を企画者へ還元（支援金から控除）。</li>
                    <li>手数料合計：条件充足時は合計14%（運営手数料11%＋企画者報酬3%）、未達時は11%が控除されます。</li>
                    <li>返金・チャージバック・不正検知等が生じた場合の関連費用は、原則としてプロジェクトオーナーの負担となり、当社は支払留保・相殺等の調整を行うことがあります。</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">申込みの有効期限</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    クラウドファンディングプロジェクトの募集期間内
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">商品代金以外の必要料金</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    支援者が負担する追加料金はありません。決済手数料等は支援金から控除され、プロジェクトオーナーへの支払額に反映されます。
                  </p>
                </div>
              </CardContent>
            </Card>

                      {/* 返品・キャンセルポリシー */}
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                返品・キャンセルポリシー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">クラウドファンディング支援のキャンセル</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  支援完了後のお支払いのキャンセルは原則お受けしておりません。<br/>
                  ただし、法令により認められる場合、およびサービスごとの細則において定める場合に限り支援のキャンセルが可能です。
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">配送・フルフィルメント</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  デジタルサービスのため物理的な配送はありません。特典がある場合は、プロジェクトオーナーが直接支援者に提供します。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">返金処理</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  返金が承認された場合、決済に使用したクレジットカードに30営業日以内に返金されます。返金手数料は発生しません。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">プロジェクト中止時の対応</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  プロジェクトがIdeaTube上で中止・停止された場合、支援金がまだIdeaTubeに預けられている段階であれば、支援者に全額返金されます。これは、プロジェクトオーナーに支援金がまだ支払われていない場合です。<br/><br/>
                  もし支援金がすでにプロジェクトオーナーに支払われている場合は、返金が保証されません。リターンの履行ができなくなった場合でも、支援者が返金を受けられないケースもあります。この場合、支援者とプロジェクトオーナー間で解決する必要があります。
                </p>
              </div>
            </CardContent>
          </Card>

            {/* 運送時の損害の責任所在 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  運送時の損害の責任所在
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  デジタルサービスを提供するため、物理的な運送は行いません。
                </p>
              </CardContent>
            </Card>

            {/* クラウドファンディング特記事項 */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  クラウドファンディング特記事項
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">プロジェクトの形式</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    All in型：目標金額の達成に関わらず、集まった支援金を受け取る方式を採用しています。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">企画者への報酬還元</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    当社が認定した企画者に対し、当該プロジェクトの支援金に対して<strong>3%</strong>を報酬として還元します（当社所定の条件に基づき、決済事業者の要件等を含みます）。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">最低報酬還元額</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    企画者報酬は、当該プロジェクトの支援金が<strong>5万円以上</strong>集まった場合に限り還元します。<br />
                    5万円未満の場合は、企画者報酬の支払いは行いません。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">報酬の支払い</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    原則毎月15日（銀行営業日でない場合は翌営業日）に、前月末までに確定した金額を支払います。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">支援金の支払い</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    募集終了日に自動的に振込申請が行われ、振込申請日当月末締めにてIdeaTube側で入金手配を行い、翌月末日にお振込をする（※土日祝の場合は前営業日）流れとなっております。<br /><br />
                    ＜例＞<br />
                    2025/8/25に募集終了 → 2025/9/30に振込<br />
                    2025/8/31に募集終了 → 2025/9/30に振込
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">リスクについて</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    クラウドファンディングは投資ではありません。プロジェクトの成功を保証するものではありません。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 