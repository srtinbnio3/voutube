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

      // 現在の投票状態を確認
      const isRemovingVote = currentVote === isUpvote

      if (isRemovingVote) {
        // 同じボタンを押した場合は投票を削除
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", session.user.id)

        if (error) throw error

        // スコアを更新（-1 または +1）
        setScore(score - (isUpvote ? 1 : -1))
        setCurrentVote(null)
      } else {
        // 既存の投票があれば削除
        if (currentVote !== null) {
          const { error: deleteError } = await supabase
            .from("votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", session.user.id)

          if (deleteError) throw deleteError
        }

        // 新規投票を作成
        const { error: insertError } = await supabase
          .from("votes")
          .insert({
            post_id: postId,
            user_id: session.user.id,
            is_upvote: isUpvote,
          })

        if (insertError) throw insertError

        // スコアを更新
        if (currentVote !== null) {
          // 投票を変更する場合は2ポイント変動
          setScore(score + (isUpvote ? 2 : -2))
        } else {
          // 新規投票の場合は1ポイント変動
          setScore(score + (isUpvote ? 1 : -1))
        }
        setCurrentVote(isUpvote)
      }

      router.refresh()
    } catch (error) {
      console.error('投票処理でエラーが発生:', error)
      toast({
        title: "投票に失敗しました",
        description: error instanceof Error 
          ? `エラー: ${error.message}`
          : "予期せぬエラーが発生しました",
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