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
    const { 
      title, 
      description, 
      amount, 
      quantity,
      delivery_date,
      requires_shipping,
      shipping_info,
      images,
      template,
      is_unlimited,
      requires_contact_info,
      requires_email,
      requires_address
    } = body;

    // 更新するフィールドを準備
    const updates: Record<string, any> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (amount) updates.amount = amount;
    if (delivery_date !== undefined) updates.delivery_date = delivery_date;
    if (requires_shipping !== undefined) updates.requires_shipping = requires_shipping;
    if (shipping_info !== undefined) updates.shipping_info = shipping_info;
    if (images !== undefined) updates.images = images;
    if (template !== undefined) updates.template = template;
    if (is_unlimited !== undefined) updates.is_unlimited = is_unlimited;
    if (requires_contact_info !== undefined) updates.requires_contact_info = requires_contact_info;
    if (requires_email !== undefined) updates.requires_email = requires_email;
    if (requires_address !== undefined) updates.requires_address = requires_address;
    
    // 数量の更新（残り数量も調整）
    if (quantity !== undefined || is_unlimited !== undefined) {
      // 現在の特典情報を取得
      const { data: currentReward, error: fetchError } = await supabase
        .from("crowdfunding_rewards")
        .select("*")
        .eq("id", reward_id)
        .single();
      
      if (fetchError) {
        return NextResponse.json({ error: "特典が見つかりません" }, { status: 404 });
      }
      
      // 無制限フラグが設定されている場合
      if (is_unlimited !== undefined) {
        if (is_unlimited) {
          // 無制限に設定する場合
          updates.quantity = 1;
          updates.remaining_quantity = 1;
        } else if (quantity) {
          // 制限ありに戻す場合
          const soldCount = currentReward.is_unlimited ? 0 : 
            (currentReward.quantity - currentReward.remaining_quantity);
          updates.quantity = quantity;
          updates.remaining_quantity = Math.max(0, quantity - soldCount);
        }
      } else if (quantity && !currentReward.is_unlimited) {
        // 数量のみ更新（無制限でない場合）
        const soldCount = currentReward.quantity - currentReward.remaining_quantity;
        updates.quantity = quantity;
        updates.remaining_quantity = Math.max(0, quantity - soldCount);
      }
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