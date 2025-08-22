import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/lib/admin-auth";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// サービスロール用のSupabaseクライアントを作成（RLS回避）
const createServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// 運営側のプロジェクト承認API
export async function POST(req: NextRequest) {
  // 管理者権限の確認（content_moderator または super_admin 権限が必要）
  const authResult = await requireAdminAuth('content_moderator');
  if (authResult instanceof Response) {
    return authResult; // エラーレスポンスの場合はそのまま返す
  }
  
  // 管理者操作はRLSを回避する必要があるため、サービスロールを使用
  const supabase = createServiceRoleClient();
  
  try {
    const body = await req.json();
    const { campaign_id, action, reason } = body;
    
    // 必須項目の検証
    if (!campaign_id || !action) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }
    
    // アクションの検証
    if (!['approve', 'reject', 'needs_revision'].includes(action)) {
      return NextResponse.json({ error: "無効なアクションです" }, { status: 400 });
    }
    
    // キャンペーンの存在確認
    const { data: campaign, error: campaignError } = await supabase
      .from("crowdfunding_campaigns")
      .select("id, status, title")
      .eq("id", campaign_id)
      .single();
    
    if (campaignError || !campaign) {
      return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
    }
    
    // ステータスが under_review であることを確認
    if (campaign.status !== 'under_review') {
      return NextResponse.json({ 
        error: "承認待ち状態のプロジェクトのみ処理できます" 
      }, { status: 400 });
    }
    
    // ステータスを更新
    const newStatus = action === 'approve' ? 'approved' : action === 'needs_revision' ? 'needs_revision' : 'rejected';
    const { data: updatedCampaign, error: updateError } = await supabase
      .from("crowdfunding_campaigns")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", campaign_id)
      .select()
      .single();
    
    if (updateError) {
      console.error("キャンペーンステータス更新エラー:", updateError);
      return NextResponse.json({ error: "ステータス更新に失敗しました" }, { status: 500 });
    }
    
    // 承認/却下履歴を記録（将来の機能拡張用）
    console.log(`キャンペーン ${campaign_id} が ${action} されました`, {
      campaignTitle: campaign.title,
      newStatus,
      reason,
      adminUserId: authResult.userId,
      adminRoles: authResult.roles,
      timestamp: new Date().toISOString()
    });
    
    // レスポンスメッセージを生成
    let message = "";
    switch (action) {
      case 'approve':
        message = "プロジェクトを承認しました。プロジェクトオーナーが公開設定を行えます。";
        break;
      case 'needs_revision':
        message = "プロジェクトを要修正状態にしました。修正内容をチャットでユーザーに伝えてください。";
        break;
      case 'reject':
        message = "プロジェクトを却下しました";
        break;
    }
    
    return NextResponse.json({ 
      message,
      campaign: updatedCampaign 
    });
    
  } catch (error) {
    console.error("承認API エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}