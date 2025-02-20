"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// コンポーネントのプロパティの型定義
interface VoteButtonsProps {
  postId: string
  initialScore: number
  initialVote?: boolean | null  // true: いいね, false: バット, null: 未投票
}

export function VoteButtons({ postId, initialScore, initialVote }: VoteButtonsProps) {
  // 状態管理
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState(initialVote)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投票処理
  async function handleVote(isUpvote: boolean) {
    setIsLoading(true)

    try {
      // ログイン状態の確認
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const currentPath = window.location.pathname
        router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
        return
      }

      // 投票データの更新
      const { error } = await supabase
        .from("votes")
        .upsert({
          post_id: postId,
          user_id: session.user.id,
          is_upvote: isUpvote,
        })

      if (error) throw error

      // 投票状態の更新
      setCurrentVote(isUpvote)
      
      // スコアの更新（楽観的更新）
      if (currentVote === isUpvote) {
        // 同じボタンを押した場合は投票を取り消し
        setScore(score - (isUpvote ? 1 : -1))
        setCurrentVote(null)
      } else {
        // 異なるボタンを押した場合は投票を切り替え
        setScore(score + (isUpvote ? (currentVote === false ? 2 : 1) : (currentVote === true ? -2 : -1)))
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "投票に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* いいねボタン */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(true)}
        disabled={isLoading}
        className={currentVote === true ? "text-green-500" : ""}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>

      {/* スコア表示 */}
      <span className="min-w-[2rem] text-center">{score}</span>

      {/* バットボタン */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(false)}
        disabled={isLoading}
        className={currentVote === false ? "text-red-500" : ""}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 