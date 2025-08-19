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
import { HandCoins, AlertTriangle, Clock, Edit } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { signInWithGoogleForYouTubeAction } from '@/app/actions'
import { useAuthDialog } from '@/hooks/use-auth-dialog'
import { AuthDialog } from '@/components/ui/auth-dialog'

interface StartCrowdfundingButtonProps {
  postId: string
  channelId: string
  postTitle: string
}

// 既存プロジェクト情報の型定義
interface ExistingCampaign {
  id: string
  title: string
  status: string
  created_at?: string
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
  const [existingCampaign, setExistingCampaign] = useState<ExistingCampaign | null>(null)
  const [isCheckingExisting, setIsCheckingExisting] = useState(false)
  const { open, setOpen, checkAuthAndShowDialog } = useAuthDialog()
  
  // 環境変数からクラウドファンディング機能の有効性を確認
  const isCrowdfundingEnabled = process.env.NEXT_PUBLIC_CROWDFUNDING_ENABLED === 'true'
  
  // 既存プロジェクトをチェックする関数
  const checkExistingCampaign = async () => {
    setIsCheckingExisting(true)
    try {
      const response = await fetch(`/api/crowdfunding?post_id=${postId}`)
      const data = await response.json()
      
      if (response.ok && data.exists && data.campaign) {
        setExistingCampaign(data.campaign)
        console.log("既存プロジェクトが見つかりました:", data.campaign)
      } else {
        setExistingCampaign(null)
        console.log("既存プロジェクトは見つかりませんでした")
      }
    } catch (error) {
      console.error("既存プロジェクトチェックエラー:", error)
      setExistingCampaign(null)
    } finally {
      setIsCheckingExisting(false)
    }
  }
  
  // コンポーネントマウント時に既存プロジェクトをチェック
  useEffect(() => {
    if (isCrowdfundingEnabled && postId) {
      checkExistingCampaign()
    }
  }, [postId, isCrowdfundingEnabled])
  
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
        setIsLoading(false)
        setDialogOpen(false)
        // ログインダイアログを表示
        setOpen(true)
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
          
          // 409エラー（既存プロジェクトあり）の場合は特別な処理
          if (createResponse.status === 409 && errorData.existingCampaign) {
            console.log("既存プロジェクトが見つかりました、編集ページに遷移...");
            setExistingCampaign(errorData.existingCampaign)
            
            toast.success("既存のプロジェクトを編集します", {
              duration: 3000
            });
            
            router.push(errorData.redirectTo);
            return true;
          }
          
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
  
  // 既存プロジェクトを編集する関数
  const handleEditExistingProject = async () => {
    if (!existingCampaign) return
    
    // 先に認証状態をチェック
    const isAuthenticated = await checkAuthAndShowDialog()
    if (!isAuthenticated) return
    
    // 編集ページに直接遷移
    toast.success("既存のプロジェクトを編集します", {
      duration: 3000
    });
    router.push(`/crowdfunding/${existingCampaign.id}/edit`)
  }
  
  // クラウドファンディング作成ページへ遷移
  const handleStartCrowdfunding = async () => {
    console.log("クラウドファンディング開始処理を開始:", { postId, channelId, postTitle });
    
    // 先に認証状態をチェック
    const isAuthenticated = await checkAuthAndShowDialog()
    if (!isAuthenticated) return
    
    // ログイン済みの場合は所有権確認を実行
    await handleOwnershipVerification()
  }
  
  // ボタンの表示状態を決定
  const getButtonContent = () => {
    if (isCheckingExisting) {
      return {
        icon: <Clock className="h-4 w-4 mr-2 animate-spin" />,
        text: "確認中...",
        variant: "ghost" as const,
        disabled: true
      }
    }
    
    if (existingCampaign) {
      return {
        icon: <Edit className="h-4 w-4 mr-2" />,
        text: "プロジェクトを編集",
        variant: "ghost" as const,
        disabled: false
      }
    }
    
    return {
      icon: <HandCoins className="h-4 w-4 mr-2" />,
      text: "クラウドファンディング開始",
      variant: "ghost" as const,
      disabled: false
    }
  }
  
