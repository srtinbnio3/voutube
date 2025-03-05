"use client"

import { useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "lodash"

// コンポーネントのプロパティの型定義
interface VoteButtonsProps {
  postId: string
  initialScore: number
  initialVote: boolean | null
}

export function VoteButtons({ postId, initialScore, initialVote }: VoteButtonsProps) {
  // 状態管理
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投票をデータベースに保存する関数（デバウンス処理）
  const updateVoteInDb = useCallback(
    debounce(async (isUpvote: boolean | null) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          // 未ログインの場合は処理を中断
          return
        }

        const userId = session.user.id

        if (isUpvote === null) {
          // 投票を取り消す場合
          await supabase
            .from("votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId)
        } else {
          // upsert: 存在すれば更新、なければ挿入
          await supabase
            .from("votes")
            .upsert({
              post_id: postId,
              user_id: userId,
              is_upvote: isUpvote
            })
        }

        // 投稿のスコアを更新
        await supabase
          .from("posts")
          .update({ score })
          .eq("id", postId)

      } catch (error) {
        console.error("投票エラー:", error)
        toast({
          title: "エラーが発生しました",
          description: "投票の更新に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }, 500),
    [postId, score, supabase, toast]
  )

  // 投票ボタンのクリックハンドラ
  const handleVote = async (isUpvote: boolean) => {
    setIsLoading(true)
    
    // ログイン確認
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsLoading(false)
      // 未ログインの場合、現在のURLを保持してログインページへリダイレクト
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
      return
    }

    // 現在の投票状態に基づいてスコアを更新
    let newVote: boolean | null
    let scoreChange = 0

    if (currentVote === isUpvote) {
      // 同じボタンを再度クリック：投票を取り消す
      newVote = null
      scoreChange = isUpvote ? -1 : 1
    } else if (currentVote === null) {
      // 未投票状態から投票
      newVote = isUpvote
      scoreChange = isUpvote ? 1 : -1
    } else {
      // 反対の投票から変更
      newVote = isUpvote
      scoreChange = isUpvote ? 2 : -2
    }

    // 状態を更新
    setCurrentVote(newVote)
    setScore(prevScore => prevScore + scoreChange)
    
    // データベースに反映
    updateVoteInDb(newVote)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 rounded-full p-0 ${currentVote === true ? 'text-orange-500' : ''}`}
        onClick={() => handleVote(true)}
        disabled={isLoading}
        aria-label="upvote"
      >
        <ArrowBigUp className="h-4 w-4" />
      </Button>
      <span 
        data-testid="vote-score"
        className={`text-xs font-bold ${
          currentVote === true ? 'text-orange-500' : 
          currentVote === false ? 'text-blue-500' : ''
        }`}
      >
        {score}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 rounded-full p-0 ${currentVote === false ? 'text-blue-500' : ''}`}
        onClick={() => handleVote(false)}
        disabled={isLoading}
        aria-label="downvote"
      >
        <ArrowBigDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 