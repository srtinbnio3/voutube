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
    
    // チャンネル情報を取得（YouTube channel IDが必要）
    const { data: channelData, error: channelError } = await supabase
      .from("channels")
      .select("youtube_channel_id, name")
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
        error: "Google認証情報が見つかりません。再度ログインしてください。",
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
      console.error("YouTube API エラー:", response.status, response.statusText);
      let errorData;
      try {
        errorData = await response.json();
        console.error("YouTube API エラー詳細:", errorData);
      } catch (e) {
        console.error("YouTube APIエラーレスポンスのパースに失敗:", e);
        errorData = { error: "レスポンスの解析に失敗" };
      }
      
      return NextResponse.json({ 
        error: "YouTube APIへのアクセスに失敗しました",
        details: `Status: ${response.status} - ${response.statusText}`,
        youtubeError: errorData
      }, { status: 400 });
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
    
    return NextResponse.json({ 
      isOwner: true,
      channelTitle: ownedChannel.snippet.title || channelData.name,
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