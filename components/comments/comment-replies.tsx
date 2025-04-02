'use client'

import { useState } from 'react'
import { Comment } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'

interface CommentRepliesProps {
  comment: Comment
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
}

export function CommentReplies({
  comment,
  onCommentUpdated,
  onCommentDeleted
}: CommentRepliesProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const handleCommentAdded = (newComment: Comment) => {
    if (!comment.replies) {
      comment.replies = []
    }
    comment.replies.push(newComment)
    setIsReplying(false)
  }

  if (!comment.replies?.length && !isReplying) {
    return (
      <div className="ml-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReplying(true)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          返信する
        </Button>
      </div>
    )
  }

  return (
    <div className="ml-12 space-y-4">
      {!showReplies && comment.replies?.length ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplies(true)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {comment.replies.length}件の返信を表示
        </Button>
      ) : (
        <>
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
          {isReplying ? (
            <CommentForm
              postId={comment.post_id}
              parentId={comment.id}
              onCommentAdded={handleCommentAdded}
              onCancel={() => setIsReplying(false)}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              返信する
            </Button>
          )}
        </>
      )}
    </div>
  )
} 