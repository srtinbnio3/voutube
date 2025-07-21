import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// テスト用：本人確認データをリセット
export async function POST(req: NextRequest) {
  console.log("🔐 本人確認データリセットAPI開始");
  
  const supabase = await createClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { campaign_id } = body;

    if (!campaign_id) {
      return NextResponse.json({ error: "campaign_idが必要です" }, { status: 400 });
    }

    console.log("🔐 リセット対象:", { campaign_id, userId: session.user.id });

    // 該当キャンペーンの本人確認レコードを削除
    const { error: deleteError } = await supabase
      .from("identity_verifications")
      .delete()
      .eq("campaign_id", campaign_id)
      .eq("user_id", session.user.id);

    if (deleteError) {
      console.error("🔐 削除エラー:", deleteError);
      return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    }

    // キャンペーンの本人確認状況もリセット
    const { error: campaignUpdateError } = await supabase
      .from("crowdfunding_campaigns")
      .update({
        identity_verification_id: null,
        identity_verification_status: null
      })
      .eq("id", campaign_id);

    if (campaignUpdateError) {
      console.error("🔐 キャンペーン更新エラー:", campaignUpdateError);
    }

    console.log("🔐 本人確認データリセット完了");

    return NextResponse.json({ 
      message: "本人確認データをリセットしました",
      campaign_id 
    });

  } catch (error) {
    console.error("🔐 リセットエラー:", error);
    return NextResponse.json(
      { error: "リセットに失敗しました" }, 
      { status: 500 }
    );
  }
} 