  const buttonContent = getButtonContent()
  
  return (
    <>
      {isCrowdfundingEnabled ? (
        <Button
          variant={buttonContent.variant}
          size="sm"
          onClick={async () => {
            setDialogError(null);
            
            // 既存プロジェクトがある場合は直接編集ページに遷移
            if (existingCampaign) {
              await handleEditExistingProject()
              return
            }
            
            // まず認証状態をチェック
            const isAuthenticated = await checkAuthAndShowDialog()
            if (!isAuthenticated) return
            
            // ログイン済みの場合はクラウドファンディングダイアログを表示
            setDialogOpen(true);
          }}
          disabled={buttonContent.disabled}
          className="backdrop-blur-sm bg-gradient-to-r from-purple-500/70 to-blue-500/70 hover:from-purple-600/80 hover:to-blue-600/80 border-0 shadow-lg transition-all duration-200 text-white hover:text-white h-9 px-3"
        >
          {buttonContent.icon}
          <span className="text-sm font-medium">{buttonContent.text}</span>
        </Button>
                    ) : (
         <div className="flex flex-col items-center gap-1">
           <Button
             variant="ghost"
             size="sm"
             disabled
             className="backdrop-blur-sm bg-gradient-to-r from-gray-400/70 to-gray-500/70 border-0 shadow-lg transition-all duration-200 text-white h-9 px-3 cursor-not-allowed opacity-75"
           >
             <Clock className="h-4 w-4 mr-2" />
             <span className="text-sm font-medium">クラファン開始(CommingSoon)</span>
           </Button>
         </div>
       )}
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setDialogError(null);
      }}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          {/* モーダルの背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 dark:from-purple-950/30 dark:via-transparent dark:to-blue-950/30 rounded-3xl" />
          
          <div className="relative z-10">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-purple-400 dark:to-blue-400">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                  <HandCoins className="w-5 h-5 text-white" />
                </div>
                クラウドファンディングを開始
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-300 mt-2">
                この投稿内容に基づいてクラウドファンディングを開始します。支援者を募り、プロジェクトを実現しましょう。
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 投稿タイトル表示 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  投稿タイトル
                </label>
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3">
                  <p className="text-slate-900 dark:text-white font-medium">{postTitle}</p>
                </div>
              </div>
              
              {/* 再認証中のメッセージ */}
              {isReauthenticating && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 px-4 py-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mt-0.5"></div>
                    <div>
                      <p className="font-medium mb-1">YouTubeとの連携を確認中...</p>
                      <p className="text-sm opacity-80">チャンネルの所有権を確認しています。しばらくお待ちください。</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* エラーメッセージ */}
              {dialogError && !isReauthenticating && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200/50 dark:border-red-700/50 text-red-700 dark:text-red-300 px-4 py-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">アクセス権限がありません</p>
                      <p className="text-sm opacity-80 whitespace-pre-line">{dialogError}</p>
                      
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
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-4 py-2"
                          >
                            {isLoading ? "処理中..." : "YouTube権限を追加"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
               {/* 注意事項 */}
               <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200/50 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-2xl backdrop-blur-sm">
                 <div className="text-sm flex items-start gap-2">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                   <span className="opacity-80">
                     クラウドファンディングを開始できるのは、チャンネルの所有者のみです。チャンネル所有権の確認のため、YouTubeとの連携を許可してください。
                   </span>
                 </div>
               </div>
            </div>
            
            <DialogFooter className="mt-8 gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDialogError(null);
                  setDialogOpen(false);
                }} 
                disabled={isLoading || isReauthenticating}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-xl px-6 py-2 transition-all duration-300 hover:bg-white/90 dark:hover:bg-slate-800/90"
              >
                キャンセル
              </Button>
              <Button 
                onClick={handleStartCrowdfunding} 
                disabled={isLoading || isReauthenticating}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-2 font-medium"
              >
                {isLoading || isReauthenticating ? "確認中..." : "作成ページへ進む"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 認証ダイアログ */}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 