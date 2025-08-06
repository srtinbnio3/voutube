import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/lib/admin-auth";

// 承認待ちプロジェクト一覧取得API
export async function GET(req: NextRequest) {
  // 管理者権限の確認（content_moderator または super_admin 権限が必要）
  const authResult = await requireAdminAuth('content_moderator');
  if (authResult instanceof Response) {
    return authResult; // エラーレスポンスの場合はそのまま返す
  }
  
  const supabase = await createClient();
  
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // 承認待ちキャンペーンを取得
    const { data: campaigns, error: campaignsError } = await supabase
      .from("crowdfunding_campaigns")
      .select(`
        id,
        title,
        description,
        target_amount,
        start_date,
        end_date,
        status,
        created_at,
        updated_at,
        channel:channels(
          id,
          name,
          youtube_channel_id
        ),
        post:posts(
          id,
          title
        )
      `)
      .eq("status", "under_review")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (campaignsError) {
      console.error("承認待ちキャンペーン取得エラー:", campaignsError);
      return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
    }
    
    // 総件数を取得
    const { count, error: countError } = await supabase
      .from("crowdfunding_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "under_review");
    
    if (countError) {
      console.error("件数取得エラー:", countError);
      return NextResponse.json({ error: "件数取得に失敗しました" }, { status: 500 });
    }
    
    return NextResponse.json({
      campaigns: campaigns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error("承認待ちプロジェクト取得API エラー:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}