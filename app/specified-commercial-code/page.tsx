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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950 dark:via-gray-900 dark:to-blue-950">
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
                  <p className="text-gray-600 dark:text-gray-300">福岡県</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">メールアドレス</h3>
                  <p className="text-gray-600 dark:text-gray-300">team@ideatube.net</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">電話番号</h3>
                  <p className="text-gray-600 dark:text-gray-300">お問い合わせはメールにてお願いいたします</p>
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
                <p className="text-gray-600 dark:text-gray-300">
                  クレジットカード決済（Visa、Mastercard、American Express、JCB）
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">手数料等の追加料金</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  クラウドファンディング機能利用時：決済手数料（Stripe手数料）が別途発生いたします
                </p>
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
                  なし（ただし、クラウドファンディング機能利用時は決済手数料が発生）
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
                  プロジェクト終了前までキャンセル可能です。プロジェクト終了後の返金はできません。
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">プロジェクトの失敗時</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  目標金額に達しない場合、支援金は全額返金されます。
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
                  クラウドファンディング成功時、企画を考案した投稿者に対して集まった資金の3%が報酬として還元されます。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">最低報酬還元額</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  報酬還元の最低額は5万円以上とし、この金額に満たない場合は報酬の支払いは行いません。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">報酬の支払い</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  報酬は毎月15日に、前月末までに確定した分が支払われます。
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
  )
} 