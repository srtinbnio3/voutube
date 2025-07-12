import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

// Stripeのウェブフックを処理する
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  
  // Stripeのシークレットキーがない場合はエラー
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Webhook secret is missing.");
    return NextResponse.json({ error: "Webhook secret is missing" }, { status: 500 });
  }
  
  let event;
  
  try {
    // イベントを検証
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
  
  // イベントタイプに基づいて処理
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(supabase, event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(supabase, event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook processing failed: ${error.message}`);
    return NextResponse.json({ error: `Webhook processing failed: ${error.message}` }, { status: 500 });
  }
}

// 支払い成功時の処理
async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: any) {
  const { campaign_id, reward_id, user_id } = paymentIntent.metadata;
  
  // 支援者レコードを更新
  const { data: supporters, error: supportersError } = await supabase
    .from("crowdfunding_supporters")
    .select("id")
    .eq("campaign_id", campaign_id)
    .eq("user_id", user_id)
    .eq("reward_id", reward_id)
    .eq("payment_status", "pending");
  
  if (supportersError || !supporters.length) {
    console.error("Failed to find supporter record:", supportersError);
    return;
  }
  
  const supporterId = supporters[0].id;
  
  // 支援状態を「完了」に更新
  const { error: updateError } = await supabase
    .from("crowdfunding_supporters")
    .update({ payment_status: "completed" })
    .eq("id", supporterId);
  
  if (updateError) {
    console.error("Failed to update supporter status:", updateError);
    return;
  }
  
  // 支払い情報を更新
  const { error: paymentError } = await supabase
    .from("crowdfunding_payments")
    .update({ status: "completed" })
    .eq("supporter_id", supporterId)
    .eq("stripe_payment_intent_id", paymentIntent.id);
  
  if (paymentError) {
    console.error("Failed to update payment status:", paymentError);
  }
}

// 支払い失敗時の処理
async function handlePaymentIntentFailed(supabase: any, paymentIntent: any) {
  const { campaign_id, reward_id, user_id } = paymentIntent.metadata;
  
  // 支援者レコードを更新
  const { data: supporters, error: supportersError } = await supabase
    .from("crowdfunding_supporters")
    .select("id")
    .eq("campaign_id", campaign_id)
    .eq("user_id", user_id)
    .eq("reward_id", reward_id)
    .eq("payment_status", "pending");
  
  if (supportersError || !supporters.length) {
    console.error("Failed to find supporter record:", supportersError);
    return;
  }
  
  const supporterId = supporters[0].id;
  
  // 支援状態を「失敗」に更新
  const { error: updateError } = await supabase
    .from("crowdfunding_supporters")
    .update({ payment_status: "failed" })
    .eq("id", supporterId);
  
  if (updateError) {
    console.error("Failed to update supporter status:", updateError);
    return;
  }
  
  // 支払い情報を更新
  const { error: paymentError } = await supabase
    .from("crowdfunding_payments")
    .update({ status: "failed" })
    .eq("supporter_id", supporterId)
    .eq("stripe_payment_intent_id", paymentIntent.id);
  
  if (paymentError) {
    console.error("Failed to update payment status:", paymentError);
  }
} 