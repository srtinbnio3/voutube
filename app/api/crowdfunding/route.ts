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