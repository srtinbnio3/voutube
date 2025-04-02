import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  
  if (!id) {
    return NextResponse.json(
      { error: 'コメントIDが不正です' },
      { status: 400 }
    )
  }
  
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // コメントの存在確認と所有者チェック
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'コメントが見つかりません' },
        { status: 404 }
      )
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'このコメントを削除する権限がありません' },
        { status: 403 }
      )
    }

    // コメントの削除（返信も含めて削除）
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ message: 'コメントを削除しました' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'コメントの削除に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  
  if (!id) {
    return NextResponse.json(
      { error: 'コメントIDが不正です' },
      { status: 400 }
    )
  }
  
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    // コメントの所有者チェック
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'コメントが見つかりません' },
        { status: 404 }
      )
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'このコメントを編集する権限がありません' },
        { status: 403 }
      )
    }

    // コメントの更新
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        id,
        post_id,
        user_id,
        content,
        parent_id,
        created_at,
        updated_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'コメントの更新に失敗しました' },
      { status: 500 }
    )
  }
} 