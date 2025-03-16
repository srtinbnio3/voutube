"use client"

import { Database } from "@/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { VoteButtons } from "./vote-buttons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react"

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
  const router = useRouter()
  const { toast } = useToast()
  const [relativeTime, setRelativeTime] = useState<string>("")
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // クライアントサイドでのみ相対時間を計算
    setRelativeTime(formatDistanceToNow(new Date(post.created_at), { locale: ja, addSuffix: true }))
  }, [post.created_at])

  // 投稿を削除する関数
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("user_id", userId) // 投稿者本人のみ削除可能

      if (error) throw error

      toast({
        title: "投稿を削除しました",
        description: "投稿は完全に削除されました",
      })
      router.refresh()
    } catch (error) {
      console.error("削除エラー:", error)
      toast({
        title: "エラーが発生しました",
        description: "投稿の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // ユーザーの投票状態を取得（undefinedの可能性を排除）
  const userVote = userId && post.votes 
    ? post.votes.find(vote => vote.user_id === userId)?.is_upvote ?? null
    : null

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  // 投稿者かどうかを判定
  const isAuthor = userId === post.user_id

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
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
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
                {relativeTime || new Date(post.created_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
            {isAuthor && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-destructive hover:text-destructive/80" aria-label="投稿を削除">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消せません。投稿は完全に削除されます。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      削除する
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {/* MVPでは投稿詳細ページが未実装のため、リンクではなく通常のテキストとして表示 */}
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          
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