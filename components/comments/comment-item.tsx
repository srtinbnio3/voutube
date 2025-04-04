'use client'

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageSquare, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface CommentItemProps {
  comment: CommentWithReplies
  onCommentUpdated: (comment: CommentWithReplies) => void
  onCommentDeleted: (commentId: string) => void
}

export function CommentItem({ comment, onCommentUpdated, onCommentDeleted }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const { toast } = useToast()

  // 編集モードの切り替え
  const toggleEdit = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setEditedContent(comment.content)
    }
  }

  // 返信モードの切り替え
  const toggleReply = () => {
    setIsReplying(!isReplying)
    if (!isReplying) {
      setReplyContent("")
    }
  }

  // コメントの更新
  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      toast({
        title: 'エラー',
        description: 'コメントを入力してください',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: editedContent.trim()
        })
      })

      if (!response.ok) throw new Error('コメントの更新に失敗しました')

      const updatedComment = await response.json()
      onCommentUpdated(updatedComment)
      setIsEditing(false)

      toast({
        title: '更新完了',
        description: 'コメントが更新されました'
      })
    } catch (error) {
      console.error('コメント更新エラー:', error)
      toast({
        title: 'エラーが発生しました',
        description: 'コメントの更新に失敗しました',
        variant: 'destructive'
      })
    }
  }

  // コメントの削除
  const handleDelete = async () => {
    if (!confirm('このコメントを削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('コメントの削除に失敗しました')

      onCommentDeleted(comment.id)

      toast({
        title: '削除完了',
        description: 'コメントが削除されました'
      })
    } catch (error) {
      console.error('コメント削除エラー:', error)
      toast({
        title: 'エラーが発生しました',
        description: 'コメントの削除に失敗しました',
        variant: 'destructive'
      })
    }
  }

  // 返信の投稿
  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: 'エラー',
        description: '返信を入力してください',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: comment.post_id,
          content: replyContent.trim(),
          parentId: comment.id
        })
      })

      if (!response.ok) throw new Error('返信の投稿に失敗しました')

      const newReply = await response.json()
      onCommentUpdated({
        ...comment,
        replies: [...(comment.replies || []), newReply]
      })
      setIsReplying(false)
      setReplyContent("")

      toast({
        title: '投稿完了',
        description: '返信が投稿されました'
      })
    } catch (error) {
      console.error('返信投稿エラー:', error)
      toast({
        title: 'エラーが発生しました',
        description: '返信の投稿に失敗しました',
        variant: 'destructive'
      })
    }
  }

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="space-y-4">
      {/* コメントの内容 */}
      <div className="flex gap-4">
        <Link href={`/profile/${comment.profiles.id}`} className="hover:opacity-80">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={comment.profiles.avatar_url || undefined}
              alt={comment.profiles.username}
            />
            <AvatarFallback>{getInitials(comment.profiles.username)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${comment.profiles.id}`}
                className="font-medium hover:underline"
              >
                {comment.profiles.username}
              </Link>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  locale: ja,
                  addSuffix: true
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={toggleReply}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                返信
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={toggleEdit}
              >
                <Pencil className="h-4 w-4 mr-1" />
                編集
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={toggleEdit}>
                  キャンセル
                </Button>
                <Button onClick={handleUpdate}>更新</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>

      {/* 返信フォーム */}
      {isReplying && (
        <div className="ml-12 space-y-2">
          <Textarea
            placeholder="返信を入力..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={toggleReply}>
              キャンセル
            </Button>
            <Button onClick={handleReply}>返信</Button>
          </div>
        </div>
      )}
    </div>
  )
} 