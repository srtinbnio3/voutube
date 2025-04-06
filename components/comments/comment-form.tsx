'use client'

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuthDialog } from '@/hooks/use-auth-dialog'
import { AuthDialog } from '@/components/ui/auth-dialog'

interface CommentFormProps {
  postId: string
  parentId?: string
  replyToUsername?: string
  onCommentAdded: (comment: CommentWithReplies) => void
  onCancel?: () => void
}

export function CommentForm({
  postId,
  parentId,
  replyToUsername,
  onCommentAdded,
  onCancel
}: CommentFormProps) {
  const [content, setContent] = useState(replyToUsername ? `@${replyToUsername} ` : '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { open, setOpen, checkAuthAndShowDialog } = useAuthDialog()

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

    // ログイン状態を確認し、未ログインならダイアログを表示
    const isAuthenticated = await checkAuthAndShowDialog()
    if (!isAuthenticated) return

    setIsSubmitting(true)
    try {
      // @メンションの処理
      const mentioned_username = replyToUsername && content.startsWith(`@${replyToUsername}`) 
        ? replyToUsername 
        : undefined

      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId,
          mentioned_username
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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={replyToUsername ? `@${replyToUsername} に返信...` : 'コメントを入力...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] text-sm sm:text-base"
          disabled={isSubmitting}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs sm:text-sm"
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="text-xs sm:text-sm">
            {isSubmitting ? '投稿中...' : '投稿'}
          </Button>
        </div>
      </form>
      
      {/* 認証ダイアログ */}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 