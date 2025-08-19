import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createVerificationSession } from "@/app/lib/stripe";

// 本人確認セッションを作成
export async function POST(req: NextRequest) {
  console.log("🔐 本人確認セッション作成API開始");
  
  const supabase = await createClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  console.log("🔐 セッション確認:", { hasSession: !!session, userId: session?.user?.id });
  
  if (!session) {
    console.log("🔐 認証エラー: セッションなし");
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("🔐 リクエストボディ:", body);
    
    const { 
      campaign_id, 
      verification_type = 'individual',
      return_url 
    } = body;

    // 必須項目の検証
    if (!return_url) {
      console.log("🔐 バリデーションエラー: return_url不足");
      return NextResponse.json({ error: "return_urlが必要です" }, { status: 400 });
    }

    // キャンペーンが指定されている場合、権限確認
    if (campaign_id) {
      const { data: campaign, error: campaignError } = await supabase
        .from("crowdfunding_campaigns")
        .select(`
          id,
          channel_id,
          channels!inner(
            id,
            owner_user_id
          )
        `)
        .eq("id", campaign_id)
        .single();

      if (campaignError || !campaign) {
        console.log("🔐 キャンペーン取得エラー:", campaignError);
        return NextResponse.json({ error: "キャンペーンが見つかりません" }, { status: 404 });
      }

      // 型アサーションを使用してチャンネル情報を取得
      const channel = campaign.channels as any;
      
      // キャンペーンのオーナーでない場合はエラー
      if (channel?.owner_user_id !== session.user.id) {
        console.log("🔐 権限エラー: キャンペーンオーナーではない");
        return NextResponse.json({ error: "このキャンペーンの本人確認を行う権限がありません" }, { status: 403 });
      }
    }

    // Stripe本人確認セッションを作成
    const verificationSession = await createVerificationSession({
      type: 'document',
      metadata: {
        user_id: session.user.id,
        campaign_id: campaign_id || '',
        verification_type,
      },
      return_url,
    });

    console.log("🔐 Stripe本人確認セッション作成完了:", { sessionId: verificationSession.id });

    // データベースに本人確認情報を保存
    const { data: identityVerification, error: dbError } = await supabase
      .from("identity_verifications")
      .insert({
        user_id: session.user.id,
        campaign_id: campaign_id || null,
        stripe_verification_session_id: verificationSession.id,
        verification_status: 'pending',
        verification_type,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後に有効期限
      })
      .select()
      .single();

    if (dbError) {
      console.log("🔐 データベース保存エラー:", dbError);
      return NextResponse.json({ error: "データベース保存に失敗しました" }, { status: 500 });
    }

    // キャンペーンの本人確認状況を更新
    if (campaign_id) {
      await supabase
        .from("crowdfunding_campaigns")
        .update({
          identity_verification_id: identityVerification.id,
          identity_verification_status: 'pending'
        })
        .eq("id", campaign_id);
    }

    console.log("🔐 本人確認セッション作成完了");

    return NextResponse.json({
      verification_session: {
        id: verificationSession.id,
        url: verificationSession.url,
        status: verificationSession.status,
      },
      identity_verification_id: identityVerification.id,
    });

  } catch (error) {
    console.error("🔐 本人確認セッション作成エラー:", error);
    return NextResponse.json(
      { error: "本人確認セッションの作成に失敗しました" }, 
      { status: 500 }
    );
  }
}

// 本人確認一覧を取得
export async function GET(req: NextRequest) {
  console.log("🔐 本人確認一覧取得API開始");
  
  const supabase = await createClient();
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const campaign_id = searchParams.get("campaign_id");

    let query = supabase
      .from("identity_verifications")
      .select(`
        *,
        campaign:crowdfunding_campaigns!identity_verifications_campaign_id_fkey(id, title)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    // キャンペーンIDでフィルタ
    if (campaign_id) {
      query = query.eq("campaign_id", campaign_id);
    }

    const { data: verifications, error } = await query;

    if (error) {
      console.log("🔐 本人確認一覧取得エラー:", error);
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ verifications });

  } catch (error) {
    console.error("🔐 本人確認一覧取得エラー:", error);
    return NextResponse.json(
      { error: "本人確認一覧の取得に失敗しました" }, 
      { status: 500 }
    );
  }
} 