import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getFileLastModified } from "@/app/lib/file-utils"

export const metadata: Metadata = {
  title: "審査について - はじめかたヘルプ",
  description: "IdeaTubeにおけるプロジェクト審査の基準、必要書類、所要期間、よくある差し戻し理由について説明します。",
}

export default async function HelpStartProjectReviewPage() {
  const lastModified = await getFileLastModified('help/start-project/review/page.tsx')

  return (
    <main className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
      </div>

      <div className="relative min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Link href="/help/start-project" className="text-sm text-purple-700 dark:text-purple-300 hover:underline">← プロジェクトをはじめたい方へ に戻る</Link>
          </div>

          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">審査について</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">最終更新日: {lastModified}</p>
            </CardHeader>
            <CardContent className="space-y-8 text-gray-800 dark:text-gray-200">
              <section>
                <h2 className="text-lg font-semibold mb-3">審査の目的</h2>
                <p className="leading-7">IdeaTubeでは、支援者が安心して参加できる環境を維持するため、公開前にプロジェクトの内容を確認します。創作・社会性のある挑戦を応援するという理念のもと、実現可能性と透明性を重視します。</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">審査基準</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-medium">実現可能性</span>：計画・体制・スケジュールが現実的で、リスクの説明があること</li>
                  <li><span className="font-medium">適法性</span>：知的財産権・景品表示・薬機・古物・酒類等、関連法令に抵触しないこと</li>
                  <li><span className="font-medium">安全性</span>：危険物・医療行為・過度な危険を伴う内容でないこと</li>
                  <li><span className="font-medium">表現の妥当性</span>：差別的・攻撃的・過激・公序良俗に反する表現でないこと</li>
                  <li><span className="font-medium">透明性</span>：目的・資金使途・実行者情報・連絡手段が明確であること</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">必要な情報・書類</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>本人確認（Stripe Identity）および連絡先</li>
                  <li>プロジェクトの詳細（目的、計画、スケジュール、体制）</li>
                  <li>画像・動画・使用素材の権利関係の確認</li>
                  <li>リターン内容の詳細と履行方法（配送・デジタル配布等）</li>
                  <li>必要に応じて許認可・ライセンスの保有状況</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">審査の流れと目安期間</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>審査依頼の送信</li>
                  <li>内容確認（1〜3営業日程度）※混雑時は延びる場合があります</li>
                  <li>必要に応じた追加質問・修正依頼（往復）</li>
                  <li>公開可否のご案内</li>
                </ol>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">よくある差し戻し・修正依頼</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>権利未確認の画像・BGM・キャラクターの使用</li>
                  <li>医薬品的な効能効果、誤認を招く表現</li>
                  <li>過度に実現性の低いスケジュールや原価割れの設定</li>
                  <li>資金使途・実行体制の不透明さ、連絡手段の不足</li>
                  <li>リターンの配送条件・費用が不明確</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">審査に通りやすくするポイント</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>目的・背景・実績を簡潔にまとめ、画像と併せて伝える</li>
                  <li>リスク・課題と対応策を率直に明記する</li>
                  <li>数値入りのスケジュールと体制（誰が何をいつ）を提示する</li>
                  <li>第三者の知的財産の取り扱いを明確にする</li>
                  <li>リターンは無理のない数量・納期で設計する</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">注意事項</h2>
                <p className="leading-7">本ページは CAMPFIRE の審査基準を参考に、IdeaTube のコンテキストに合わせて要約・再構成したガイドです。最終的な掲載可否は当社ポリシーに基づき個別判断されます。</p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}


