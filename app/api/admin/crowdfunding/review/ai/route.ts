import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/app/lib/admin-auth"
import { createClient } from "@/utils/supabase/server"
import { reviewCriteria, reviewBannedExamples, AiReviewOutput } from "@/app/lib/review-criteria"
import { VertexAI } from "@google-cloud/vertexai"

// 管理者専用: AI審査結果の下書きを生成
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

    // 入力の整形（PIIや口座等は除外）
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

    // Vertex セットアップ
    const project = process.env.GCP_PROJECT_ID
    const location = process.env.VERTEX_LOCATION || 'asia-northeast1'
    if (!project) return NextResponse.json({ error: 'GCP_PROJECT_ID is not set' }, { status: 500 })

    const vertex = new VertexAI({ project, location })
    const model = vertex.getGenerativeModel({ model: 'gemini-1.5-pro-002' })

    const systemPrompt = `あなたはクラウドファンディングの審査官です。与えられた審査基準に厳密に従い、
過不足ない根拠とともに判定を行い、修正が必要な点は具体的かつ実行可能な形で提示してください。
出力は必ず指定されたJSONスキーマに従ってください。draftMessageは日本語・敬体・500字以内で、
運営から実行者に送るメッセージとして自然な文面にしてください。`.
      replace(/\n/g, ' ')

    const userContent = {
      role: 'user',
      parts: [
        { text: `${systemPrompt}` },
        { text: `審査基準(JSON): ${JSON.stringify(reviewCriteria)}` },
        { text: `受付不可の代表例: ${JSON.stringify(reviewBannedExamples)}` },
        { text: `プロジェクト情報(JSON): ${JSON.stringify(input)}` },
        { text: `出力スキーマ(JSON): { decision: 'approve'|'request_changes'|'reject', scores: { [criterion_key]: 0-10 }, requiredFixes: [{ field, description, example?, severity }], riskFlags: [{ type, detail, references? }], draftMessage: string }` },
      ]
    }

    const generation = await model.generateContent({ contents: [userContent] })
    const text = generation.response.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // JSON抽出（Markdown形式や説明文が混ざる可能性に対応）
    let parsed: AiReviewOutput
    try {
      // まず全体をパースしてみる
      parsed = JSON.parse(text) as AiReviewOutput
    } catch {
      try {
        // ```json で囲まれた部分を抽出
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]) as AiReviewOutput
        } else {
          // 最後の { から } までを抽出
          const lastBraceMatch = text.match(/\{[\s\S]*\}$/)
          if (lastBraceMatch) {
            parsed = JSON.parse(lastBraceMatch[0]) as AiReviewOutput
          } else {
            throw new Error('JSON形式が見つかりません')
          }
        }
      } catch (parseError) {
        console.error('[AI Review] JSON parse error:', parseError, 'Raw text:', text)
        return NextResponse.json({ 
          error: 'AI応答の解析に失敗しました', 
          raw: text.substring(0, 500) + (text.length > 500 ? '...' : '')
        }, { status: 502 })
      }
    }

    // 簡易バリデーション
    if (!parsed?.decision || !parsed?.draftMessage) {
      console.error('[AI Review] Invalid response structure:', parsed)
      return NextResponse.json({ 
        error: 'AI応答の形式が不正です', 
        raw: text.substring(0, 500) + (text.length > 500 ? '...' : '')
      }, { status: 502 })
    }

    return NextResponse.json({
      decision: parsed.decision,
      scores: parsed.scores,
      requiredFixes: parsed.requiredFixes,
      riskFlags: parsed.riskFlags,
      draftMessage: parsed.draftMessage,
    })
  } catch (err) {
    console.error('[AI Review] error:', err)
    return NextResponse.json({ 
      error: '内部エラーが発生しました',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}


