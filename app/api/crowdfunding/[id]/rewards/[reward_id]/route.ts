import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 特典の詳細を取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reward_id: string }> }
) {
  const resolvedParams = await params;
  const { reward_id } = resolvedParams;

  const supabase = await createClient();

  // 特典詳細を取得
  const { data, error } = await supabase
    .from("crowdfunding_rewards")
    .select("*")
    .eq("id", reward_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reward: data });
}

// 特典を更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reward_id: string }> }
) {
  const resolvedParams = await params;
  const { reward_id } = resolvedParams;

  const supabase = await createClient();

  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, amount, quantity } = body;

    // 更新するフィールドを準備
    const updates: Record<string, any> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (amount) updates.amount = amount;
    
    // 数量の更新（残り数量も調整）
    if (quantity) {
      // 現在の特典情報を取得
      const { data: currentReward, error: fetchError } = await supabase
        .from("crowdfunding_rewards")
        .select("*")
        .eq("id", reward_id)
        .single();
      
      if (fetchError) {
        return NextResponse.json({ error: "特典が見つかりません" }, { status: 404 });
      }
      
      // 残り数量を調整（現在の残り数量を維持する割合を新しい数量に適用）
      const soldCount = currentReward.quantity - currentReward.remaining_quantity;
      updates.quantity = quantity;
      updates.remaining_quantity = Math.max(0, quantity - soldCount);
    }

    // 特典を更新
    const { data, error } = await supabase
      .from("crowdfunding_rewards")
      .update(updates)
      .eq("id", reward_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reward: data });
  } catch (error) {
    return NextResponse.json({ error: "リクエストの処理中にエラーが発生しました" }, { status: 500 });
  }
}

// 特典を削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reward_id: string }> }
) {
  const resolvedParams = await params;
  const { id, reward_id } = resolvedParams;

  const supabase = await createClient();

  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // 特典の存在確認
  const { data: reward, error: fetchError } = await supabase
    .from("crowdfunding_rewards")
    .select("*")
    .eq("id", reward_id)
    .eq("campaign_id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: "特典が見つかりません" }, { status: 404 });
  }

  // キャンペーンの状態確認
  const { data: campaign, error: campaignError } = await supabase
    .from("crowdfunding_campaigns")
    .select("status")
    .eq("id", id)
    .single();

  if (campaignError) {
    return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
  }

  // アクティブなキャンペーンから支援者がいる特典は削除不可
  if (campaign.status !== "draft" && reward.quantity !== reward.remaining_quantity) {
    return NextResponse.json({ error: "支援者が存在する特典は削除できません" }, { status: 400 });
  }

  // 特典を削除
  const { error: deleteError } = await supabase
    .from("crowdfunding_rewards")
    .delete()
    .eq("id", reward_id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 