"use client"

import { Database } from "@/database.types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

type Post = Database["public"]["Tables"]["posts"]["Row"]

interface PostCardProps {
  post: Post
  onClick?: () => void
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <Card 
      className="hover:bg-accent cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <h3 className="font-semibold">{post.title}</h3>
        <p className="text-sm text-muted-foreground">
          スコア: {post.score || 0}
        </p>
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