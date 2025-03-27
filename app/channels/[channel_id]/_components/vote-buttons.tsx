"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatNumber } from "../../../lib/format"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'

// このファイルは、投稿に対する「いいね」と「よくないね」のボタンを作るプログラムです

// このボタンが必要とする情報の形を決めます
interface VoteButtonsProps {
  postId: string            // どの投稿に対する投票かを示すID
  initialScore: number      // 最初の投票スコア（いいね - よくないね）
  initialVote: boolean | null  // 最初の投票状態（いいね=true, よくないね=false, 未投票=null）
}

// 投票ボタンを作る関数です
const VoteButtons = memo(function VoteButtons({ postId, initialScore, initialVote }: VoteButtonsProps) {
  // 画面に表示する情報を管理します
  const [score, setScore] = useState<number>(initialScore)           // 現在の投票スコア
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote)  // 現在の投票状態
  const [isLoading, setIsLoading] = useState(false)                 // 投票の処理中かどうか
  const [loadingType, setLoadingType] = useState<'upvote' | 'downvote' | null>(null) // どちらのボタンが処理中か
  const router = useRouter()
  const { toast } = useToast()
  
  // デバッグ用
  console.log('VoteButtons rendering:', { postId, initialScore, initialVote })
  
  const { data: voteData, mutate } = useSWR(
    `/api/posts/${postId}/votes`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: { score: initialScore, votes: [] } // 初期値を設定
    }
  )

  // デバッグ用
  console.log('voteData:', voteData)

  // データベースに接続するための設定
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)

  // ユーザーIDを取得
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
      }
    }
    getUserId()
  }, [supabase.auth])

  // 投票データが更新されたら状態を更新
  useEffect(() => {
    if (voteData && userId) {
      setScore(voteData.score)
      // ユーザーの投票状態を更新
      const userVote = voteData.votes?.find((vote: { user_id: string; is_upvote: boolean }) => vote.user_id === userId)
      if (userVote) {
        setCurrentVote(userVote.is_upvote)
      }
    }
  }, [voteData, userId])
  
  // 投票ボタンが押されたときの動作
  const handleVote = useCallback(async (isUpvote: boolean) => {
    if (isLoading) return
    setIsLoading(true)
    setLoadingType(isUpvote ? 'upvote' : 'downvote')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsLoading(false)
        setLoadingType(null)
        const currentPath = window.location.pathname
        router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
        return
      }
      
      const userId = session.user.id
      
      // 楽観的更新
      const newVoteState = currentVote === isUpvote ? null : isUpvote
      setCurrentVote(newVoteState)
      
      // 投票を送信
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isUpvote: newVoteState,
        }),
      })

      if (!response.ok) {
        throw new Error('投票の更新に失敗しました')
      }

      // データを再検証
      await mutate()
      
    } catch (error) {
      console.error("投票エラー:", error)
      toast({
        title: "エラーが発生しました",
        description: "投票の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingType(null)
    }
  }, [isLoading, currentVote, postId, supabase, router, toast, mutate])

  // ボタンの見た目を決める関数
  const getButtonStyle = useCallback((isUpvote: boolean) => {
    const baseStyle = 'h-6 w-6 rounded-full p-0 transition-all duration-200'
    // 選ばれているボタンは色を変えます（いいね=オレンジ、よくないね=青）
    if (currentVote === isUpvote) {
      return `${baseStyle} ${isUpvote ? 'text-orange-500' : 'text-blue-500'} active:scale-110`
    }
    return `${baseStyle} hover:bg-accent hover:scale-105`
  }, [currentVote])

  // 投票ボタンのデザインを作ります
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 上向き矢印（いいね）ボタン */}
      <Button
        variant="ghost"
        size="sm"
        className={getButtonStyle(true)}
        onClick={() => {
          // すでに処理中なら何もしない
          if (!isLoading) {
            console.log("いいねボタンがクリックされました");
            handleVote(true);
          }
        }}
        disabled={isLoading}
        aria-label="upvote"
        data-state={currentVote === true ? "active" : "inactive"}
      >
        {isLoading && loadingType === 'upvote' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowBigUp className={`h-4 w-4 transition-transform duration-200 ${currentVote === true ? 'scale-125' : ''}`} />
        )}
      </Button>

      {/* 投票スコアの表示 */}
      <span 
        data-testid="vote-score"
        className={`text-xs font-bold transition-colors duration-200 ${
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
        onClick={() => {
          // すでに処理中なら何もしない
          if (!isLoading) {
            console.log("よくないねボタンがクリックされました");
            handleVote(false);
          }
        }}
        disabled={isLoading}
        aria-label="downvote"
        data-state={currentVote === false ? "active" : "inactive"}
      >
        {isLoading && loadingType === 'downvote' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowBigDown className={`h-4 w-4 transition-transform duration-200 ${currentVote === false ? 'scale-125' : ''}`} />
        )}
      </Button>
    </div>
  )
})

// コンポーネントの名前を設定
VoteButtons.displayName = 'VoteButtons'

// コンポーネントをエクスポート
export { VoteButtons } 