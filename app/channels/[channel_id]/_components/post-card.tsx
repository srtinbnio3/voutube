// このファイルは、投稿（記事）を表示するためのカードを作るプログラムです
"use client"

// 必要な部品を取り込みます
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
import { useCallback, useEffect, useState, memo } from "react"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'

// 投稿の情報（タイトル、内容、投票、投稿者など）の形を決めます
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

// このコンポーネントが受け取る情報の形を決めます
interface PostCardProps {
  post: PostWithVotesAndProfile  // 表示する投稿の情報
  userId?: string  // 見ている人のID（ログインしていない場合は空）
}

// 投稿カードを作る関数です
const PostCard = memo(function PostCard({ post, userId }: PostCardProps) {
  const router = useRouter()
  const { toast } = useToast()  // 通知を表示するための道具
  const [relativeTime, setRelativeTime] = useState<string>("")  // 「3分前」などの時間表示用
  // 投票の状態を管理
  const [userVoteState, setUserVoteState] = useState<boolean | null>(null)
  const [initialUserVoteChecked, setInitialUserVoteChecked] = useState(false)
  
  // データベースに接続するための設定
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投稿がいつ作られたかを「3分前」のような形で表示するための設定
  useEffect(() => {
    setRelativeTime(formatDistanceToNow(new Date(post.created_at), { locale: ja, addSuffix: true }))
  }, [post.created_at])

  // 投票状態の取得
  const { data: voteData } = useSWR(
    userId ? `/api/posts/${post.id}/votes` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // 投票データが更新されたら状態を更新
  useEffect(() => {
    if (voteData && !initialUserVoteChecked && userId) {
      // ユーザーの投票状態を更新
      const userVote = voteData.votes?.find((vote: { user_id: string; is_upvote: boolean }) => vote.user_id === userId)
      if (userVote) {
        setUserVoteState(userVote.is_upvote)
      }
      setInitialUserVoteChecked(true)
    }
  }, [voteData, initialUserVoteChecked, userId])

  // 投稿を削除するためのボタンが押されたときの動作
  const handleDelete = useCallback(async () => {
    try {
      // データベースから投稿を削除します
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("user_id", userId)  // 投稿した本人だけが削除できます

      if (error) throw error

      // 削除成功を通知します
      toast({
        title: "投稿を削除しました",
        description: "投稿は完全に削除されました",
      })
      router.refresh()  // ページを更新して、削除した投稿を消します
    } catch (error) {
      // エラーが起きたときは、エラーを通知します
      console.error("削除エラー:", error)
      toast({
        title: "エラーが発生しました",
        description: "投稿の削除に失敗しました",
        variant: "destructive",
      })
    }
  }, [post.id, userId, supabase, toast, router])

  // この投稿に対する「いいね」や「よくないね」の状態を確認します
  const userVote = userId && post.votes 
    ? post.votes.find(vote => vote.user_id === userId)?.is_upvote ?? null
    : null

  // ユーザー名の最初の文字を取り出します（アイコンがないときに表示するため）
  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  // 投稿を見ている人が、投稿した本人かどうかを確認します
  const isAuthor = userId === post.user_id

  // 投稿カードのデザインを作ります
  return (
    <Card className="mb-3 hover:bg-accent transition-colors group">
      <div className="flex">
        {/* 左側に投票（いいね・よくないね）ボタンを置きます */}
        <div className="py-4 px-2 bg-accent/30 relative z-10">
          <VoteButtons
            postId={post.id}
            initialScore={post.score || 0}
            initialVote={userVote}
          />
        </div>
        
        {/* 右側に投稿の内容を表示します */}
        <Link href={`/channels/${post.channel_id}/posts/${post.id}`} className="flex-1 cursor-pointer">
          <CardContent className="p-4">
            {/* 投稿者の情報（アイコン、名前、投稿時間）を表示します */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()} className="relative z-10">
                  <Link href={`/profile/${post.profiles.id}`} className="hover:opacity-80">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={post.profiles.avatar_url || undefined} 
                        alt={post.profiles.username} 
                      />
                      <AvatarFallback>{getInitials(post.profiles.username)}</AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
                <span className="text-xs text-muted-foreground">
                  <div onClick={(e) => e.stopPropagation()} className="relative z-10 inline">
                    <Link 
                      href={`/profile/${post.profiles.id}`}
                      className="hover:underline font-medium"
                    >
                      {post.profiles.username}
                    </Link>
                  </div>
                  {' • '}
                  {relativeTime || new Date(post.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>

              {/* 投稿した本人なら、削除ボタンを表示します */}
              {isAuthor && (
                <div onClick={(e) => e.stopPropagation()} className="relative z-10">
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
                </div>
              )}
            </div>
            
            {/* 投稿のタイトルを表示します */}
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            
            {/* 投稿の内容を表示します（改行もそのまま表示されます） */}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {post.description}
            </p>
          </CardContent>
        </Link>
      </div>
    </Card>
  )
})

// コンポーネントの名前を設定
PostCard.displayName = 'PostCard'

// コンポーネントをエクスポート
export { PostCard } 