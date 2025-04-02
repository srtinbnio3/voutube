'use client'

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface CommentFormProps {
  postId: string
  parentId?: string
  onCommentAdded: (comment: CommentWithReplies) => void
  onCancel?: () => void
}

export function CommentForm({
  postId,
  parentId,
  onCommentAdded,
  onCancel
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: 'エラー',
        description: 'コメントを入力してください',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newComment = await response.json()
      onCommentAdded(newComment)
      setContent('')

      toast({
        title: '投稿完了',
        description: 'コメントが投稿されました'
      })
    } catch (error) {
      console.error('Failed to post comment:', error)
      toast({
        title: 'エラーが発生しました',
        description: 'コメントの投稿に失敗しました',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="コメントを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
        disabled={isSubmitting}
      />
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '投稿中...' : '投稿'}
        </Button>
      </div>
    </form>
  )
} 