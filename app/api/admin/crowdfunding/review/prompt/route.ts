import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/app/lib/admin-auth"
import { createClient } from "@/utils/supabase/server"
import { reviewCriteria, reviewBannedExamples } from "@/app/lib/review-criteria"

// 管理者専用: 審査用プロンプトを生成して返す（AI呼び出しは行わない）
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('content_moderator')
  if (auth instanceof Response) return auth

  try {
    const { campaign_id } = await req.json()
    if (!campaign_id) return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })

    const supabase = await createClient()

    // キャンペーン情報
    const { data: campaign, error: campaignError } = await supabase
      .from('crowdfunding_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) return NextResponse.json({ error: 'campaign not found' }, { status: 404 })

    // 関連ポスト
    const { data: post } = await supabase
      .from('posts')
      .select('id,title,description')
      .eq('id', campaign.post_id)
      .single()

    // チャンネル
    const { data: channel } = await supabase
      .from('channels')
      .select('id,name,subscriber_count,icon_url,youtube_channel_id')
      .eq('id', campaign.channel_id)
      .single()

    // リワード
    const { data: rewards } = await supabase
      .from('crowdfunding_rewards')
      .select('id,title,description,amount,quantity,delivery_date,requires_address,requires_email,requires_contact_info,is_unlimited')
      .eq('campaign_id', campaign_id)

    // 構造化データ（PIIは含めない）
    const input = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        story: campaign.story?.slice(0, 4000) ?? null,
        target_amount: campaign.target_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        reward_enabled: campaign.reward_enabled,
        main_image: campaign.main_image,
        thumbnail_image: campaign.thumbnail_image,
        status: campaign.status,
      },
      post: post ? { id: post.id, title: post.title, description: post.description?.slice(0, 1000) } : null,
      channel: channel ? { id: channel.id, name: channel.name, subscriber_count: channel.subscriber_count } : null,
      rewards: (rewards || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description?.slice(0, 500),
        amount: r.amount,
        quantity: r.quantity,
        delivery_date: r.delivery_date,
        requires_address: r.requires_address,
        requires_email: r.requires_email,
        requires_contact_info: r.requires_contact_info,
        is_unlimited: r.is_unlimited,
      })),
      criteria: reviewCriteria,
      bannedExamples: reviewBannedExamples,
    }

    // 貼り付け用プロンプト（どのAIにも貼りやすいようテキスト化）
    const prompt = [
      'あなたはクラウドファンディングの審査官です。以下の審査基準とプロジェクト情報に基づき、',
      '1) 最終判定: approve | request_changes | reject',
      '2) 根拠（簡潔に）',
      '3) 指摘事項（修正が必要な点: 箇条書き/重要度付き）',
      '4) リスクフラグ（該当あれば）',
      'を日本語・敬体で出力してください。',
      '',
      '【審査基準(JSON)】',
      JSON.stringify(reviewCriteria, null, 2),
      '',
      '【受付不可の代表例】',
      JSON.stringify(reviewBannedExamples, null, 2),
      '',
      '【プロジェクト情報(JSON)】',
      JSON.stringify(input, null, 2),
      '',
      '出力形式（例）:',
      '{\n  "decision": "request_changes",\n  "reasons": ["..."],\n  "requiredFixes": [{"field":"...","description":"...","severity":"medium"}],\n  "riskFlags": [{"type":"...","detail":"..."}]\n}',
    ].join('\n')

    return NextResponse.json({ prompt })
  } catch (err) {
    console.error('[Review Prompt] error:', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}


