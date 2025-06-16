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
          className="min-h-[100px] text-sm sm:text-base backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 focus:bg-white/70 dark:focus:bg-slate-800/70 transition-all duration-200"
          disabled={isSubmitting}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-800/90 border-0 shadow-lg transition-all duration-200 text-xs sm:text-sm"
            >
              キャンセル
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            variant="ghost"
            className="backdrop-blur-sm bg-gradient-to-r from-blue-500/70 to-purple-500/70 hover:from-blue-600/80 hover:to-purple-600/80 border-0 shadow-lg transition-all duration-200 text-white hover:text-white text-xs sm:text-sm"
          >
            {isSubmitting ? '投稿中...' : '投稿'}
          </Button>
        </div>
      </form>
      
      {/* 認証ダイアログ */}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 