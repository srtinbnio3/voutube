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
        id,
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
            id,
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const { postId, content, parentId, mentioned_username } = json

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'postId and content are required' },
        { status: 400 }
      )
    }

    // 2階層目以降の返信の処理
    let finalParentId = parentId;
    let finalMentionedUsername = mentioned_username;

    if (parentId) {
      // 親コメントとその投稿者情報を取得
      const { data: parentComment } = await supabase
        .from('comments')
        .select(`
          parent_id,
          user_id,
          profiles:user_id (
            username
          )
        `)
        .eq('id', parentId)
        .single()

      // 親コメントが既に返信（parent_idがある）の場合、その親コメントのIDを親として設定
      if (parentComment?.parent_id) {
        finalParentId = parentComment.parent_id;
        
        // ユーザー名を取得して、メンションを設定
        if (!finalMentionedUsername) {
          // ユーザーIDから直接ユーザー名を取得
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', parentComment.user_id)
            .single();
          
          if (userProfile) {
            finalMentionedUsername = userProfile.username;
          }
        }
      }
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content,
          parent_id: finalParentId || null,
          user_id: user.id,
          mentioned_username: finalMentionedUsername
        }
      ])
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ...comment, replies: [] })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 