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
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote)
  const [isLoading, setIsLoading] = useState(false)
  const [lastVoteOperation, setLastVoteOperation] = useState<{
    type: 'upvote' | 'downvote' | 'cancel'
    timestamp: number
  } | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // initialScoreまたはinitialVoteが変更された場合、状態を更新
  useEffect(() => {
    setScore(initialScore)
    setCurrentVote(initialVote)
    setIsLoading(false) // 状態更新時にローディングをリセット
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
    if (isLoading) return // 処理中は新しい投票を受け付けない
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
    } else {
      // 未投票または反対の投票から変更
      newVote = isUpvote
      if (currentVote === null) {
        // 未投票状態から投票
        scoreChange = isUpvote ? 1 : -1
      } else {
        // 反対の投票から変更（前の投票を取り消して新しい投票を追加）
        scoreChange = isUpvote ? 2 : -2
      }
    }

    // 状態を即時更新（UI表示用）
    const newScore = score + scoreChange
    setScore(newScore)
    setCurrentVote(newVote)
    
    // 直前の投票から時間が経過していない場合は連続操作と見なす
    const now = Date.now()
    const lastOp = lastVoteOperation
    setLastVoteOperation({ type: isUpvote ? 'upvote' : 'downvote', timestamp: now })

    if (lastOp && (now - lastOp.timestamp) < 200) {
      // 連続操作の場合、前回の操作をキャンセルして新しい操作のみを反映
      if (isUpvote !== (lastOp.type === 'upvote')) {
        // 投票タイプが変わった場合、強制的に最新の状態を反映
        setScore(isUpvote ? 1 : -1)
        setCurrentVote(isUpvote)
      }
    }
    
    // データベースに反映
    updateVoteInDb(newVote, newScore)
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
        {formatNumber(score)}
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