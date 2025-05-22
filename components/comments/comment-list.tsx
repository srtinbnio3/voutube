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
    // APIからの返信で親コメントIDが変更されている場合があるため、その状態を確認
    const originalParentId = (newComment as any).parentId;
    
    // 親コメントの場合は先頭に追加
    if (!originalParentId) {
      setComments((prev) => [newComment, ...prev])
      return;
    }

    // 返信の場合は親コメントに追加
    setComments((prev) => {
      // まず該当する親コメントを直接探す
      const parentComment = prev.find(comment => comment.id === originalParentId);

      if (parentComment) {
        // 直接の親コメントが見つかった場合
        return prev.map((comment) => {
          if (comment.id === originalParentId) {
            return {
              ...comment,
              replies: Array.isArray(comment.replies) 
                ? [...comment.replies, newComment] 
                : [newComment]
            };
          }
          return comment;
        });
      } else {
        // 直接の親が見つからない場合（2階層目以降の返信の場合）
        // すべての親コメントの返信を検索して、元の親IDを持つコメントを探す
        let foundParentId: string | null = null;
        
        // どの親コメントに追加すべきかを特定
        prev.forEach(comment => {
          if (Array.isArray(comment.replies)) {
            const isReplyInThisThread = comment.replies.some(reply => reply.id === originalParentId);
            if (isReplyInThisThread) {
              foundParentId = comment.id;
            }
          }
        });
        
        if (foundParentId) {
          // 親コメントが見つかった場合、そのコメントの返信として追加
          return prev.map(comment => {
            if (comment.id === foundParentId) {
              return {
                ...comment,
                replies: Array.isArray(comment.replies) 
                  ? [...comment.replies, newComment] 
                  : [newComment]
              };
            }
            return comment;
          });
        }
        
        // それでも見つからない場合は、状態を変更せずにコンソールに警告
        console.warn('親コメントが見つかりませんでした:', originalParentId);
        return prev;
      }
    });
  }

  const handleCommentUpdated = (updatedComment: CommentWithReplies) => {
    // フラグで更新か追加かを判断
    const isNewReply = updatedComment.replies && updatedComment.replies.length === 0 && (updatedComment as any).parentId;
    
    if (isNewReply) {
      // 新しい返信の場合はhandleCommentAddedを利用
      handleCommentAdded(updatedComment);
      return;
    }
    
    // 既存コメントの更新の場合
    setComments((prev) => {
      return prev.map((comment) => {
        // 親コメントの更新
        if (comment.id === updatedComment.id) {
          // updatedCommentのrepliesがなければ、既存のrepliesを保持
          return { 
            ...comment, 
            ...updatedComment,
            replies: updatedComment.replies || comment.replies || []
          }
        }
        
        // 返信コメントの更新
        if (comment.replies) {
          const updatedReplies = comment.replies.map((reply) => {
            if (reply.id === updatedComment.id) {
              return { 
                ...reply, 
                ...updatedComment,
                // ネストした返信の場合はrepliesを空配列に設定
                replies: Array.isArray(updatedComment.replies) ? updatedComment.replies : []
              }
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
                        comment={{
                          ...reply,
                          replies: Array.isArray(reply.replies) ? reply.replies : []
                        }}
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