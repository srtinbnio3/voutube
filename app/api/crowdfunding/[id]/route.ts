import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 特定のクラウドファンディングを取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // クラウドファンディング詳細を取得
  const { data: campaign, error: campaignError } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      *,
      channel:channels(*),
      post:posts(id, title)
    `)
    .eq("id", id)
    .single();

  if (campaignError) {
    return NextResponse.json({ error: campaignError.message }, { status: 500 });
  }

  // 関連する特典を取得
  const { data: rewards, error: rewardsError } = await supabase
    .from("crowdfunding_rewards")
    .select("*")
    .eq("campaign_id", id)
    .order("amount", { ascending: true });

  if (rewardsError) {
    return NextResponse.json({ error: rewardsError.message }, { status: 500 });
  }

  // 支援者数を取得
  const { count: supportersCount, error: supportersError } = await supabase
    .from("crowdfunding_supporters")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id);

  if (supportersError) {
    return NextResponse.json({ error: supportersError.message }, { status: 500 });
  }

  return NextResponse.json({
    campaign,
    rewards,
    supportersCount
  });
}

// クラウドファンディングを更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      story,
      target_amount,
      start_date,
      end_date,
      status,
      reward_enabled,
      bank_account_info,
      main_image,
      thumbnail_image,
      operator_type,
      corporate_info,
      legal_info
    } = body;

    // 更新するフィールドを準備
    const updates: Record<string, any> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (story !== undefined) updates.story = story; // 空文字列でも更新できるように !== undefined を使用
    if (target_amount) updates.target_amount = target_amount;
    if (start_date) updates.start_date = start_date;
    if (end_date) updates.end_date = end_date;
    if (status) updates.status = status;
    if (reward_enabled !== undefined) updates.reward_enabled = reward_enabled;
    if (bank_account_info) updates.bank_account_info = bank_account_info;
    if (main_image !== undefined) updates.main_image = main_image;
    if (thumbnail_image !== undefined) updates.thumbnail_image = thumbnail_image;
    if (operator_type) updates.operator_type = operator_type;
    if (corporate_info !== undefined) updates.corporate_info = corporate_info;
    if (legal_info !== undefined) updates.legal_info = legal_info;

    console.log("🔄 プロジェクト更新開始:", { id, updates })

    // クラウドファンディングを更新
    const { data, error } = await supabase
      .from("crowdfunding_campaigns")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("🚨 データベース更新エラー:", {
        projectId: id,
        error: error.message,
        updates,
        code: error.code,
        details: error.details
      })
      
      // データベース制約エラーの場合の特別な処理
      if (error.message.includes('crowdfunding_campaigns_status_check') || 
          error.code === '23514') {  // CHECK constraint violation
        return NextResponse.json({ 
          error: "プロジェクトのステータス更新でエラーが発生しました。システム管理者にお問い合わせください。",
          details: "データベース制約エラー: 許可されていないステータス値です"
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ プロジェクト更新成功:", { id, newData: data })
    return NextResponse.json({ campaign: data });
  } catch (error) {
    return NextResponse.json({ error: "リクエストの処理中にエラーが発生しました" }, { status: 500 });
  }
}

// クラウドファンディングを削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // キャンペーンの存在確認とオーナー確認
  const { data: campaign, error: fetchError } = await supabase
    .from("crowdfunding_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
  }

  // ドラフト状態のみ削除可能
  if (campaign.status !== "draft") {
    return NextResponse.json({ error: "ドラフト状態のキャンペーンのみ削除できます" }, { status: 400 });
  }

  // キャンペーンを削除
  const { error: deleteError } = await supabase
    .from("crowdfunding_campaigns")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 