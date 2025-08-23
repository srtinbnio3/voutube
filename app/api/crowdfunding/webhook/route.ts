import { createClient } from "@/utils/supabase/server";
import { stripe, formatVerificationData } from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
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

// Stripeのウェブフックを処理する
export async function POST(req: NextRequest) {
  // webhook用に管理者権限のクライアントを使用
  const supabase = createServiceRoleClient();
  
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
  console.log(`🔐 Webhook受信: ${event.type}`, { 
    sessionId: (event.data.object as any)?.id,
    status: (event.data.object as any)?.status,
    lastError: (event.data.object as any)?.last_error,
    options: (event.data.object as any)?.options,
    verificationCheck: (event.data.object as any)?.verification_check
  });
  
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(supabase, event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(supabase, event.data.object);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(supabase, event.data.object);
        break;
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutSessionAsyncPaymentSucceeded(supabase, event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        await handleCheckoutSessionAsyncPaymentFailed(supabase, event.data.object);
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
      case "identity.verification_session.failed":
        await handleIdentityVerificationFailed(supabase, event.data.object);
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
    return;
  }

  // リワードの在庫を減らす（無制限でない場合のみ）
  const { data: reward, error: rewardError } = await supabase
    .from("crowdfunding_rewards")
    .select("id, is_unlimited, remaining_quantity")
    .eq("id", reward_id)
    .single();

  if (rewardError) {
    console.error("Failed to get reward info:", rewardError);
    return;
  }

  // 無制限でない場合のみ在庫を減らす
  if (!reward.is_unlimited && reward.remaining_quantity > 0) {
    const { error: quantityError } = await supabase
      .from("crowdfunding_rewards")
      .update({ 
        remaining_quantity: reward.remaining_quantity - 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", reward_id);

    if (quantityError) {
      console.error("Failed to update reward quantity:", quantityError);
    }
  }

  // キャンペーンの現在支援額は supportersテーブルのトリガーで自動更新される
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
        verification_status: 'succeeded', // Stripeの'verified'をデータベースの'succeeded'にマッピング
        verified_data: verifiedData,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_verification_session_id", verificationSession.id)
      .eq("user_id", user_id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("🔐 本人確認情報更新エラー:", updateError);
      return;
    }

    console.log("🔐 本人確認情報更新成功:", { 
      verificationId: identityVerification?.id, 
      sessionId: verificationSession.id 
    });

          // キャンペーンの本人確認状況を更新
      if (campaign_id) {
        const { error: campaignUpdateError } = await supabase
          .from("crowdfunding_campaigns")
          .update({
            identity_verification_status: 'succeeded'
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
    
    // last_errorが存在する場合は失敗として処理
    if (verificationSession.last_error) {
      console.log("🔐 エラー情報検出、失敗として処理:", verificationSession.last_error);
      
      // データベースの本人確認情報を失敗として更新
      console.log("🔐 失敗更新前の条件:", {
        sessionId: verificationSession.id,
        userId: user_id,
        errorMessage: verificationSession.last_error.reason
      });

      // デバッグ：データベースに存在するレコードを確認
      const { data: existingRecords } = await supabase
        .from("identity_verifications")
        .select("id, user_id, stripe_verification_session_id, verification_status")
        .eq("user_id", user_id);

      console.log("🔐 同じuser_idのレコード:", existingRecords);

      const { data: allRecords } = await supabase
        .from("identity_verifications")
        .select("id, user_id, stripe_verification_session_id, verification_status")
        .limit(5);

      console.log("🔐 最新5件のレコード:", allRecords);

      // レコードが見つからない場合のリトライ機能
      let updateResult = null;
      let updateError = null;
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1秒

      while (retryCount < maxRetries) {
        const result = await supabase
          .from("identity_verifications")
          .update({
            verification_status: 'failed',
            error_message: verificationSession.last_error.reason || '本人確認に失敗しました',
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_verification_session_id", verificationSession.id)
          .eq("user_id", user_id)
          .select();

        updateResult = result.data;
        updateError = result.error;

        console.log(`🔐 失敗更新結果 (試行${retryCount + 1}/${maxRetries}):`, {
          updateResult,
          updateError,
          affectedRows: updateResult?.length || 0
        });

        if (updateError) {
          console.error("🔐 本人確認情報更新エラー:", updateError);
          return;
        }

        if (updateResult && updateResult.length > 0) {
          console.log("🔐 失敗更新成功");
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🔐 レコードが見つからないため ${retryDelay}ms 待機してリトライ...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      if (!updateResult || updateResult.length === 0) {
        console.error("🔐 失敗更新：最大リトライ回数に達しました", {
          sessionId: verificationSession.id,
          userId: user_id,
          maxRetries
        });
                  return;
        }

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
      
      return;
    }
    
    // エラーがない場合は通常の追加情報必要として処理
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

// 本人確認失敗時の処理
async function handleIdentityVerificationFailed(supabase: any, verificationSession: any) {
  console.log("🔐 本人確認失敗webhook処理開始:", { sessionId: verificationSession.id });
  
  try {
    const { user_id, campaign_id } = verificationSession.metadata;
    
    // データベースの本人確認情報を更新
    const { error: updateError } = await supabase
      .from("identity_verifications")
      .update({
        verification_status: 'failed',
        error_message: '本人確認に失敗しました',
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_verification_session_id", verificationSession.id)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("🔐 本人確認情報更新エラー:", updateError);
      return;
    }

    console.log("🔐 本人確認情報更新成功（失敗）");

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
    console.error("🔐 本人確認失敗webhook処理エラー:", error);
  }
}

// Stripe Checkoutセッション完了時の処理
async function handleCheckoutSessionCompleted(supabase: any, session: any) {
  console.log("💳 Checkoutセッション完了webhook処理開始:", { sessionId: session.id });
  
  try {
    const { campaign_id, reward_id, user_id, supporter_id } = session.metadata;
    
    if (!supporter_id) {
      console.error("支援者IDがメタデータにありません");
      return;
    }

    // 支援者レコードを更新
    const { error: updateError } = await supabase
      .from("crowdfunding_supporters")
      .update({ 
        payment_status: "completed",
        stripe_session_id: session.id
      })
      .eq("id", supporter_id);
    
    if (updateError) {
      console.error("Failed to update supporter status:", updateError);
      return;
    }

    // 特典の在庫を減らす（無制限でない場合のみ）
    const { data: reward, error: rewardError } = await supabase
      .from("crowdfunding_rewards")
      .select("id, is_unlimited, remaining_quantity")
      .eq("id", reward_id)
      .single();

    if (rewardError) {
      console.error("Failed to get reward info:", rewardError);
      return;
    }

    // 無制限でない場合のみ在庫を減らす
    if (!reward.is_unlimited && reward.remaining_quantity > 0) {
      const { error: quantityError } = await supabase
        .from("crowdfunding_rewards")
        .update({ 
          remaining_quantity: reward.remaining_quantity - 1,
          updated_at: new Date().toISOString()
        })
        .eq("id", reward_id);

      if (quantityError) {
        console.error("Failed to update reward quantity:", quantityError);
      }
    }

    console.log("💳 Checkoutセッション完了処理成功:", { supporterId: supporter_id });
    
  } catch (error) {
    console.error("💳 Checkoutセッション完了webhook処理エラー:", error);
  }
}

// Stripe Checkout非同期決済成功時の処理
async function handleCheckoutSessionAsyncPaymentSucceeded(supabase: any, session: any) {
  console.log("💳 Checkout非同期決済成功webhook処理開始:", { sessionId: session.id });
  
  try {
    const { supporter_id } = session.metadata;
    
    if (!supporter_id) {
      console.error("支援者IDがメタデータにありません");
      return;
    }

    // 支援者レコードを更新（既に完了済みの場合もあるため、upsert的な処理）
    const { error: updateError } = await supabase
      .from("crowdfunding_supporters")
      .update({ 
        payment_status: "completed"
      })
      .eq("id", supporter_id);
    
    if (updateError) {
      console.error("Failed to update supporter status:", updateError);
    }

    console.log("💳 Checkout非同期決済成功処理完了:", { supporterId: supporter_id });
    
  } catch (error) {
    console.error("💳 Checkout非同期決済成功webhook処理エラー:", error);
  }
}

// Stripe Checkout非同期決済失敗時の処理
async function handleCheckoutSessionAsyncPaymentFailed(supabase: any, session: any) {
  console.log("💳 Checkout非同期決済失敗webhook処理開始:", { sessionId: session.id });
  
  try {
    const { supporter_id } = session.metadata;
    
    if (!supporter_id) {
      console.error("支援者IDがメタデータにありません");
      return;
    }

    // 支援者レコードを失敗に更新
    const { error: updateError } = await supabase
      .from("crowdfunding_supporters")
      .update({ 
        payment_status: "failed"
      })
      .eq("id", supporter_id);
    
    if (updateError) {
      console.error("Failed to update supporter status:", updateError);
    }

    console.log("💳 Checkout非同期決済失敗処理完了:", { supporterId: supporter_id });
    
  } catch (error) {
    console.error("💳 Checkout非同期決済失敗webhook処理エラー:", error);
  }
} 