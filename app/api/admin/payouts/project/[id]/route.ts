import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminPermission } from "@/app/lib/admin-auth";

// プロジェクト実施者への振り込み状況を更新
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
      payout_status, 
      processing_notes, 
      bank_transfer_id, 
      processed_by, 
      payout_date 
    } = body;

    // 必須項目の検証
    if (!payout_status) {
      return NextResponse.json({ error: "ステータスは必須です" }, { status: 400 });
    }

    // 振り込み記録の存在確認
    const { data: existingPayout, error: fetchError } = await supabase
      .from("project_payouts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingPayout) {
      return NextResponse.json({ error: "振り込み記録が見つかりません" }, { status: 404 });
    }

    // 更新データの準備
    const updateData: any = {
      payout_status,
      updated_at: new Date().toISOString(),
    };

    if (processing_notes !== undefined) updateData.processing_notes = processing_notes;
    if (bank_transfer_id !== undefined) updateData.bank_transfer_id = bank_transfer_id;
    if (processed_by !== undefined) updateData.processed_by = processed_by;
    if (payout_date !== undefined) updateData.payout_date = payout_date;

    // 振り込み記録を更新
    const { data, error } = await supabase
      .from("project_payouts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("振り込み記録更新エラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 完了時にはキャンペーンステータスも更新を検討（必要に応じて）
    if (payout_status === "completed") {
      console.log(`プロジェクト振り込み完了: ${id}`);
      // 必要に応じて通知処理などを追加
    }

    return NextResponse.json({ 
      message: "振り込み状況を更新しました",
      payout: data 
    });

  } catch (error) {
    console.error("振り込み状況更新エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}

// プロジェクト実施者への振り込み詳細を取得
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
    // 振り込み詳細を取得
    const { data, error } = await supabase
      .from("project_payouts")
      .select(`
        *,
        campaign:crowdfunding_campaigns(
          id,
          title,
          current_amount,
          channel:channels(name, icon_url),
          post:posts(title)
        ),
        processed_by_profile:profiles!project_payouts_processed_by_fkey(username)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "振り込み記録が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ payout: data });

  } catch (error) {
    console.error("振り込み詳細取得エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}
