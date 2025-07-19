import { createClient } from "@/utils/supabase/server";
import { stripe, formatVerificationData } from "@/app/lib/stripe";
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
      case "identity.verification_session.verified":
        await handleIdentityVerificationSucceeded(supabase, event.data.object);
        break;
      case "identity.verification_session.requires_input":
        await handleIdentityVerificationRequiresInput(supabase, event.data.object);
        break;
      case "identity.verification_session.canceled":
        await handleIdentityVerificationCanceled(supabase, event.data.object);
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

// 本人確認成功時の処理
async function handleIdentityVerificationSucceeded(supabase: any, verificationSession: any) {
  console.log("🔐 本人確認成功webhook処理開始:", { sessionId: verificationSession.id });
  
  try {
    // メタデータからユーザーIDとキャンペーンIDを取得
    const { user_id, campaign_id } = verificationSession.metadata;
    
    // 確認済みデータを整形
    const verifiedData = formatVerificationData(verificationSession);
    
    // データベースの本人確認情報を更新
    const { data: identityVerification, error: updateError } = await supabase
      .from("identity_verifications")
      .update({
        verification_status: 'verified',
        verified_data: verifiedData,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_verification_session_id", verificationSession.id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (updateError) {
      console.error("🔐 本人確認情報更新エラー:", updateError);
      return;
    }

    console.log("🔐 本人確認情報更新成功:", { verificationId: identityVerification.id });

    // キャンペーンの本人確認状況を更新
    if (campaign_id) {
      const { error: campaignUpdateError } = await supabase
        .from("crowdfunding_campaigns")
        .update({
          identity_verification_status: 'verified'
        })
        .eq("id", campaign_id);

      if (campaignUpdateError) {
        console.error("🔐 キャンペーン本人確認状況更新エラー:", campaignUpdateError);
      } else {
        console.log("🔐 キャンペーン本人確認状況更新成功:", { campaignId: campaign_id });
      }
    }

  } catch (error) {
    console.error("🔐 本人確認成功webhook処理エラー:", error);
  }
}

// 本人確認で追加情報が必要な場合の処理
async function handleIdentityVerificationRequiresInput(supabase: any, verificationSession: any) {
  console.log("🔐 本人確認追加情報必要webhook処理開始:", { sessionId: verificationSession.id });
  
  try {
    const { user_id, campaign_id } = verificationSession.metadata;
    
    // データベースの本人確認情報を更新
    const { error: updateError } = await supabase
      .from("identity_verifications")
      .update({
        verification_status: 'requires_input',
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_verification_session_id", verificationSession.id)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("🔐 本人確認情報更新エラー:", updateError);
      return;
    }

    console.log("🔐 本人確認情報更新成功（追加情報必要）");

    // キャンペーンの本人確認状況を更新
    if (campaign_id) {
      const { error: campaignUpdateError } = await supabase
        .from("crowdfunding_campaigns")
        .update({
          identity_verification_status: 'pending'
        })
        .eq("id", campaign_id);

      if (campaignUpdateError) {
        console.error("🔐 キャンペーン本人確認状況更新エラー:", campaignUpdateError);
      }
    }

  } catch (error) {
    console.error("🔐 本人確認追加情報必要webhook処理エラー:", error);
  }
}

// 本人確認キャンセル時の処理
async function handleIdentityVerificationCanceled(supabase: any, verificationSession: any) {
  console.log("🔐 本人確認キャンセルwebhook処理開始:", { sessionId: verificationSession.id });
  
  try {
    const { user_id, campaign_id } = verificationSession.metadata;
    
    // データベースの本人確認情報を更新
    const { error: updateError } = await supabase
      .from("identity_verifications")
      .update({
        verification_status: 'canceled',
        error_message: '本人確認がキャンセルされました',
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_verification_session_id", verificationSession.id)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("🔐 本人確認情報更新エラー:", updateError);
      return;
    }

    console.log("🔐 本人確認情報更新成功（キャンセル）");

    // キャンペーンの本人確認状況を更新
    if (campaign_id) {
      const { error: campaignUpdateError } = await supabase
        .from("crowdfunding_campaigns")
        .update({
          identity_verification_status: 'failed'
        })
        .eq("id", campaign_id);

      if (campaignUpdateError) {
        console.error("🔐 キャンペーン本人確認状況更新エラー:", campaignUpdateError);
      }
    }

  } catch (error) {
    console.error("🔐 本人確認キャンセルwebhook処理エラー:", error);
  }
} 