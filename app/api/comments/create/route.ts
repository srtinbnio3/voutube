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
    const { postId, content, parentId, mentioned_username } = body

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

    // コメントを作成
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content,
        parent_id: finalParentId,
        user_id: session.user.id,
        mentioned_username: finalMentionedUsername
      })
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

    // コメントに空のreplies配列を追加
    const commentWithReplies = {
      ...comment,
      replies: []
    }

    return NextResponse.json(commentWithReplies)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 