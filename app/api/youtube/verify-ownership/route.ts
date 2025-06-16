import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  return NextResponse.json({ 
    message: "verify-ownership API is working",
    timestamp: new Date().toISOString()
  });
}

/**
 * クラウドファンディング開始時のチャンネル所有権確認
 * YouTube APIを使って実際の所有権を確認します
 */
export async function POST(req: Request) {
  try {
    console.log("=== verify-ownership POST開始 ===");
    
    const { channelId } = await req.json();
    console.log("受信したchannelId:", channelId);
    
    if (!channelId) {
      console.error("チャンネルIDが不足");
      return NextResponse.json({ error: "チャンネルIDが必要です" }, { status: 400 });
    }
    
    // ユーザー認証確認
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("セッションが存在しません");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    console.log("認証成功、ユーザーID:", session.user.id);
    console.log("provider_token存在:", !!session.provider_token);
    
    // チャンネル情報を取得（所有権キャッシュ情報を含む）
    const { data: channelData, error: channelError } = await supabase
      .from("channels")
      .select(`
        youtube_channel_id, 
        name,
        owner_user_id,
        ownership_verified_at,
        ownership_verification_expires_at,
        last_ownership_check_at
      `)
      .eq("id", channelId)
      .single();
    
    console.log("チャンネル情報:", { channelData, channelError });
    
    if (channelError || !channelData) {
      console.error("チャンネル情報取得エラー:", channelError);
      return NextResponse.json({ 
        error: `チャンネル情報の取得に失敗しました。チャンネルID: ${channelId}`,
        details: channelError?.message || "チャンネルが見つかりません" 
      }, { status: 404 });
    }

    // キャッシュされた所有権情報をチェック
    const now = new Date();
    const hasValidCache = channelData.owner_user_id && 
                         channelData.ownership_verification_expires_at && 
                         new Date(channelData.ownership_verification_expires_at) > now;

    console.log("所有権キャッシュ確認:", {
      hasOwner: !!channelData.owner_user_id,
      expiresAt: channelData.ownership_verification_expires_at,
      isExpired: channelData.ownership_verification_expires_at ? 
                new Date(channelData.ownership_verification_expires_at) <= now : true,
      hasValidCache,
      currentUserId: session.user.id
    });

    // キャッシュが有効で、現在のユーザーが所有者の場合は即座に成功を返す
    if (hasValidCache && channelData.owner_user_id === session.user.id) {
      console.log("キャッシュされた所有権情報を使用:", {
        ownerId: channelData.owner_user_id,
        verifiedAt: channelData.ownership_verified_at
      });
      
      return NextResponse.json({ 
        isOwner: true,
        channelTitle: channelData.name,
        cached: true,
        verifiedAt: channelData.ownership_verified_at
      });
    }

    // キャッシュが無効、または別のユーザーの場合はYouTube APIで確認
    console.log("YouTube API所有権確認が必要:", {
      reason: hasValidCache ? 
        (channelData.owner_user_id !== session.user.id ? "different_user" : "cache_expired") :
        "no_cache"
    });
    
    // Google OAuthプロバイダートークンを取得
    const googleAccessToken = session.provider_token;
    
    if (!googleAccessToken) {
      console.error("Google認証トークンが存在しません");
      console.log("セッション詳細:", {
        user_id: session.user.id,
        provider: session.user.app_metadata?.provider,
        providers: session.user.app_metadata?.providers,
        provider_token: !!session.provider_token,
        provider_refresh_token: !!session.provider_refresh_token
      });
      return NextResponse.json({ 
        error: "YouTube権限が不足しています。YouTubeチャンネルへのアクセス権限付きで再度ログインしてください。",
        details: "provider_tokenが存在しません。Googleアカウントで再ログインが必要です。"
      }, { status: 401 });
    }
    
    console.log("YouTube API所有権確認開始:", { 
      channelId, 
      youtubeChannelId: channelData.youtube_channel_id,
      userId: session.user.id,
      hasAccessToken: !!googleAccessToken,
      tokenLength: googleAccessToken?.length 
    });
    
    // YouTube APIで認証されたユーザーのチャンネル一覧を取得
    console.log("YouTube API呼び出し開始...");
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
      {
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Accept': 'application/json',
        },
      }
    );
    
    console.log("YouTube APIレスポンス状態:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      console.error(`YouTube API エラー: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.error("YouTube API エラー詳細:", errorData);
      
      // YouTube API権限不足エラーの場合
      if (response.status === 403) {
        return NextResponse.json({ 
          error: "YouTube権限が不足しています。YouTubeチャンネルへのアクセス権限付きで再度ログインしてください。",
          details: "insufficient_scope - YouTube APIアクセス権限が不足しています"
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: `YouTube APIエラー: ${errorData.error?.message || response.statusText}`,
        details: errorData 
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log("YouTube API レスポンス:", {
      itemsCount: data.items?.length || 0,
      items: data.items?.map((item: any) => ({ id: item.id, title: item.snippet?.title })) || []
    });
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ 
        error: "このGoogleアカウントに関連付けられたYouTubeチャンネルが見つかりません" 
      }, { status: 404 });
    }
    
    // 指定されたYouTubeチャンネルIDが所有チャンネル一覧に含まれているかチェック
    const ownedChannel = data.items.find((channel: any) => channel.id === channelData.youtube_channel_id);
    
    console.log("所有権確認結果:", {
      targetChannelId: channelData.youtube_channel_id,
      ownedChannelIds: data.items.map((ch: any) => ch.id),
      isOwner: !!ownedChannel
    });
    
    if (!ownedChannel) {
      // 所有権確認失敗時にもチェック時刻を更新
      const { error: updateError } = await supabase
        .from("channels")
        .update({
          last_ownership_check_at: new Date().toISOString()
        })
        .eq("id", channelId);

      if (updateError) {
        console.error("最終チェック時刻更新エラー:", updateError);
      }

      return NextResponse.json({ 
        isOwner: false,
        error: "指定されたチャンネルの所有権が確認できませんでした",
        channelName: channelData.name,
        targetChannelId: channelData.youtube_channel_id,
        ownedChannels: data.items.map((ch: any) => ({ id: ch.id, title: ch.snippet.title }))
      }, { status: 403 });
    }
    
    console.log("所有権確認成功:", {
      channelId: ownedChannel.id,
      channelTitle: ownedChannel.snippet.title,
      userId: session.user.id
    });

    // 所有権確認成功時にキャッシュを更新（30日間有効）
    const verificationExpiry = new Date();
    verificationExpiry.setDate(verificationExpiry.getDate() + 30);

    const { error: updateError } = await supabase
      .from("channels")
      .update({
        owner_user_id: session.user.id,
        ownership_verified_at: new Date().toISOString(),
        ownership_verification_expires_at: verificationExpiry.toISOString(),
        ownership_verification_method: 'youtube_api',
        last_ownership_check_at: new Date().toISOString()
      })
      .eq("id", channelId);

    if (updateError) {
      console.error("所有権キャッシュ更新エラー:", updateError);
      // キャッシュ更新エラーでも所有権確認は成功として扱う
    } else {
      console.log("所有権キャッシュ更新成功:", {
        ownerId: session.user.id,
        expiresAt: verificationExpiry.toISOString()
      });
    }
    
    return NextResponse.json({ 
      isOwner: true,
      channelTitle: ownedChannel.snippet.title || channelData.name,
      cached: false,
      justVerified: true,
      debug: {
        channelId,
        youtubeChannelId: channelData.youtube_channel_id,
        sessionUserId: session.user.id
      }
    });
    
  } catch (error) {
    console.error('=== API Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: "内部サーバーエラー",
      details: error instanceof Error ? error.message : "不明なエラー"
    }, { status: 500 });
  } finally {
    console.log("=== verify-ownership POST終了 ===");
  }
} 