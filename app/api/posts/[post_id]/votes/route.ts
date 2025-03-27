import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
    
    // URLからpost_idを取得
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const post_id = pathParts[pathParts.length - 2]
    
    // 投票データを取得
    const { data: votes } = await supabase
      .from('votes')
      .select('is_upvote, user_id')
      .eq('post_id', post_id)

    // スコアを計算
    const score = votes?.reduce((acc: number, vote: { is_upvote: boolean }) => {
      return acc + (vote.is_upvote ? 1 : -1)
    }, 0) || 0

    return NextResponse.json({ score, votes })
  } catch (error) {
    console.error('投票データの取得エラー:', error)
    return NextResponse.json(
      { error: '投票データの取得に失敗しました' },
      { status: 500 }
    )
  }
} 