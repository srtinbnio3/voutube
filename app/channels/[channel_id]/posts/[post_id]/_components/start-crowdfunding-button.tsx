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
import { Sparkles } from 'lucide-react'
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
  
  // クラウドファンディング作成ページへ遷移
  const handleStartCrowdfunding = async () => {
    setIsLoading(true)
    
    try {
      // 現在のユーザー情報を取得
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        toast.error("クラウドファンディングを開始するにはログインが必要です")
        setDialogOpen(false)
        router.push("/sign-in")
        return
      }
      
      // YouTube APIでチャンネル所有権を確認
      const response = await fetch("/api/youtube/verify-ownership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          channelId: channelId 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || "所有権の確認中にエラーが発生しました");
        setDialogOpen(false);
        return;
      }
      
      if (!data.isOwner) {
        toast.error("自分のチャンネルでのみクラウドファンディングを開始できます");
        setDialogOpen(false);
        return;
      }
      
      // 投稿情報をURLパラメータとして渡す
      router.push(`/crowdfunding/new?post_id=${postId}&channel_id=${channelId}&title=${encodeURIComponent(postTitle)}`)
    } catch (error) {
      console.error("エラーが発生しました:", error)
      toast.error("エラーが発生しました。しばらく経ってからお試しください。")
    } finally {
      setIsLoading(false)
      setDialogOpen(false)
    }
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-1"
      >
        <Sparkles className="h-4 w-4" />
        <span>クラウドファンディング</span>
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>クラウドファンディングを開始</DialogTitle>
            <DialogDescription>
              この投稿内容に基づいてクラウドファンディングを開始します。
              支援者を募り、プロジェクトを実現しましょう。
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="font-medium">投稿タイトル</h4>
            <p className="text-sm text-muted-foreground mt-1">{postTitle}</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
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