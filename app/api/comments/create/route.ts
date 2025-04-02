import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { CreateCommentInput } from '@/types/comment'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateCommentInput = await request.json()
    const { postId, content, parentId } = body

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'postId and content are required' },
        { status: 400 }
      )
    }

    // コメントを作成
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content,
        parent_id: parentId,
        user_id: session.user.id
      })
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 