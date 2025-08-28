import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminPermission } from "@/app/lib/admin-auth";

// 企画者報酬の支払い状況を更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // 管理者認証チェック
  const adminCheck = await checkAdminPermission();
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { 
      payment_status, 
      processing_notes, 
      bank_transfer_id, 
      processed_by, 
      payment_date 
    } = body;

    // 必須項目の検証
    if (!payment_status) {
      return NextResponse.json({ error: "ステータスは必須です" }, { status: 400 });
    }

    // 報酬記録の存在確認
    const { data: existingReward, error: fetchError } = await supabase
      .from("creator_rewards")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingReward) {
      return NextResponse.json({ error: "報酬記録が見つかりません" }, { status: 404 });
    }

    // 更新データの準備
    const updateData: any = {
      payment_status,
      updated_at: new Date().toISOString(),
    };

    if (processing_notes !== undefined) updateData.processing_notes = processing_notes;
    if (bank_transfer_id !== undefined) updateData.bank_transfer_id = bank_transfer_id;
    if (processed_by !== undefined) updateData.processed_by = processed_by;
    if (payment_date !== undefined) updateData.payment_date = payment_date;

    // 報酬記録を更新
    const { data, error } = await supabase
      .from("creator_rewards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("報酬記録更新エラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 支払い完了時のログ出力
    if (payment_status === "paid") {
      console.log(`企画者報酬支払い完了: ${id}, 金額: ${existingReward.amount}`);
      // 必要に応じて通知処理などを追加
    }

    return NextResponse.json({ 
      message: "報酬支払い状況を更新しました",
      reward: data 
    });

  } catch (error) {
    console.error("報酬支払い状況更新エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}

// 企画者報酬の詳細を取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // 管理者認証チェック
  const adminCheck = await checkAdminPermission();
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  try {
    // 報酬詳細を取得
    const { data, error } = await supabase
      .from("creator_rewards")
      .select(`
        *,
        campaign:crowdfunding_campaigns(
          id,
          title,
          current_amount,
          channel:channels(name, icon_url),
          post:posts(
            id,
            title,
            profiles!posts_user_id_fkey(id, username)
          )
        ),
        processed_by_profile:profiles!creator_rewards_processed_by_fkey(username)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "報酬記録が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ reward: data });

  } catch (error) {
    console.error("報酬詳細取得エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}
