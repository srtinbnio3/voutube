// 審査基準の単一情報源（ヘルプとAIプロンプトの双方で使用）
// 重要: 個人情報や具体的な法解釈は含めない。運用で更新しやすい配列構造にする。

export interface ReviewCriterion {
  key: string
  title: string
  description: string
}

export const reviewCriteria: ReviewCriterion[] = [
  { key: 'legal_compliance', title: '法令遵守', description: '法令違反や許認可未取得の提供がないこと。禁止業種・行為に該当しないこと。' },
  { key: 'public_order', title: '公序良俗の尊重', description: '迷惑行為・危険行為・不適切表現の助長がないこと。' },
  { key: 'safety', title: '安全性の確保', description: '出演者・第三者・環境への安全配慮がなされていること。' },
  { key: 'transparency', title: '透明性の担保', description: '資金使途・スケジュール・体制・リスク・免責が明確であること。' },
  { key: 'rights', title: '権利処理', description: '著作権・商標・肖像権等の適切な許諾があること。素材利用ガイドラインに従うこと。' },
  { key: 'supporter_protection', title: '支援者保護', description: '特典の適法性・履行可能性・提供条件の明確性が確保されていること。' },
  { key: 'platform_policies', title: 'プラットフォーム規約遵守', description: 'YouTube・Stripe等の規約・禁止ポリシーに適合していること。' },
  { key: 'privacy', title: '個人情報・プライバシー', description: '個人情報の不要な取得や第三者の無断公開がないこと。' },
  { key: 'minors', title: '未成年者の保護', description: '未成年者の出演・提供物で不適切がないこと。必要な同意があること。' },
  { key: 'animals_environment', title: '動物・環境配慮', description: '動物福祉や環境保全の観点で問題がないこと。' },
  { key: 'politics_religion', title: '政治・宗教', description: '政治献金・選挙運動の直接支援や特定宗教への勧誘を主目的としないこと。' },
  { key: 'youtube_safety', title: 'YouTube企画の安全性', description: '危険・迷惑・嫌悪・規約違反を助長する挑戦企画でないこと。' },
  { key: 'licensing_check', title: '著作権/ライセンスの二重確認', description: '素材配布サイトの規約・商用可否・再配布可否・帰属表示の要否を確認していること。' },
  { key: 'payment_refund', title: '決済・返金方針', description: 'Stripeポリシー等に適合し適切に明記されていること。' },
]

export const reviewBannedExamples = [
  '違法行為/許認可未取得の提供',
  '投資/利回り保証/仮想通貨配当・ICO/情報商材など',
  '現金/仮想通貨/高換金性金券の配布や抽選・くじ',
  'アダルト/過度な暴力/自傷・差別・ヘイト/動物虐待/危険・迷惑行為',
  '盗撮・無許可録音/プライバシー侵害/個人情報売買/ステマ',
  '他者の権利侵害（無許諾利用・ガイドライン違反）',
]

export interface AiReviewOutput {
  decision: 'approve' | 'request_changes' | 'reject'
  scores: Record<string, number>
  requiredFixes: Array<{ field: string; description: string; example?: string; severity: 'low'|'medium'|'high' }>
  riskFlags: Array<{ type: string; detail: string; references?: string[] }>
  draftMessage: string
}


