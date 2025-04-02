'use client'

import { useState } from 'react'
import { Comment } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { CommentReplies } from './comment-replies'
import { CommentActions } from './comment-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface CommentItemProps {
  comment: Comment
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
}

export function CommentItem({
  comment,
  onCommentUpdated,
  onCommentDeleted
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (!editedContent.trim() || editedContent === comment.content) {
      setIsEditing(false)
      return
    }

    setIsSubmitting(true)
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

      if (!response.ok) {
        throw new Error('Failed to update comment')
      }

      const updatedComment = await response.json()
      onCommentUpdated(updatedComment)
      setIsEditing(false)

      toast({
        title: 'コメントを更新しました',
        description: 'コメントが正常に更新されました'
      })
    } catch (error) {
      console.error('Failed to update comment:', error)
      toast({
        title: 'エラーが発生しました',
        description: 'コメントの更新に失敗しました',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('コメントを削除してもよろしいですか？')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      onCommentDeleted(comment.id)

      toast({
        title: 'コメントを削除しました',
        description: 'コメントが正常に削除されました'
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast({
        title: 'エラーが発生しました',
        description: 'コメントの削除に失敗しました',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={comment.profiles.avatar_url || undefined} />
          <AvatarFallback>
            {comment.profiles.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{comment.profiles.username}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja
                })}
              </span>
            </div>
            <CommentActions
              comment={comment}
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              onEdit={() => setIsEditing(true)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? '更新中...' : '更新'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>
      </div>

      <CommentReplies
        comment={comment}
        onCommentUpdated={onCommentUpdated}
        onCommentDeleted={onCommentDeleted}
      />
    </div>
  )
} 