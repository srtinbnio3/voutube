"use client"

import { Database } from "@/database.types"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="mb-3">
      <div className="flex">
        {/* 左側：投票ボタン */}
        <div className="py-4 px-2 bg-accent/30">
          <VoteButtons
            postId={post.id}
            initialScore={post.score || 0}
            initialVote={userVote}
          />
        </div>
        
        {/* 右側：投稿内容 */}
        <CardContent className="p-4 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/profile/${post.profiles.id}`} className="hover:opacity-80">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.profiles.avatar_url || undefined} alt={post.profiles.username} />
                <AvatarFallback>{getInitials(post.profiles.username)}</AvatarFallback>
              </Avatar>
            </Link>
            <span className="text-xs text-muted-foreground">
              <Link 
                href={`/profile/${post.profiles.id}`}
                className="hover:underline font-medium"
              >
                {post.profiles.username}
              </Link>
              {' • '}
              {formatDistanceToNow(new Date(post.created_at), { locale: ja, addSuffix: true })}
            </span>
          </div>
          
          <Link href={`/channels/${post.channel_id}/posts/${post.id}`} className="block">
            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            {post.description}
          </p>
          
          <div className="flex gap-2 mt-3">
            <Link href={`/channels/${post.channel_id}/posts/${post.id}`} className="text-xs text-muted-foreground hover:text-primary flex items-center">
              {/* 「コメントを表示」のテキストを削除 */}
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  )
} 