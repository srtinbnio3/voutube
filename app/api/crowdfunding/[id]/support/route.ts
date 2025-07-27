import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";

// キャンペーンへの支援を行う
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

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { reward_id, amount } = body;

    // 必須項目の検証
    if (!reward_id || !amount) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // キャンペーンと特典の存在確認
    const { data: campaign, error: campaignError } = await supabase
      .from("crowdfunding_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (campaignError) {
      return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
    }

    if (campaign.status !== "active") {
      return NextResponse.json({ error: "アクティブなキャンペーンのみ支援できます" }, { status: 400 });
    }

    const { data: reward, error: rewardError } = await supabase
      .from("crowdfunding_rewards")
      .select("*")
      .eq("id", reward_id)
      .eq("campaign_id", id)
      .single();

    if (rewardError) {
      return NextResponse.json({ error: "特典が見つかりません" }, { status: 404 });
    }

    if (!reward.is_unlimited && reward.remaining_quantity <= 0) {
      return NextResponse.json({ error: "この特典は完売しました" }, { status: 400 });
    }

    if (amount < reward.amount) {
      return NextResponse.json({ error: "支援金額が不足しています" }, { status: 400 });
    }

    // ユーザー情報の取得
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "ユーザー情報の取得に失敗しました" }, { status: 500 });
    }

    // Stripeの支払いインテントを作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "jpy",
      metadata: {
        campaign_id: id,
        reward_id,
        user_id: userId
      }
    });

    // 支援記録を作成
    const { data: supporter, error: supporterError } = await supabase
      .from("crowdfunding_supporters")
      .insert({
        campaign_id: id,
        user_id: userId,
        reward_id,
        amount,
        payment_status: "pending"
      })
      .select()
      .single();

    if (supporterError) {
      return NextResponse.json({ error: supporterError.message }, { status: 500 });
    }

    // 支払い情報を作成
    const { error: paymentError } = await supabase
      .from("crowdfunding_payments")
      .insert({
        supporter_id: supporter.id,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: paymentIntent.customer || "",
        amount,
        status: "pending"
      });

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      supporterId: supporter.id
    });
  } catch (error) {
    return NextResponse.json({ error: "リクエストの処理中にエラーが発生しました" }, { status: 500 });
  }
}

// キャンペーンの支援者一覧を取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  // 支援者一覧を取得
  const { data, error, count } = await supabase
    .from("crowdfunding_supporters")
    .select(`
      *,
      profile:profiles(username, avatar_url),
      reward:crowdfunding_rewards(id, title, amount)
    `, { count: "exact" })
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    supporters: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  });
} 