import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getChannelInfo } from '@/utils/youtube'

// 更新間隔を1時間に設定（ミリ秒）
const UPDATE_INTERVAL = 60 * 60 * 1000

export async function GET(
  request: NextRequest
) {
  try {
    // URLからchannel_idを取得
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const channel_id = pathParts[pathParts.length - 2]

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // チャンネル情報を取得
    const { data: channel } = await supabase
      .from('channels')
      .select('youtube_channel_id, subscriber_count, updated_at, created_at')
      .eq('id', channel_id)
      .single()

    if (!channel) {
      return NextResponse.json(
        { error: 'チャンネルが見つかりません' },
        { status: 404 }
      )
    }

    // 最後の更新から1時間以内の場合はキャッシュされた値を返す
    const lastUpdate = new Date(channel.updated_at).getTime()
    const now = new Date().getTime()
    
    // 次の条件のいずれかに当てはまる場合は、YouTube APIから最新情報を取得
    // 1. 新規チャンネル（updated_atとcreated_atが同じ）
    // 2. 登録者数が未設定または0
    // 3. 前回の更新から1時間以上経過
    const isNewChannel = channel.updated_at === channel.created_at
    const hasNoSubscribers = !channel.subscriber_count || channel.subscriber_count === 0
    const isStale = now - lastUpdate >= UPDATE_INTERVAL
    
    if (!isNewChannel && !hasNoSubscribers && !isStale) {
      console.log(`キャッシュされた登録者数を返します: ${channel.subscriber_count}`)
      return NextResponse.json({ subscriber_count: channel.subscriber_count })
    }

    // YouTube APIから最新の登録者数を取得
    console.log(`YouTube APIから登録者数を取得します: ${channel.youtube_channel_id}`)
    const channelInfo = await getChannelInfo(channel.youtube_channel_id)
    
    if (!channelInfo) {
      // APIから取得できない場合は、データベースの値を返す
      return NextResponse.json({ subscriber_count: channel.subscriber_count || 0 })
    }

    // データベースの登録者数を更新
    const { error: updateError } = await supabase
      .from('channels')
      .update({ 
        subscriber_count: channelInfo.subscriber_count,
        updated_at: new Date().toISOString()
      })
      .eq('id', channel_id)

    if (updateError) {
      console.error('データベース更新エラー:', updateError)
      // 更新に失敗しても最新の登録者数は返す
      return NextResponse.json({ subscriber_count: channelInfo.subscriber_count })
    }

    return NextResponse.json({ subscriber_count: channelInfo.subscriber_count })
  } catch (error) {
    console.error('登録者数の取得エラー:', error)
    return NextResponse.json(
      { error: '登録者数の取得に失敗しました' },
      { status: 500 }
    )
  }
} 