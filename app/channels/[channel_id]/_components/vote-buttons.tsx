"use client"

import { useState, useCallback, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "lodash"
import { formatNumber } from "../../../lib/format"

// このファイルは、投稿に対する「いいね」と「よくないね」のボタンを作るプログラムです

// このボタンが必要とする情報の形を決めます
interface VoteButtonsProps {
  postId: string            // どの投稿に対する投票かを示すID
  initialScore: number      // 最初の投票スコア（いいね - よくないね）
  initialVote: boolean | null  // 最初の投票状態（いいね=true, よくないね=false, 未投票=null）
}

// 投票ボタンを作る関数です
export function VoteButtons({ postId, initialScore, initialVote }: VoteButtonsProps) {
  // 画面に表示する情報を管理します
  const [score, setScore] = useState<number>(initialScore)           // 現在の投票スコア
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote)  // 現在の投票状態
  const [isLoading, setIsLoading] = useState(false)                 // 投票の処理中かどうか
  
  // 最後の投票操作を記録します（連続クリックを制御するため）
  const [lastVoteOperation, setLastVoteOperation] = useState<{
    type: 'upvote' | 'downvote' | 'cancel'  // どんな操作をしたか
    timestamp: number                        // いつ操作したか
    score: number                           // その時のスコア
    vote: boolean | null                    // その時の投票状態
  } | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()  // 通知を表示するための道具
  
  // 最初の値を設定します
  useEffect(() => {
    setScore(initialScore)
    setCurrentVote(initialVote)
  }, [initialScore, initialVote])
  
  // データベースに接続するための設定
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投票をデータベースに保存する関数（短時間での連続実行を防ぐため、少し待ってから実行します）
  const updateVoteInDb = useCallback(
    debounce(async (isUpvote: boolean | null, newScore: number) => {
      try {
        // ログインしているかチェックします
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          // ログインしていない場合は、ここで終了
          return
        }

        const userId = session.user.id

        if (isUpvote === null) {
          // 投票を取り消す場合は、データベースから投票を削除します
          await supabase
            .from("votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId)
        } else {
          // 新しい投票を追加するか、既存の投票を更新します
          await supabase
            .from("votes")
            .upsert({
              post_id: postId,
              user_id: userId,
              is_upvote: isUpvote
            })
        }

        // 投稿の合計スコアを更新します
        await supabase
          .from("posts")
          .update({ score: newScore })
          .eq("id", postId)

      } catch (error) {
        // エラーが起きたときは、エラーを通知して元の状態に戻します
        console.error("投票エラー:", error)
        toast({
          title: "エラーが発生しました",
          description: "投票の更新に失敗しました",
          variant: "destructive",
        })
        setScore(initialScore)
        setCurrentVote(initialVote)
      } finally {
        setIsLoading(false)
      }
    }, 100), // 0.1秒待ってから実行します
    [postId, initialScore, initialVote, supabase, toast]
  )

  // 投票ボタンが押されたときの動作
  const handleVote = async (isUpvote: boolean) => {
    // 処理中なら何もしません
    if (isLoading) return
    setIsLoading(true)
    
    // ログインしているかチェックします
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsLoading(false)
      // ログインしていない場合は、ログインページに移動します
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
      return
    }

    const now = Date.now()  // 現在の時刻
    const lastOp = lastVoteOperation  // 最後の投票操作
    const previousVote = currentVote  // 前回の投票状態
    const previousScore = score       // 前回のスコア

    let newVote: boolean | null = null  // 新しい投票状態
    let newScore: number = previousScore  // 新しいスコア

    // 0.2秒以内に連続でボタンを押したかどうかをチェックします
    const isContinuousOperation = lastOp && (now - lastOp.timestamp) < 200

    // 投票状態を更新する関数
    const updateVoteState = (vote: boolean | null, score: number) => {
      // 最後の操作を記録します
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
      // 連続で押された場合
      if (lastOp.vote === isUpvote) {
        // 同じボタンを連続で押したら投票を取り消します
        newVote = null
        newScore = lastOp.score
      } else {
        // 違うボタンを連続で押したら投票を切り替えます
        newVote = isUpvote
        newScore = lastOp.score + (isUpvote ? 2 : -2)
      }
    } else {
      // 普通に押された場合
      if (currentVote === isUpvote) {
        // 同じボタンを押したら投票を取り消します
        newVote = null
        newScore = score + (isUpvote ? -1 : 1)
      } else {
        // 違うボタンを押したら投票を切り替えます
        newVote = isUpvote
        const scoreDiff = currentVote === null ? 1 : 2
        newScore = score + (isUpvote ? scoreDiff : -scoreDiff)
      }
    }

    // 画面の表示を更新します
    updateVoteState(newVote, newScore)

    // データベースに保存します
    updateVoteInDb(newVote, newScore)
  }

  // ボタンの見た目を決める関数
  const getButtonStyle = (isUpvote: boolean) => {
    const baseStyle = 'h-6 w-6 rounded-full p-0'
    // 選ばれているボタンは色を変えます（いいね=オレンジ、よくないね=青）
    if (currentVote === isUpvote) {
      return `${baseStyle} ${isUpvote ? 'text-orange-500' : 'text-blue-500'}`
    }
    return baseStyle
  }

  // 投票ボタンのデザインを作ります
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 上向き矢印（いいね）ボタン */}
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

      {/* 投票スコアの表示 */}
      <span 
        data-testid="vote-score"
        className={`text-xs font-bold ${
          currentVote === true ? 'text-orange-500' : 
          currentVote === false ? 'text-blue-500' : ''
        }`}
      >
        {formatNumber(score)}
      </span>

      {/* 下向き矢印（よくないね）ボタン */}
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