"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatNumber } from "../../../lib/format"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'
import { useAuthDialog } from "@/hooks/use-auth-dialog"
import { AuthDialog } from "@/components/ui/auth-dialog"

// このファイルは、投稿に対する「いいね」と「よくないね」のボタンを作るプログラムです

// このボタンが必要とする情報の形を決めます
interface VoteButtonsProps {
  postId: string            // どの投稿に対する投票かを示すID
  initialScore: number      // 最初の投票スコア（いいね - よくないね）
  initialVote: boolean | null  // 最初の投票状態（いいね=true, よくないね=false, 未投票=null）
  isTestMode?: boolean      // テストモードかどうか（テスト時のみtrue）
}

// 投票ボタンを作る関数です
const VoteButtons = memo(function VoteButtons({ postId, initialScore, initialVote, isTestMode = false }: VoteButtonsProps) {
  // 画面に表示する情報を管理します
  const [score, setScore] = useState<number>(initialScore)           // 現在の投票スコア
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote)  // 現在の投票状態
  const [isLoading, setIsLoading] = useState(false)                 // 投票の処理中かどうか
  const [loadingType, setLoadingType] = useState<'upvote' | 'downvote' | null>(null) // どちらのボタンが処理中か
  const router = useRouter()
  const { toast } = useToast()
  const { open, setOpen, checkAuthAndShowDialog } = useAuthDialog()
  
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
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
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
  const handleVote = useCallback(async (voteType: boolean) => {
    try {
      // 投票処理中は追加操作を受け付けない
      if (isLoading) return
      
      // ログイン確認 - 未ログインならダイアログを表示して処理中断
      const isAuthenticated = await checkAuthAndShowDialog()
      if (!isAuthenticated) return
      
      // ここから先は認証済みユーザーの処理
      setIsLoading(true)
      setLoadingType(voteType ? 'upvote' : 'downvote')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        setLoadingType(null)
        const currentPath = window.location.pathname
        router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
        return
      }
      
      const userId = user.id
      
      // 楽観的更新のための新しい投票状態
      const newVoteState = currentVote === voteType ? null : voteType
      
      // スコアの楽観的更新計算
      let scoreChange = 0;
      
      if (currentVote === null) {
        // 未投票→投票: +1/-1
        scoreChange = voteType ? 1 : -1;
      } else if (newVoteState === null) {
        // 投票→取り消し: いいね取消し-1/よくないね取消し+1
        scoreChange = currentVote ? -1 : 1;
      } else {
        // 投票切り替え: いいね→よくないね:-2/よくないね→いいね:+2
        scoreChange = voteType ? 2 : -2;
      }
      
      // 状態を更新（setStateの順序をスコア→投票状態に変更）
      setScore(prevScore => prevScore + scoreChange);
      setCurrentVote(newVoteState);
      
      // テストモードの場合はAPIリクエストをスキップ
      if (isTestMode) {
        console.log('テストモード: APIリクエストをスキップします');
        return;
      }
      
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
  }, [isLoading, currentVote, postId, supabase, router, toast, mutate, isTestMode, checkAuthAndShowDialog])

  // ボタンの見た目を決める関数
  const getButtonStyle = useCallback((isUpvote: boolean) => {
    const baseStyle = 'h-9 w-9 rounded-xl p-0 transition-all duration-300 border-2'
    if (currentVote === isUpvote) {
      return `${baseStyle} ${
        isUpvote 
          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-400/20' 
          : 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-red-400 shadow-lg shadow-red-400/20'
      } scale-110`
    }
    return `${baseStyle} ${
      isUpvote 
        ? 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 dark:hover:border-green-700' 
        : 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700'
    } hover:scale-105`
  }, [currentVote])

  // 投票ボタンのデザインを作ります
  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4 bg-slate-50/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-200/50 dark:border-slate-700/50">
        {/* いいねボタン - モバイル最適化 */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl p-0 transition-all duration-300 border-2 ${getButtonStyle(true)}`}
          onClick={() => {
            if (!isLoading) {
              console.log("いいねボタンがクリックされました");
              handleVote(true);
            }
          }}
          disabled={isLoading}
          aria-label="upvote"
        >
          {loadingType === 'upvote' ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>

        {/* 投票スコア表示 - モバイル最適化 */}
        <div className="flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg sm:rounded-xl shadow-inner min-w-[2rem] sm:min-w-[2.5rem]">
          <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
            {score}
          </span>
        </div>

        {/* よくないねボタン - モバイル最適化 */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl p-0 transition-all duration-300 border-2 ${getButtonStyle(false)}`}
          onClick={() => {
            if (!isLoading) {
              console.log("よくないねボタンがクリックされました");
              handleVote(false);
            }
          }}
          disabled={isLoading}
          aria-label="downvote"
        >
          {loadingType === 'downvote' ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
})

// コンポーネントの名前を設定
VoteButtons.displayName = 'VoteButtons'

// コンポーネントをエクスポート
export { VoteButtons } 