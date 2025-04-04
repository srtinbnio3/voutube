'use client'

import { useEffect, useState } from 'react'
import { Comment, CommentResponse, CommentWithReplies } from '@/types/comment'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface CommentListProps {
  postId: string
}

export function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async (currentPage = 1) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        postId,
        page: currentPage.toString(),
        limit: '10'
      })

      const response = await fetch(`/api/comments?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('コメントの取得に失敗しました')
      }

      const data: CommentResponse = await response.json()
      
      if (currentPage === 1) {
        setComments(data.comments)
      } else {
        setComments((prev) => [...prev, ...data.comments])
      }

      setHasMore(data.hasMore)
      setPage(currentPage)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setError('コメントの取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  const handleLoadMore = () => {
    fetchComments(page + 1)
  }

  const handleCommentAdded = (newComment: CommentWithReplies) => {
    // 親コメントの場合は先頭に追加
    if (!newComment.parent_id) {
      setComments((prev) => [newComment, ...prev])
      return
    }

    // 返信の場合は親コメントに追加
    setComments((prev) => {
      return prev.map((comment) => {
        if (comment.id === newComment.parent_id) {
          // 返信配列がない場合は作成
          if (!comment.replies) {
            comment.replies = []
          }
          return {
            ...comment,
            replies: [...comment.replies, newComment]
          }
        }
        return comment
      })
    })
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) => {
      return prev.map((comment) => {
        // 親コメントの更新
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment }
        }
        
        // 返信コメントの更新
        if (comment.replies) {
          const updatedReplies = comment.replies.map((reply) => {
            if (reply.id === updatedComment.id) {
              return { ...reply, ...updatedComment }
            }
            return reply
          })
          return { ...comment, replies: updatedReplies }
        }
        
        return comment
      })
    })
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => {
      // 親コメントの削除
      const filtered = prev.filter((comment) => comment.id !== commentId)
      
      // 返信コメントの削除
      return filtered.map((comment) => {
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== commentId)
          }
        }
        return comment
      })
    })
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentItem
              comment={comment}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
            
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => toggleReplies(comment.id)}
                >
                  {expandedReplies.has(comment.id) ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      返信を折りたたむ
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      返信を表示 ({comment.replies.length})
                    </>
                  )}
                </Button>
                
                {expandedReplies.has(comment.id) && (
                  <div className="space-y-4">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply as CommentWithReplies}
                        onCommentUpdated={handleCommentUpdated}
                        onCommentDeleted={handleCommentDeleted}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {error && <p className="text-destructive">{error}</p>}
        
        {hasMore && !isLoading && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleLoadMore}>
              もっと見る
            </Button>
          </div>
        )}
        
        {!hasMore && comments.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            これ以上コメントはありません
          </p>
        )}
        
        {!isLoading && comments.length === 0 && !error && (
          <p className="text-center text-sm text-muted-foreground">
            まだコメントはありません
          </p>
        )}
      </div>
    </div>
  )
} 