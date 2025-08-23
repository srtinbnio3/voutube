import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";

// Stripe Checkoutセッションを作成
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
    const { reward_id, amount, supporter_id } = body;

    // 必須項目の検証
    if (!reward_id || !amount || !supporter_id) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // キャンペーンと特典の存在確認
    const { data: campaign, error: campaignError } = await supabase
      .from("crowdfunding_campaigns")
      .select(`
        *,
        channel:channels(name),
        post:posts(title)
      `)
      .eq("id", id)
      .single();

    if (campaignError) {
      return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
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

    // 支援者情報の確認
    const { data: supporter, error: supporterError } = await supabase
      .from("crowdfunding_supporters")
      .select("*")
      .eq("id", supporter_id)
      .eq("user_id", userId)
      .single();

    if (supporterError) {
      return NextResponse.json({ error: "支援者情報が見つかりません" }, { status: 404 });
    }

    // Stripe Checkoutセッションを作成
    const session_checkout = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `${campaign.title} - ${reward.title}`,
              description: reward.description,
              images: reward.images ? [reward.images[0]] : undefined,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/crowdfunding/${id}/support/complete?session_id={CHECKOUT_SESSION_ID}&supporter_id=${supporter_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/crowdfunding/${id}/support?canceled=true`,
      metadata: {
        campaign_id: id,
        reward_id,
        user_id: userId,
        supporter_id,
      },
    });

    // 支援者情報にセッションIDを更新
    const { error: updateError } = await supabase
      .from("crowdfunding_supporters")
      .update({
        stripe_session_id: session_checkout.id,
      })
      .eq("id", supporter_id);

    if (updateError) {
      return NextResponse.json({ error: "支援者情報の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      url: session_checkout.url,
      sessionId: session_checkout.id,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json({ error: "決済セッションの作成に失敗しました" }, { status: 500 });
  }
}
