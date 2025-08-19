import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/lib/admin-auth";

// 管理画面: ステータス指定でクラファン案件を一覧取得する汎用API
// GET /api/admin/crowdfunding?status=under_review|draft|needs_revision|active|rejected|completed|cancelled|all&page=1&limit=10
export async function GET(req: NextRequest) {
  // 管理者権限の確認（content_moderator または super_admin 権限が必要）
  const authResult = await requireAdminAuth('content_moderator');
  if (authResult instanceof Response) {
    return authResult; // エラーレスポンスの場合はそのまま返す
  }

  const supabase = await createClient();

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get("status") || "under_review").toLowerCase();
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const allowedStatuses = new Set([
      "draft",
      "under_review",
      "needs_revision",
      "active",
      "rejected",
      "completed",
      "cancelled",
      "all",
    ]);

    if (!allowedStatuses.has(statusParam)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    // ベースクエリ
    let query = supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusParam !== "all") {
      query = query.eq("status", statusParam);
    }

    const { data: campaigns, error: campaignsError } = await query;
    if (campaignsError) {
      console.error("[Admin] campaigns fetch error:", campaignsError);
      return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
    }

    // 総件数
    let countQuery = supabase
      .from("crowdfunding_campaigns")
      .select("*", { count: "exact", head: true });
    if (statusParam !== "all") {
      countQuery = countQuery.eq("status", statusParam);
    }
    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("[Admin] campaigns count error:", countError);
      return NextResponse.json({ error: "件数取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("[Admin] crowdfunding list API error:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}


