'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface StartCrowdfundingButtonProps {
  postId: string
  channelId: string
  postTitle: string
  ownerUserId: string
}

export function StartCrowdfundingButton({ 
  postId, 
  channelId, 
  postTitle,
  ownerUserId
}: StartCrowdfundingButtonProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  
  // クラウドファンディング作成ページへ遷移
  const handleStartCrowdfunding = async () => {
    console.log("クラウドファンディング開始処理を開始:", { postId, channelId, postTitle });
    setIsLoading(true)
    setDialogError(null) // エラー状態をリセット
    
    try {
      // 現在のユーザー情報を取得
      console.log("ユーザー情報を取得中...");
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.error("ユーザー認証エラー:", error);
        toast.error("クラウドファンディングを開始するにはログインが必要です", {
          duration: 10000
        })
        setIsLoading(false)
        setDialogOpen(false)
        router.push("/sign-in")
        return
      }
      
      console.log("認証成功、ユーザー:", user.id);
      
      // YouTube APIでチャンネル所有権を確認
      console.log("チャンネル所有権を確認中...", { 
        channelId, 
        postId,
        postTitle,
        ownerUserId,
        userAgent: navigator.userAgent,
        currentURL: window.location.href
      });
      const response = await fetch("/api/youtube/verify-ownership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          channelId: channelId 
        })
      });
      
      console.log("所有権確認レスポンス:", {
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      const data = await response.json();
      console.log("所有権確認データ:", data);
      
      if (!response.ok) {
        console.error("所有権確認エラー:", data);
        
        // 403エラー（権限なし）の場合は特別なメッセージを表示
        if (response.status === 403) {
          const friendlyMessage = "自分のチャンネルでのみクラウドファンディングを開始できます";
          toast.error(friendlyMessage, {
            duration: 10000
          });
          setDialogError(friendlyMessage);
          setIsLoading(false);
          return;
        }
        
        // その他のエラーの場合
        const errorMessage = data.error || "所有権の確認中にエラーが発生しました";
        toast.error(errorMessage, {
          duration: 10000
        });
        setDialogError(errorMessage);
        setIsLoading(false);
        return; // ダイアログは開いたままにする
      }
      
      if (!data.isOwner) {
        console.warn("チャンネル所有権なし:", data);
        const errorMessage = "自分のチャンネルでのみクラウドファンディングを開始できます";
        toast.error(errorMessage, {
          duration: 10000
        });
        setDialogError(errorMessage);
        setIsLoading(false);
        return; // ダイアログは開いたままにする
      }
      
      // 成功時のみダイアログを閉じて遷移
      console.log("所有権確認成功、ページ遷移中...");
      setDialogOpen(false)
      // 投稿情報をURLパラメータとして渡す
      const targetUrl = `/crowdfunding/new?post_id=${postId}&channel_id=${channelId}&title=${encodeURIComponent(postTitle)}`;
      console.log("遷移先URL:", targetUrl);
      router.push(targetUrl)
    } catch (error) {
      console.error("予期しないエラーが発生しました:", error)
      const errorMessage = "エラーが発生しました。しばらく経ってからお試しください。";
      toast.error(errorMessage, {
        duration: 10000
      })
      setDialogError(errorMessage);
      setIsLoading(false)
      // エラー時はダイアログを開いたままにする
    }
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDialogError(null);
          setDialogOpen(true);
        }}
        className="flex items-center gap-1"
      >
        <Sparkles className="h-4 w-4" />
        <span>クラウドファンディング</span>
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setDialogError(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>クラウドファンディングを開始</DialogTitle>
            <DialogDescription>
              この投稿内容に基づいてクラウドファンディングを開始します。
              支援者を募り、プロジェクトを実現しましょう。
              <br /><br />
              <span className="text-muted-foreground text-xs">
                ※ クラウドファンディングを開始できるのは、チャンネルの所有者のみです。
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="font-medium">投稿タイトル</h4>
            <p className="text-sm text-muted-foreground mt-1">{postTitle}</p>
            
            {dialogError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">アクセス権限がありません</p>
                    <p className="text-sm whitespace-pre-line">{dialogError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogError(null);
              setDialogOpen(false);
            }} disabled={isLoading}>
              キャンセル
            </Button>
            <Button onClick={handleStartCrowdfunding} disabled={isLoading}>
              {isLoading ? "確認中..." : "作成ページへ進む"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 