"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import debounce from "lodash/debounce"

// コンポーネントのプロパティの型定義
interface VoteButtonsProps {
  postId: string
  initialScore: number
  initialVote: boolean | null  // undefinedを削除
}

export function VoteButtons({ postId, initialScore, initialVote = null }: VoteButtonsProps) {
  // 状態管理
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState(initialVote)
  const [isLoading, setIsLoading] = useState(false)
  
  // 最後に成功したリクエストの状態を保持
  const lastSuccessfulState = useRef({
    score: initialScore,
    vote: initialVote
  })
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 実際のAPI呼び出しを行う関数（デバウンス適用）
  const updateVoteInDatabase = useCallback(
    debounce(async (
      isUpvote: boolean,
      previousVote: boolean | null,
      onSuccess: () => void,
      onError: () => void
    ) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push(`/sign-in?redirect_to=${encodeURIComponent(window.location.pathname)}`)
          return
        }

        const isRemovingVote = previousVote === isUpvote

        if (isRemovingVote) {
          const { error } = await supabase
            .from("votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", session.user.id)

          if (error) throw error
        } else {
          if (previousVote !== null) {
            const { error: deleteError } = await supabase
              .from("votes")
              .delete()
              .eq("post_id", postId)
              .eq("user_id", session.user.id)

            if (deleteError) throw deleteError
          }

          const { error: insertError } = await supabase
            .from("votes")
            .insert({
              post_id: postId,
              user_id: session.user.id,
              is_upvote: isUpvote,
            })

          if (insertError) throw insertError
        }

        // 成功時の状態を保存
        lastSuccessfulState.current = {
          score: score,
          vote: isUpvote
        }
        onSuccess()
        router.refresh()
      } catch (error) {
        console.error('投票処理でエラーが発生:', error)
        onError()
        toast({
          title: "投票に失敗しました",
          description: error instanceof Error 
            ? `エラー: ${error.message}`
            : "予期せぬエラーが発生しました",
          variant: "destructive",
        })
      }
    }, 500), // 500ミリ秒のデバウンス
    [postId, supabase, router, toast, score]
  )

  // ボタンクリック時の処理
  const handleVote = useCallback((isUpvote: boolean) => {
    if (isLoading) return

    const previousVote = currentVote
    const previousScore = score

    // 即座にUIを更新
    if (previousVote === isUpvote) {
      setScore(score - (isUpvote ? 1 : -1))
      setCurrentVote(null)
    } else {
      if (previousVote !== null) {
        setScore(score + (isUpvote ? 2 : -2))
      } else {
        setScore(score + (isUpvote ? 1 : -1))
      }
      setCurrentVote(isUpvote)
    }

    setIsLoading(true)

    // デバウンスされたAPI呼び出し
    updateVoteInDatabase(
      isUpvote,
      previousVote,
      () => {
        setIsLoading(false)
      },
      () => {
        // エラー時は前の状態に戻す
        setScore(previousScore)
        setCurrentVote(previousVote)
        setIsLoading(false)
      }
    )
  }, [isLoading, currentVote, score, updateVoteInDatabase])

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