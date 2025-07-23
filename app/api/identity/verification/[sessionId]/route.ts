import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getVerificationSession, formatVerificationData } from "@/app/lib/stripe";

// 本人確認セッションの状態を取得・更新
export async function GET(
  req: NextRequest, 
  context: { params: Promise<{ sessionId: string }> }
) {
  console.log("🔐 本人確認セッション状態取得API開始");
  
  const supabase = await createClient();
  const { sessionId } = await context.params;
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    // データベースから本人確認情報を取得
    const { data: identityVerification, error: dbError } = await supabase
      .from("identity_verifications")
      .select(`
        *,
        campaign:crowdfunding_campaigns!identity_verifications_campaign_id_fkey(id, title)
      `)
      .eq("stripe_verification_session_id", sessionId)
      .eq("user_id", session.user.id)
      .single();

    if (dbError || !identityVerification) {
      console.log("🔐 本人確認情報取得エラー:", dbError);
      return NextResponse.json({ error: "本人確認情報が見つかりません" }, { status: 404 });
    }

    // Stripeから最新の状態を取得
    const verificationSession = await getVerificationSession(sessionId);
    console.log("🔐 Stripe本人確認セッション状態:", { 
      status: verificationSession.status,
      verified: verificationSession.status === 'verified'
    });

    // Stripeステータスをデータベース制約に合わせてマッピング
    const mapStripeStatusToDb = (stripeStatus: string): string => {
      switch (stripeStatus) {
        case 'verified':
          return 'succeeded';
        case 'canceled':
          return 'cancelled';
        case 'requires_input':
        case 'processing':
          return 'pending';
        case 'failed':
          return 'failed';
        default:
          return 'pending';
      }
    };

    const mappedStatus = mapStripeStatusToDb(verificationSession.status);

    // ステータスが変更されていたらデータベースを更新
    if (mappedStatus !== identityVerification.verification_status) {
      console.log("🔐 本人確認ステータス更新:", {
        oldStatus: identityVerification.verification_status,
        stripeStatus: verificationSession.status,
        newDbStatus: mappedStatus
      });

      const updateData: any = {
        verification_status: mappedStatus,
        updated_at: new Date().toISOString(),
      };

      // 確認完了時にデータを保存
      if (verificationSession.status === 'verified') {
        updateData.verified_data = formatVerificationData(verificationSession);
        updateData.verified_at = new Date().toISOString();
      } else if (verificationSession.status === 'canceled') {
        updateData.error_message = "本人確認がキャンセルされました";
      }

      const { error: updateError } = await supabase
        .from("identity_verifications")
        .update(updateData)
        .eq("id", identityVerification.id);

      if (updateError) {
        console.error("🔐 データベース更新エラー:", updateError);
      }

      // キャンペーンの本人確認状況も更新
      if (identityVerification.campaign_id) {
        const campaignStatus = verificationSession.status === 'verified' ? 'verified' :
                              verificationSession.status === 'canceled' ? 'failed' : 'pending';

        await supabase
          .from("crowdfunding_campaigns")
          .update({
            identity_verification_status: campaignStatus
          })
          .eq("id", identityVerification.campaign_id);
      }
    }

    // 最新のデータベース状態を再取得（webhookで更新されている可能性があるため）
    const { data: latestVerification, error: latestError } = await supabase
      .from("identity_verifications")
      .select("*")
      .eq("stripe_verification_session_id", sessionId)
      .eq("user_id", session.user.id)
      .single();

    console.log("🔐 最新のデータベース状態:", {
      sessionId,
      latestVerification: latestVerification ? {
        verification_status: latestVerification.verification_status,
        error_message: latestVerification.error_message,
        updated_at: latestVerification.updated_at
      } : null,
      latestError
    });

    // データベースの状態をStripe APIのステータスフォーマットにマッピング
    const mapDbStatusToStripe = (dbStatus: string): string => {
      switch (dbStatus) {
        case 'succeeded':
          return 'verified';
        case 'failed':
          return 'failed';
        case 'canceled':
          return 'canceled';
        case 'requires_input':
        case 'pending':
        default:
          return 'requires_input';
      }
    };

    // error_messageがある場合は失敗として扱う
    let effectiveStatus: string;
    if (latestVerification?.error_message) {
      effectiveStatus = 'failed';
    } else if (latestVerification?.verification_status) {
      effectiveStatus = mapDbStatusToStripe(latestVerification.verification_status);
    } else {
      effectiveStatus = verificationSession.status;
    }

    console.log("🔐 ステータス決定:", {
      dbStatus: latestVerification?.verification_status,
      stripeStatus: verificationSession.status,
      effectiveStatus
    });

    // レスポンスデータを構築（データベースの状態を優先）
    const responseData = {
      id: identityVerification.id,
      verification_session: {
        id: verificationSession.id,
        status: effectiveStatus, // データベースの状態を反映
        url: verificationSession.url,
        created: verificationSession.created,
        client_secret: verificationSession.client_secret,
      },
      verification_type: identityVerification.verification_type,
      verification_status: latestVerification?.verification_status, // データベースの状態も含める
      campaign: identityVerification.campaign,
      verified_data: latestVerification?.verified_data || identityVerification.verified_data,
      verified_at: latestVerification?.verified_at || identityVerification.verified_at,
      error_message: latestVerification?.error_message,
      created_at: identityVerification.created_at,
      updated_at: latestVerification?.updated_at || identityVerification.updated_at,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("🔐 本人確認セッション状態取得エラー:", error);
    return NextResponse.json(
      { error: "本人確認セッションの状態取得に失敗しました" }, 
      { status: 500 }
    );
  }
} 