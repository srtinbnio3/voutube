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
                <h2 className="text-lg font-semibold mb-3">目的と適用範囲</h2>
                <p className="leading-7">本基準はIdeaTube上で公開されるクラウドファンディング・プロジェクト（以下、プロジェクト）の審査方針を示すものです。審査はプロジェクトの適法性・安全性・実現性・透明性・プラットフォーム適合性を確認する目的で実施します。本基準は予告なく改定される場合があります。</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">基本原則</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>法令遵守</li>
                  <li>公序良俗の尊重</li>
                  <li>安全性の確保</li>
                  <li>透明性の担保</li>
                  <li>権利侵害の排除</li>
                  <li>支援者保護</li>
                  <li>プラットフォーム（YouTube/Stripe 等）規約の遵守</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">審査観点</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">実行者適格性</h3>
                    <p className="leading-7">本人確認、連絡体制、過去の重大違反の有無、反社会的勢力との関係遮断。必要に応じて追加資料（登記事項証明書、許認可の写し等）を求める場合があります。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">企画の適法性・安全性</h3>
                    <p className="leading-7">迷惑行為・危険行為・法令違反を前提とする企画は不可。撮影・収録の際は、第三者の権利・安全・プライバシーを侵害しないこと。危険なチャレンジ、過度な心身リスク、未成年者への不適切な影響が想定される内容は不可。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">権利処理</h3>
                    <p className="leading-7">著作権・商標・肖像権・パブリシティ権・音源/映像素材・フォント・ロゴ・キャラクター等の利用許諾が必要な場合、適法なライセンス・許可を取得していること。YouTube動画での素材利用も同様。二次創作は原権利者のガイドラインに従い、許容範囲を逸脱しないこと。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">資金使途の明確性</h3>
                    <p className="leading-7">具体的かつ妥当な内訳を提示し、支援金の利用目的を明確化。人件費・外注費・備品・ロケ費・編集費・手数料等の内訳の整合性が求められます。使途が不明瞭、私的流用の疑義を生む記載は不可。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">実現可能性・スケジュール</h3>
                    <p className="leading-7">実施体制、協力会社/メンバー、必要な許認可、リスクと代替案、納期の根拠を明示。過度に楽観的な工程や非現実的な目標は不可。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">リターン（特典）の適法性・履行可能性</h3>
                    <p className="leading-7">仕様・納期・提供方法・数量制限・提供条件を明記。金銭（現金/仮想通貨）・高い換金性の金券・投資商品・利回り保証・酒類は不可。抽選/くじ等は原則不可（景品表示法・資金決済法等に抵触し得るため）。食品・医薬品・中古品等は関連法令と許認可に適合していること。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">説明の正確性・誇大表示の禁止</h3>
                    <p className="leading-7">効果の断定/過度な比較優良誤認/限定商法・無料表現の濫用/ステルスマーケティングは不可。医療・健康分野は根拠資料を前提に、薬機法に抵触する表現を禁止。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">プラットフォーム規約遵守</h3>
                    <p className="leading-7">YouTubeコミュニティガイドライン、著作権ポリシー、広告ポリシー、外部API規約、Stripe等の決済・禁止業種ポリシーに適合。投げ銭・チケット・抽選等の仕組み導入時は各規約と法令を両立させること。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">個人情報・プライバシー</h3>
                    <p className="leading-7">取得目的・範囲の最小化、適切な保管、第三者提供の管理、法令・ガイドラインへの適合。第三者の個人情報や機微情報の無断公開は禁止。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">未成年者の保護</h3>
                    <p className="leading-7">出演・参加時は保護者同意と安全配慮を必須とし、飲酒・喫煙・アダルト・ギャンブル等の不適切要素は不可。年齢確認が必要なリターン提供は不可または制限。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">動物・環境配慮</h3>
                    <p className="leading-7">動物福祉に反する行為、動物への危害、環境破壊を助長する内容は不可。必要な許認可・衛生管理・輸送/保管体制を確認。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">政治・宗教</h3>
                    <p className="leading-7">政治献金・選挙運動への直接的支援を目的とするもの、特定宗教への勧誘・布教を主目的とするものは不可。価値観や意見表明は表現の自由の範囲内で、差別・ヘイトを禁止。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">反社会的勢力の排除</h3>
                    <p className="leading-7">反社会的勢力および関連団体への利益供与に該当する内容は一切不可。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">YouTube企画の安全性</h3>
                    <p className="leading-7">危険行為・迷惑行為・ハラスメント・差別・嫌悪表現・虚偽検証・違法改造・不正アクセス・プラットフォーム規約違反を助長する挑戦企画は不可。撮影許可・場所のルール順守・周辺への配慮を必須。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">著作権/ライセンスの二重確認</h3>
                    <p className="leading-7">BGM/効果音/画像/フォント/素材配布サイトの利用規約、商用利用可否、再配布の可否、帰属表示の要否を事前整理。</p>
                  </div>
                  <div>
                    <h3 className="font-medium">決済・返金方針</h3>
                    <p className="leading-7">Stripeのポリシーに適合。</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">受付不可の代表例（非網羅）</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>違法行為/許認可未取得の提供（医療行為、医薬品/医療機器の販売、食品製造販売、酒類販売、古物営業、旅行手配、危険物/銃刀類、ドローン飛行の法令違反等）</li>
                  <li>投資/利回り保証/仮想通貨の配当・ICO/ねずみ講・情報商材・高額塾</li>
                  <li>現金/仮想通貨/高換金性金券の配布や還元、抽選/くじ/ギャンブル要素</li>
                  <li>アダルト/過度な暴力/自傷・自殺助長/いじめ・差別・ヘイト/動物虐待/危険・迷惑行為の助長</li>
                  <li>盗撮・無許可録音、プライバシー侵害、個人情報の売買、ステマ</li>
                  <li>他者の権利侵害（二次創作ガイドライン違反、ブランド偽造、無許諾の素材利用）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">表現・掲載ガイド</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>タイトル/サムネ/本文は事実に基づき、成果・安全・効果の断定表現は禁止。比較や「最安/日本一/世界一」等は客観的根拠必須。</li>
                  <li>リスク・実施体制・スケジュール・資金使途・リターン詳細・免責・問い合わせ先を明記。限定/早割/在庫表現は数量根拠必須。</li>
                  <li>画像/動画: 暴力的・グロテスク・露骨な性的表現・差別的表現・誤解を招く加工は禁止。第三者の映り込みは許諾を得るか識別不能化。</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">審査プロセス（目安）</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>申請</li>
                  <li>事前確認（3-5営業日で初回フィードバック）</li>
                  <li>修正/追加資料</li>
                  <li>法務・リスク確認</li>
                  <li>承認</li>
                  <li>公開</li>
                </ol>
                <p className="leading-7 mt-2">公開後もモニタリングを行い、違反疑義があれば一時非公開・内容修正・キャンセル対応を要請します。</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">違反時の対応</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>掲載停止・アカウント制限</li>
                  <li>返金/キャンセル（必要に応じStripe精算条件に従う）</li>
                  <li>リターン代替/再履行</li>
                  <li>再発防止計画の提出</li>
                  <li>重大な違反は即時停止・契約解除・関係当局への通報を行う場合があります</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">免責・その他</h2>
                <p className="leading-7">本審査は適法性・安全性・実現性等の確認を目的とするもので結果を保証するものではありません。第三者からの権利主張・苦情・紛争は実行者の責任で解決してください。外部規約・法令改正・社会状況の変化に応じ、事前予告なく基準を改定します。</p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}


