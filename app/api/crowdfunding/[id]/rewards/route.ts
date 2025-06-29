import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// キャンペーンの特典一覧を取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // 特典一覧を取得
  const { data, error } = await supabase
    .from("crowdfunding_rewards")
    .select("*")
    .eq("campaign_id", id)
    .order("amount", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rewards: data });
}

// 新しい特典を作成
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // セッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, amount, quantity } = body;

    // 必須項目の検証
    if (!title || !description || !amount || !quantity) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // キャンペーンの存在確認
    const { data: campaign, error: campaignError } = await supabase
      .from("crowdfunding_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (campaignError) {
      return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
    }

    // 新しい特典を作成
    const { data, error } = await supabase
      .from("crowdfunding_rewards")
      .insert({
        campaign_id: id,
        title,
        description,
        amount,
        quantity,
        remaining_quantity: quantity
      })
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