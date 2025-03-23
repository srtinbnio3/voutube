"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  const [loadingType, setLoadingType] = useState<'upvote' | 'downvote' | null>(null) // どちらのボタンが処理中か
  
  const router = useRouter()
  const { toast } = useToast()  // 通知を表示するための道具
  
  // 最初の値を設定します
  useEffect(() => {
    console.log("初期値設定:", { initialVote, initialScore })
    setScore(initialScore)
    setCurrentVote(initialVote)
  }, [initialScore, initialVote])
  
  // データベースに接続するための設定
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投票ボタンが押されたときの動作
  const handleVote = async (isUpvote: boolean) => {
    // 処理中なら何もしません
    if (isLoading) return
    setIsLoading(true)
    setLoadingType(isUpvote ? 'upvote' : 'downvote')
    
    // 押したボタンの種類を記録（デバッグ用）
    const buttonType = isUpvote ? "いいね" : "よくないね";
    console.log(`${buttonType}ボタンがクリックされました`);
    
    try {
      // ログインしているかチェックします
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsLoading(false)
        setLoadingType(null)
        // ログインしていない場合は、ログインページに移動します
        const currentPath = window.location.pathname
        router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
        return
      }
      
      const userId = session.user.id
      
      // 現在の状態を表示
      console.log("ボタン押下前の状態:", { 
        button: buttonType, 
        currentVote: currentVote === true ? "いいね" : currentVote === false ? "よくないね" : "なし", 
        score 
      });
      
      // 新しい投票状態を決めます
      let newVoteState: boolean | null;
      if (currentVote === isUpvote) {
        // 同じボタンを押した場合は取り消し
        newVoteState = null;
        console.log(`${buttonType}を取り消します`);
      } else {
        // 異なるボタンを押した場合は新しい値に設定
        newVoteState = isUpvote;
        console.log(`${buttonType}に変更します`);
      }
      
      // スコア変化を予測して先に計算（楽観的更新のため）
      let scoreDelta = 0;
      
      // 前の状態と新しい状態に基づいて、スコア変化を計算
      if (currentVote === true && newVoteState === null) {
        // いいね → なし: -1
        scoreDelta = -1;
      } else if (currentVote === false && newVoteState === null) {
        // よくないね → なし: +1
        scoreDelta = 1;
      } else if (currentVote === null && newVoteState === true) {
        // なし → いいね: +1
        scoreDelta = 1;
      } else if (currentVote === null && newVoteState === false) {
        // なし → よくないね: -1
        scoreDelta = -1;
      } else if (currentVote === true && newVoteState === false) {
        // いいね → よくないね: -2
        scoreDelta = -2;
      } else if (currentVote === false && newVoteState === true) {
        // よくないね → いいね: +2
        scoreDelta = 2;
      }
      
      // 楽観的更新 - ユーザー体験向上のため、UIを先に更新
      const predictedNewScore = score + scoreDelta;
      setCurrentVote(newVoteState);
      setScore(predictedNewScore); // 予測されるスコア変化を即座に反映
      
      console.log(`楽観的更新: スコア変化 ${scoreDelta}, 新スコア ${predictedNewScore}`);
      
      // データベース操作を行います
      if (newVoteState === null) {
        // 投票を取り消す場合
        await supabase
          .from("votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
      } else {
        // 既存の投票があるかチェック
        const { data: existingVote } = await supabase
          .from("votes")
          .select("*")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .maybeSingle();
        
        if (existingVote) {
          // 既存の投票がある場合は更新
          await supabase
            .from("votes")
            .update({ is_upvote: newVoteState })
            .eq("post_id", postId)
            .eq("user_id", userId);
        } else {
          // 新規投票を追加
          await supabase
            .from("votes")
            .insert({
              post_id: postId,
              user_id: userId,
              is_upvote: newVoteState
            });
        }
      }
      
      // データベースから最新の投票データを取得
      const { data: allVotes } = await supabase
        .from("votes")
        .select("is_upvote")
        .eq("post_id", postId);
      
      // 最新の自分の投票を確認
      const { data: myVote } = await supabase
        .from("votes")
        .select("is_upvote")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      
      // スコアを計算
      let newScore = 0;
      if (allVotes && allVotes.length > 0) {
        const upvotes = allVotes.filter(v => v.is_upvote).length;
        const downvotes = allVotes.filter(v => !v.is_upvote).length;
        newScore = upvotes - downvotes;
        console.log(`スコア計算: いいね=${upvotes}件, よくないね=${downvotes}件, 合計=${newScore}`);
      }
      
      // 投稿のスコアを更新
      await supabase
        .from("posts")
        .update({ score: newScore })
        .eq("id", postId);
      
      // 最新の状態をUIに反映
      const finalVoteState = myVote ? myVote.is_upvote : null;
      const finalVoteDisplay = finalVoteState === true ? "いいね" : 
                             finalVoteState === false ? "よくないね" : "なし";
      
      console.log("データベース更新後の最終状態:", { 
        finalVoteState: finalVoteDisplay, 
        newScore,
        allVotesCount: allVotes?.length || 0
      });
      
      // 予測と実際のスコアの差が大きい場合のみUIを更新
      if (Math.abs(newScore - predictedNewScore) > 0) {
        console.log(`スコア予測と実際のスコアに差があります: 予測=${predictedNewScore}, 実際=${newScore}`);
        setScore(newScore);
      }
      
      // UIの投票状態とデータベースの状態が異なる場合は修正
      if (finalVoteState !== newVoteState) {
        console.log("警告: UIとDBの投票状態が不一致です。DBの値に合わせます。");
        setCurrentVote(finalVoteState);
      }
      
    } catch (error) {
      console.error("投票エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "投票の更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  // ボタンの見た目を決める関数
  const getButtonStyle = (isUpvote: boolean) => {
    const baseStyle = 'h-6 w-6 rounded-full p-0 transition-all duration-200'
    // 選ばれているボタンは色を変えます（いいね=オレンジ、よくないね=青）
    if (currentVote === isUpvote) {
      return `${baseStyle} ${isUpvote ? 'text-orange-500' : 'text-blue-500'} active:scale-110`
    }
    return `${baseStyle} hover:bg-accent hover:scale-105`
  }

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
} 