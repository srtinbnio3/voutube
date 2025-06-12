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
import { Trash2, MessageCircle, Heart, ThumbsDown, TrendingUp, Clock, User } from "lucide-react"
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
import { useCallback, useEffect, useState, memo, useMemo } from "react"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'
import { ShareButton } from "@/components/share-button"
import { useShare } from "@/hooks/use-share"
import { Button } from "@/components/ui/button"
import { formatDistance } from 'date-fns'
import { TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  },
  comment_count: number
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
  const getInitials = useMemo(() => {
    const name = post.profiles?.username || ""
    return name
      .split('')
      .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
      .slice(0, 2)
      .join('')
      .toUpperCase() || "U"
  }, [post.profiles?.username])

  // 投稿を見ている人が、投稿した本人かどうかを確認します
  const isAuthor = userId === post.user_id

  // スコアの状態を計算
  const scoreStatus = useMemo(() => {
    const score = post.score || 0
    if (score >= 10) {
      return {
        color: 'from-green-400 to-emerald-500',
        icon: TrendingUp,
        label: '人気'
      }
    } else if (score >= 5) {
      return {
        color: 'from-blue-400 to-blue-500',
        icon: Heart,
        label: '注目'
      }
    } else if (score >= 0) {
      return {
        color: 'from-slate-400 to-slate-500',
        icon: Heart,
        label: '新規'
      }
    } else {
      return {
        color: 'from-red-400 to-red-500',
        icon: ThumbsDown,
        label: '低評価'
      }
    }
  }, [post.score])

  const { handleShare } = useShare({
    url: typeof window !== 'undefined' ? `${window.location.origin}/channels/${post.channel_id}/posts/${post.id}` : '',
    text: post.title
  })

  // スコアの状態を判定（人気度による色分け）
  const getScoreStatus = (score: number) => {
    if (score >= 10) return { status: 'popular', icon: TrendingUp, color: 'from-emerald-500 to-green-500' }
    if (score <= -5) return { status: 'unpopular', icon: TrendingDown, color: 'from-red-500 to-rose-500' }
    return { status: 'neutral', icon: null, color: 'from-slate-400 to-slate-500' }
  }

  const scoreData = getScoreStatus(post.score || 0)
  const ScoreIcon = scoreData.icon

  // 投稿カードのデザインを作ります
  return (
    <article className="group relative">
      {/* カード本体 - モバイル最適化 */}
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        


        <div className="p-4 sm:p-6">
          {/* ヘッダー部分 - モバイル最適化 */}
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/50 shadow-md flex-shrink-0">
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm sm:text-base font-medium">
                {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium text-slate-900 dark:text-white text-sm sm:text-base truncate">
                  {post.profiles?.username || 'Unknown User'}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {formatDistance(new Date(post.created_at), new Date(), { 
                    addSuffix: true,
                    locale: ja 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* 投稿内容 - モバイル最適化 */}
          <div className="mb-4 sm:mb-6">
            <Link href={`/channels/${post.channel_id}/posts/${post.id}`} className="block group/link">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors duration-200 leading-tight">
                {post.title}
              </h3>
              {post.description && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              )}
            </Link>
          </div>

          {/* フッター部分 - モバイル最適化 */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* 投票ボタン */}
            <div className="flex-shrink-0">
              <VoteButtons 
                postId={post.id} 
                initialScore={post.score || 0}
                initialVote={userVote}
              />
            </div>

            {/* 右側のアイコン群 */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* コメント数 */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">{post.comment_count}</span>
              </div>

              {/* シェアボタン */}
              <div onClick={(e) => e.stopPropagation()}>
                <ShareButton 
                  onShare={handleShare} 
                  className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" 
                />
              </div>

              {/* 削除ボタン（投稿者のみ） */}
              {isAuthor && (
                <div onClick={(e) => e.stopPropagation()}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
          </div>
        </div>

        {/* ホバーエフェクト用グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </article>
  )
})

// コンポーネントの名前を設定
PostCard.displayName = 'PostCard'

// コンポーネントをエクスポート
export { PostCard } 