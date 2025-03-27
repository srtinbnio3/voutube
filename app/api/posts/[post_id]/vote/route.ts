import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GETメソッドを追加: 特定の投稿に対するユーザーの投票状態を取得
export async function GET(
  request: NextRequest
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // URLからpost_idとuserIdを取得
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const post_id = pathParts[pathParts.length - 2]
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      )
    }
    
    // ユーザーの投票を取得
    const { data: vote } = await supabase
      .from('votes')
      .select('is_upvote')
      .eq('post_id', post_id)
      .eq('user_id', userId)
      .maybeSingle()
    
    return NextResponse.json(vote || { is_upvote: null })
  } catch (error) {
    console.error('投票状態の取得エラー:', error)
    return NextResponse.json(
      { error: '投票状態の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // URLからpost_idを取得
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const post_id = pathParts[pathParts.length - 2]
    
    const { userId, isUpvote } = await request.json()

    // 既存の投票を確認
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', post_id)
      .eq('user_id', userId)
      .single()

    if (isUpvote === null) {
      // 投票を取り消す
      if (existingVote) {
        await supabase
          .from('votes')
          .delete()
          .eq('post_id', post_id)
          .eq('user_id', userId)
      }
    } else {
      if (existingVote) {
        // 既存の投票を更新
        await supabase
          .from('votes')
          .update({ is_upvote: isUpvote })
          .eq('post_id', post_id)
          .eq('user_id', userId)
      } else {
        // 新規投票を追加
        await supabase
          .from('votes')
          .insert({
            post_id: post_id,
            user_id: userId,
            is_upvote: isUpvote
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('投票の更新エラー:', error)
    return NextResponse.json(
      { error: '投票の更新に失敗しました' },
      { status: 500 }
    )
  }
} 