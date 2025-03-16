"use client"

import { useState, useCallback, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "lodash"
import { formatNumber } from "../../../lib/format"

// コンポーネントのプロパティの型定義
interface VoteButtonsProps {
  postId: string
  initialScore: number
  initialVote: boolean | null
}

export function VoteButtons({ postId, initialScore, initialVote }: VoteButtonsProps) {
  // 状態管理
  const [score, setScore] = useState<number>(initialScore)
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote)
  const [isLoading, setIsLoading] = useState(false)
  const [lastVoteOperation, setLastVoteOperation] = useState<{
    type: 'upvote' | 'downvote' | 'cancel'
    timestamp: number
    score: number
    vote: boolean | null
  } | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // 初期値の設定をuseEffectで行う
  useEffect(() => {
    setScore(initialScore)
    setCurrentVote(initialVote)
  }, [initialScore, initialVote])
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投票をデータベースに保存する関数（デバウンス処理）
  const updateVoteInDb = useCallback(
    debounce(async (isUpvote: boolean | null, newScore: number) => {
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
          .update({ score: newScore })
          .eq("id", postId)

      } catch (error) {
        console.error("投票エラー:", error)
        toast({
          title: "エラーが発生しました",
          description: "投票の更新に失敗しました",
          variant: "destructive",
        })
        // エラー時は状態を元に戻す
        setScore(initialScore)
        setCurrentVote(initialVote)
      } finally {
        setIsLoading(false)
      }
    }, 100), // 投票処理の間隔を短くして、テストでの連続投票に対応
    [postId, initialScore, initialVote, supabase, toast]
  )

  // 投票ボタンのクリックハンドラ
  const handleVote = async (isUpvote: boolean) => {
    if (isLoading) return
    setIsLoading(true)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsLoading(false)
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
      return
    }

    const now = Date.now()
    const lastOp = lastVoteOperation
    const previousVote = currentVote
    const previousScore = score

    let newVote: boolean | null = null
    let newScore: number = previousScore

    // 連続操作の判定を最初に行う
    const isContinuousOperation = lastOp && (now - lastOp.timestamp) < 200

    // 状態更新の関数を定義
    const updateVoteState = (vote: boolean | null, score: number) => {
      setLastVoteOperation({
        type: isUpvote ? 'upvote' : 'downvote',
        timestamp: now,
        score: previousScore,
        vote: previousVote
      })
      setCurrentVote(vote)
      setScore(score)
    }

    if (isContinuousOperation) {
      // 連続操作の場合
      if (lastOp.vote === isUpvote) {
        // 同じ方向への連続投票は取り消し
        newVote = null
        newScore = lastOp.score
      } else {
        // 反対方向への投票
        newVote = isUpvote
        newScore = lastOp.score + (isUpvote ? 2 : -2)
      }
    } else {
      // 通常の操作の場合
      if (currentVote === isUpvote) {
        // 同じ方向の投票は取り消し
        newVote = null
        newScore = score + (isUpvote ? -1 : 1)
      } else {
        // 反対方向または新規の投票
        newVote = isUpvote
        const scoreDiff = currentVote === null ? 1 : 2
        newScore = score + (isUpvote ? scoreDiff : -scoreDiff)
      }
    }

    // 状態を即時更新（同期的に実行）
    updateVoteState(newVote, newScore)

    // データベースに反映
    updateVoteInDb(newVote, newScore)
  }

  // ボタンのスタイルを計算する関数
  const getButtonStyle = (isUpvote: boolean) => {
    const baseStyle = 'h-6 w-6 rounded-full p-0'
    if (currentVote === isUpvote) {
      return `${baseStyle} ${isUpvote ? 'text-orange-500' : 'text-blue-500'}`
    }
    return baseStyle
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={getButtonStyle(true)}
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
        {formatNumber(score)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={getButtonStyle(false)}
        onClick={() => handleVote(false)}
        disabled={isLoading}
        aria-label="downvote"
      >
        <ArrowBigDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 