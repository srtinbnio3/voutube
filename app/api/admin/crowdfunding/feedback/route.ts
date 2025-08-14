import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/app/lib/admin-auth"
import { createClient } from "@/utils/supabase/server"

// 管理者専用: 運営からのメッセージ送信（optionでneeds_revisionへ遷移）
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('content_moderator')
  if (auth instanceof Response) return auth

  try {
    const { campaign_id, message, message_type, markNeedsRevision } = await req.json()
    if (!campaign_id || !message || !message_type) {
      return NextResponse.json({ error: 'campaign_id, message, message_type are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // キャンペーン存在確認
    const { data: campaign, error: campaignError } = await supabase
      .from('crowdfunding_campaigns')
      .select('id,status,title')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) return NextResponse.json({ error: 'campaign not found' }, { status: 404 })

    // 運営メッセージを挿入
    const { error: insertError } = await supabase
      .from('campaign_feedback')
      .insert({
        campaign_id,
        sender_id: null,
        sender_type: 'admin',
        message,
        message_type,
        is_read: false,
        admin_name: 'IdeaTube運営チーム',
      })

    if (insertError) return NextResponse.json({ error: 'failed to insert feedback' }, { status: 500 })

    // 任意で needs_revision に変更
    if (markNeedsRevision) {
      const { error: updateError } = await supabase
        .from('crowdfunding_campaigns')
        .update({ status: 'needs_revision', updated_at: new Date().toISOString() })
        .eq('id', campaign_id)
      if (updateError) console.error('[feedback] status update failed:', updateError)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Admin Feedback] error:', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}


