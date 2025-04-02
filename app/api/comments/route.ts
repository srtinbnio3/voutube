import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { CommentResponse } from '@/types/comment'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // 親コメントの総数を取得
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .is('parent_id', null)

  // 親コメントを取得
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 各コメントの返信を取得
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const { data: replies } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true })

      return {
        ...comment,
        replies: replies || []
      }
    })
  )

  const response: CommentResponse = {
    comments: commentsWithReplies,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > page * limit
  }

  return NextResponse.json(response)
} 