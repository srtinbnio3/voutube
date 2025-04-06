'use client'

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageSquare, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { CommentForm } from './comment-form'
import { useAuthDialog } from '@/hooks/use-auth-dialog'
import { AuthDialog } from '@/components/ui/auth-dialog'

interface CommentItemProps {
  comment: CommentWithReplies
  onCommentUpdated: (comment: CommentWithReplies) => void
  onCommentDeleted: (commentId: string) => void
  isNested?: boolean
}

export function CommentItem({ 
  comment, 
  onCommentUpdated, 
  onCommentDeleted,
  isNested = false 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const { toast } = useToast()
  const { open, setOpen, checkAuthAndShowDialog } = useAuthDialog()

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

  // 返信ボタンのクリック処理
  const handleReplyClick = async () => {
    // ログイン状態を確認し、未ログインならダイアログを表示
    const isAuthenticated = await checkAuthAndShowDialog()
    if (!isAuthenticated) return
    
    // ログイン済みなら返信フォームを表示
    setIsReplying(!isReplying)
  }

  // 返信の追加
  const handleCommentAdded = (newReply: CommentWithReplies) => {
    // APIから返されたコメントをそのまま親コンポーネントに通知
    // これにより、親コンポーネントで適切な場所に追加される
    onCommentUpdated(newReply);
    setIsReplying(false);
  }

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // コメント内容の表示（@メンション対応）
  const renderContent = () => {
    // URLを検出してリンク化する関数
    const linkifyText = (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {part}
            </a>
          );
        }
        return part;
      });
    };

    if (comment.mentioned_username) {
      // @メンションが含まれる場合のレンダリング
      const mentionPattern = new RegExp(`@${comment.mentioned_username}\\s?`);
      const contentWithoutMention = comment.content.replace(mentionPattern, '');
      
      return (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          <Link 
            href={`/profile/${comment.profiles.id}`} 
            className="text-blue-500 hover:underline font-medium"
          >
            @{comment.mentioned_username}
          </Link>
          {' '}{linkifyText(contentWithoutMention)}
        </p>
      )
    }
    
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {linkifyText(comment.content)}
      </p>
    )
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

          {renderContent()}

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary text-xs sm:text-sm"
              onClick={handleReplyClick}
            >
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              返信
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive text-xs sm:text-sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 返信フォーム */}
      {isReplying && (
        <div className="ml-4 sm:ml-12">
          <CommentForm
            postId={comment.post_id}
            parentId={comment.id}
            replyToUsername={comment.profiles.username}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}
      
      {/* 認証ダイアログ */}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </div>
  )
} 