'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { signInWithGoogleForYouTubeAction } from '@/app/actions'

interface StartCrowdfundingButtonProps {
  postId: string
  channelId: string
  postTitle: string
}

export function StartCrowdfundingButton({ 
  postId, 
  channelId, 
  postTitle
}: StartCrowdfundingButtonProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [isReauthenticating, setIsReauthenticating] = useState(false)
  
  // 再認証から戻った際の自動復元処理
  useEffect(() => {
    const showCrowdfunding = searchParams.get('show_crowdfunding')
    const reauth = searchParams.get('reauth')
    
    if (showCrowdfunding === 'true') {
      setDialogOpen(true)
      
      // 再認証から戻った場合は自動的に所有権確認を実行
      if (reauth === 'youtube') {
        console.log("再認証から戻りました。所有権確認を再実行中...")
        setIsReauthenticating(true)
        // 非同期処理を適切に処理
        handleOwnershipVerification()
          .catch(console.error)
          .finally(() => setIsReauthenticating(false))
      }
      
      // URLパラメータをクリア
      const url = new URL(window.location.href)
      url.searchParams.delete('show_crowdfunding')
      url.searchParams.delete('reauth')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams.toString()]) // searchParamsの文字列化した値を監視
  
  // 所有権確認処理を独立した関数として分離
  const handleOwnershipVerification = async () => {
    setIsLoading(true)
    setDialogError(null)
    
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
        return false
      }
      
      console.log("認証成功、ユーザー:", user.id);
      
      // 所有権確認APIを呼び出し
      console.log("YouTube権限確認のため所有権チェックを実行...", { 
        channelId, 
        postId,
        postTitle
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
      
      // 401エラー（権限不足）の場合はYouTube権限付きで再認証
      if (response.status === 401 || response.status === 400) {
        const errorMessage = data.error || "権限確認中にエラーが発生しました";
        
        // YouTube権限が不足している場合の自動処理
        if (errorMessage.includes("YouTube権限") || errorMessage.includes("provider_token") || 
            errorMessage.includes("insufficient_scope") || errorMessage.includes("認証が必要")) {
          console.log("YouTube権限が不足、自動的に再認証を促す");
          
          setIsLoading(false);
          
          // 確認ダイアログを表示
          const userConfirm = window.confirm(
            "🎬 YouTubeチャンネル確認が必要です\n\n" +
            "クラウドファンディングを開始するには、あなたのYouTubeチャンネルの所有権確認が必要です。\n\n" +
            "✅ チャンネル一覧の確認のみ（読み取り専用）\n" +
            "✅ 安全な認証プロセス\n\n" +
            "チャンネル所有権の確認を許可しますか？"
          );
          
          if (userConfirm) {
            setIsLoading(true);
            
            // 現在のURLに状態保持用のパラメータを追加
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.set('show_crowdfunding', 'true')
            currentUrl.searchParams.set('reauth', 'youtube')
            
            // YouTube権限付きでGoogleに再認証
            const formData = new FormData();
            formData.append("redirect_to", currentUrl.pathname + currentUrl.search);
            await signInWithGoogleForYouTubeAction(formData);
            return false
          } else {
            // ユーザーが拒否した場合のメッセージ
            setDialogError("YouTube権限なしではクラウドファンディングを開始できません。");
            setIsLoading(false);
            return false
          }
        }
        
        // その他の認証エラー
        const errorMessage2 = data.error || "権限確認中にエラーが発生しました"
        toast.error(errorMessage2, {
          duration: 10000
        });
        setDialogError(errorMessage2);
        setIsLoading(false);
        return false
      }
      
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
          return false
        }
        
        // その他のエラーの場合
        const errorMessage = data.error || "所有権の確認中にエラーが発生しました";
        toast.error(errorMessage, {
          duration: 10000
        });
        setDialogError(errorMessage);
        setIsLoading(false);
        return false
      }
      
      if (!data.isOwner) {
        console.warn("チャンネル所有権なし:", data);
        const errorMessage = "自分のチャンネルでのみクラウドファンディングを開始できます";
        toast.error(errorMessage, {
          duration: 10000
        });
        setDialogError(errorMessage);
        setIsLoading(false);
        return false
      }
      
      // 成功時のみダイアログを閉じて遷移
      console.log("所有権確認成功、ページ遷移中...");
      setIsLoading(false);
      setDialogOpen(false)
      
      // まずクラウドファンディングプロジェクトを作成
      try {
        console.log("プロジェクト作成開始...");
        const createResponse = await fetch("/api/crowdfunding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: postTitle,
            description: "このプロジェクトの詳細説明は後で編集できます。", // 空文字ではなく最小限の説明を設定
            target_amount: 100000, // デフォルト値
            start_date: new Date().toISOString(), // ISO文字列形式に変換
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // ISO文字列形式に変換
            reward_enabled: false,
            post_id: postId,
            channel_id: channelId
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          console.error("プロジェクト作成APIエラー:", errorData);
          throw new Error(errorData.error || "プロジェクトの作成に失敗しました");
        }

        const createData = await createResponse.json();
        console.log("プロジェクト作成成功:", createData);
        
        // レスポンスの検証
        if (!createData.campaign || !createData.campaign.id) {
          console.error("不正なレスポンス:", createData);
          throw new Error("プロジェクトの作成に失敗しました（無効なレスポンス）");
        }
        
        // データベースのコミットを待つため少し待機
        console.log("データベースのコミットを待機中...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // プロジェクト編集ページに遷移
        const targetUrl = `/crowdfunding/${createData.campaign.id}/edit`;
        console.log("遷移先URL:", targetUrl);
        
        // 成功メッセージを表示
        toast.success("プロジェクトを作成しました！編集ページに移動します。", {
          duration: 3000
        });
        
        router.push(targetUrl);
        return true;
      } catch (createError) {
        console.error("プロジェクト作成エラー:", createError);
        toast.error(createError instanceof Error ? createError.message : "プロジェクトの作成に失敗しました");
        setIsLoading(false);
        return false;
      }
      
    } catch (error) {
      console.error("予期しないエラーが発生しました:", error)
      const errorMessage = "エラーが発生しました。しばらく経ってからお試しください。";
      toast.error(errorMessage, {
        duration: 10000
      })
      setDialogError(errorMessage);
      setIsLoading(false)
      return false
    }
  }
  
  // クラウドファンディング作成ページへ遷移
  const handleStartCrowdfunding = async () => {
    console.log("クラウドファンディング開始処理を開始:", { postId, channelId, postTitle });
    await handleOwnershipVerification()
  }
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setDialogError(null);
          setDialogOpen(true);
        }}
        className="backdrop-blur-sm bg-gradient-to-r from-purple-500/70 to-blue-500/70 hover:from-purple-600/80 hover:to-blue-600/80 border-0 shadow-lg transition-all duration-200 text-white hover:text-white h-9 px-3"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">クラウドファンディング開始</span>
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
                チャンネル所有権の確認のため、YouTubeとの連携が必要な場合があります。
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="font-medium">投稿タイトル</h4>
            <p className="text-sm text-muted-foreground mt-1">{postTitle}</p>
            
            {isReauthenticating && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mt-0.5"></div>
                  <div>
                    <p className="font-medium mb-1">YouTubeとの連携を確認中...</p>
                    <p className="text-sm">チャンネルの所有権を確認しています。しばらくお待ちください。</p>
                  </div>
                </div>
              </div>
            )}
            
            {dialogError && !isReauthenticating && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">アクセス権限がありません</p>
                    <p className="text-sm whitespace-pre-line">{dialogError}</p>
                    
                    {dialogError.includes("YouTube権限") && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          onClick={async () => {
                            setIsLoading(true);
                            const formData = new FormData();
                            formData.append("redirect_to", window.location.pathname);
                            await signInWithGoogleForYouTubeAction(formData);
                          }}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isLoading ? "処理中..." : "YouTube権限を追加"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogError(null);
              setDialogOpen(false);
            }} disabled={isLoading || isReauthenticating}>
              キャンセル
            </Button>
            <Button onClick={handleStartCrowdfunding} disabled={isLoading || isReauthenticating}>
              {isLoading || isReauthenticating ? "確認中..." : "作成ページへ進む"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 