"use client"

import { Database } from "@/database.types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { VoteButtons } from "./vote-buttons"

// 投稿データの型定義を拡張
type PostWithVotes = Database["public"]["Tables"]["posts"]["Row"] & {
  votes: {
    is_upvote: boolean
    user_id: string
  }[]
}

interface PostCardProps {
  post: PostWithVotes
  userId?: string  // ログイン中のユーザーID（オプション）
}

export function PostCard({ post, userId }: PostCardProps) {
  // ユーザーの投票状態を取得（undefinedの可能性を排除）
  const userVote = userId && post.votes 
    ? post.votes.find(vote => vote.user_id === userId)?.is_upvote ?? null
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{post.title}</h3>
          <VoteButtons
            postId={post.id}
            initialScore={post.score || 0}
            initialVote={userVote}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.description}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          投稿: {formatDistanceToNow(new Date(post.created_at), { locale: ja, addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
} 