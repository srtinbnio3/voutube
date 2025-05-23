import { createClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { channelId } = await req.json();
    
    if (!channelId) {
      return NextResponse.json({ error: "チャンネルIDが必要です" }, { status: 400 });
    }
    
    // ユーザー認証情報を取得
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    // チャンネル情報を取得
    const { data: channelData, error: channelError } = await supabase
      .from("channels")
      .select("youtube_channel_id, owner_id")
      .eq("id", channelId)
      .single();
    
    if (channelError || !channelData) {
      return NextResponse.json({ error: "チャンネル情報の取得に失敗しました" }, { status: 404 });
    }
    
    const youtubeChannelId = channelData.youtube_channel_id;
    
    // YouTubeデータAPI用の認証情報を取得
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    try {
      // チャンネル所有者情報を取得
      const response = await youtube.channels.list({
        part: ['snippet,contentDetails,statistics'],
        id: [youtubeChannelId]
      });
      
      if (!response.data.items || response.data.items.length === 0) {
        return NextResponse.json({ error: "YouTubeチャンネルが見つかりません" }, { status: 404 });
      }
      
      // データベースに記録されているチャンネルオーナーIDとセッションユーザーIDを比較
      const isOwner = channelData.owner_id === session.user.id;
      
      return NextResponse.json({ 
        isOwner,
        channelTitle: response.data.items[0].snippet?.title || "",
        youtubeChannelId: youtubeChannelId
      });
      
    } catch (ytError) {
      console.error('YouTube API エラー:', ytError);
      return NextResponse.json({ error: "YouTube APIでの確認中にエラーが発生しました" }, { status: 500 });
    }
    
  } catch (error) {
    console.error('チャンネル所有権確認エラー:', error);
    return NextResponse.json({ error: "所有権の確認中にエラーが発生しました" }, { status: 500 });
  }
} 