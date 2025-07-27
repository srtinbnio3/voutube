import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// クラウドファンディング一覧を取得
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  
  // クエリパラメータ
  const status = searchParams.get("status") || "active";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;
  
  // 特定の投稿IDに対する既存プロジェクトチェック用のパラメータ
  const postId = searchParams.get("post_id");
  
  // 特定の投稿IDでの既存プロジェクトチェック機能
  if (postId) {
    const { data: existingCampaign, error } = await supabase
      .from("crowdfunding_campaigns")
      .select("id, title, status, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // 0件または1件の結果を期待
    
    if (error) {
      console.error("既存プロジェクトチェックエラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      exists: !!existingCampaign,
      campaign: existingCampaign
    });
  }
  
  // クラウドファンディング一覧を取得
  const { data, error, count } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      *,
      channel:channels(*),
      post:posts(id, title)
    `, { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    campaigns: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  });
}

// 新しいクラウドファンディングを作成
export async function POST(req: NextRequest) {
  console.log("🚀 クラウドファンディング作成API開始");
  
  const supabase = await createClient();
  
  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  console.log("🚀 セッション確認:", { hasSession: !!session, userId: session?.user?.id });
  
  if (!session) {
    console.log("🚀 認証エラー: セッションなし");
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    console.log("🚀 リクエストボディ:", body);
    
    const { 
      post_id, 
      channel_id, 
      title, 
      description, 
      target_amount, 
      start_date, 
      end_date,
      reward_enabled,
      bank_account_info
    } = body;
    
    // 必須項目の検証
    if (!post_id || !channel_id || !title || !description || !target_amount || !start_date || !end_date) {
      console.log("🚀 バリデーションエラー: 必須項目不足", {
        post_id: !!post_id,
        channel_id: !!channel_id,
        title: !!title,
        description: !!description,
        target_amount: !!target_amount,
        start_date: !!start_date,
        end_date: !!end_date
      });
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }
    
    // 同じpost_idで既存のプロジェクトがないかチェック
    console.log("🚀 既存プロジェクトチェック開始...");
    const { data: existingCampaign, error: checkError } = await supabase
      .from("crowdfunding_campaigns")
      .select("id, title, status")
      .eq("post_id", post_id)
      .limit(1)
      .maybeSingle();
    
    if (checkError) {
      console.error("🚀 既存プロジェクトチェックエラー:", checkError);
      return NextResponse.json({ error: "プロジェクトチェック中にエラーが発生しました" }, { status: 500 });
    }
    
    // 既存のプロジェクトが見つかった場合
    if (existingCampaign) {
      console.log("🚀 既存プロジェクトが見つかりました:", existingCampaign);
      return NextResponse.json({ 
        error: "この投稿には既にクラウドファンディングプロジェクトが存在します",
        existingCampaign: existingCampaign,
        redirectTo: `/crowdfunding/${existingCampaign.id}/edit`
      }, { status: 409 }); // 409 Conflict
    }
    
    console.log("🚀 新規プロジェクト作成を開始...");
    
    const insertData = {
        post_id,
        channel_id,
        title,
        description,
        target_amount,
        current_amount: 0,
        start_date,
        end_date,
        status: "draft",
        reward_enabled: reward_enabled || false,
        bank_account_info: bank_account_info || null
    };
    
    console.log("🚀 データベース挿入データ:", insertData);
    
    // 新しいクラウドファンディングを作成
    const { data, error } = await supabase
      .from("crowdfunding_campaigns")
      .insert(insertData)
      .select()
      .single();
    
    console.log("🚀 データベース挿入結果:", { 
      success: !!data, 
      error: error?.message,
      campaignId: data?.id,
      campaignTitle: data?.title
    });
    
    if (error) {
      console.log("🚀 データベースエラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("🚀 クラウドファンディング作成成功:", data.id);
    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("🚀 予期しないエラー:", error);
    return NextResponse.json({ error: "リクエストの処理中にエラーが発生しました" }, { status: 500 });
  }
} 