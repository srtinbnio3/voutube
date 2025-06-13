'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// チャンネル取得のレスポンス型
export interface ChannelResponse {
  channels: any[]
  hasMore: boolean
  total: number
}

// チャンネル一覧を段階的に取得するServer Action
export async function getChannels(
  offset: number = 0, 
  limit: number = 16,
  sortBy: string = 'post_count'
): Promise<ChannelResponse> {
  const cookieStore = await cookies()
  
  // Supabaseクライアントの初期化
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

  // ソート条件の設定
  const orderColumn = sortBy === 'latest' ? 'latest_post_at' : 'post_count'
  const ascending = false
  // 最新の投稿順の場合、NULL値（投稿履歴なし）を最後に表示（nullsFirst: falseで実現）
  const nullsFirst = sortBy !== 'latest'

  // チャンネル取得（必要な列のみ）
  const { data: channels, error } = await supabase
    .from("channels")
    .select("id, name, description, icon_url, post_count, latest_post_at, subscriber_count, youtube_channel_id")
    .order(orderColumn, { ascending, nullsFirst })
    .range(offset, offset + limit - 1) // offsetからlimit件取得

  if (error) {
    throw new Error(`チャンネル取得エラー: ${error.message}`)
  }

  // 全体のチャンネル数を取得（hasMoreの判定用）
  const { count: totalCount } = await supabase
    .from("channels")
    .select("*", { count: 'exact', head: true })

  const hasMore = offset + limit < (totalCount || 0)

  return {
    channels: channels || [],
    hasMore,
    total: totalCount || 0
  }
}

// 検索機能付きのチャンネル取得
export async function searchChannels(
  query: string,
  offset: number = 0,
  limit: number = 16,
  sortBy: string = 'post_count'
): Promise<ChannelResponse> {
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

  const orderColumn = sortBy === 'latest' ? 'latest_post_at' : 'post_count'
  const ascending = false
  // 最新の投稿順の場合、NULL値（投稿履歴なし）を最後に表示（nullsFirst: falseで実現）
  const nullsFirst = sortBy !== 'latest'
  
  // 検索クエリでフィルタリング
  const searchQuery = supabase
    .from("channels")
    .select("id, name, description, icon_url, post_count, latest_post_at, subscriber_count, youtube_channel_id")
    .ilike('name', `%${query}%`) // 部分一致検索
    .order(orderColumn, { ascending, nullsFirst })
    .range(offset, offset + limit - 1)

  const { data: channels, error } = await searchQuery

  if (error) {
    throw new Error(`チャンネル検索エラー: ${error.message}`)
  }

  // 検索結果の全体数を取得
  const { count: totalCount } = await supabase
    .from("channels")
    .select("*", { count: 'exact', head: true })
    .ilike('name', `%${query}%`)

  const hasMore = offset + limit < (totalCount || 0)

  return {
    channels: channels || [],
    hasMore,
    total: totalCount || 0
  }
} 