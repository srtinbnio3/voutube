"use client"

import { Database } from "@/database.types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { VoteButtons } from "./vote-buttons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// 投稿データの型定義を拡張
type PostWithVotesAndProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  votes: {
    is_upvote: boolean
    user_id: string
  }[],
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface PostCardProps {
  post: PostWithVotesAndProfile
  userId?: string  // ログイン中のユーザーID（オプション）
}

export function PostCard({ post, userId }: PostCardProps) {
  // ユーザーの投票状態を取得（undefinedの可能性を排除）
  const userVote = userId && post.votes 
    ? post.votes.find(vote => vote.user_id === userId)?.is_upvote ?? null
    : null

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${post.profiles.id}`} className="hover:opacity-80">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.profiles.avatar_url || undefined} alt={post.profiles.username} />
                <AvatarFallback>{getInitials(post.profiles.username)}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <h3 className="font-semibold">{post.title}</h3>
              <Link 
                href={`/profile/${post.profiles.id}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                {post.profiles.username}
              </Link>
            </div>
          </div>
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