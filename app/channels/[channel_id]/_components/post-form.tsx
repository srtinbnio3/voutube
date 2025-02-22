"use client"  // クライアントサイドでの実行を指定

import { useState } from "react"  // Reactの状態管理フック
import { useRouter } from "next/navigation"  // ページ遷移用フック
import { createBrowserClient } from '@supabase/ssr'  // Supabaseクライアント作成
import { Button } from "@/components/ui/button"  // ボタンコンポーネント
import {
  Dialog,  // モーダルウィンドウコンポーネント
  DialogContent,  // モーダルの内容
  DialogHeader,  // モーダルのヘッダー
  DialogTitle,  // モーダルのタイトル
  DialogTrigger,  // モーダルを開くトリガー
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"  // 入力フィールド
import { Textarea } from "@/components/ui/textarea"  // テキストエリア
import { useToast } from "@/hooks/use-toast"  // 通知表示用フック

// コンポーネントのプロパティの型定義
interface PostFormProps {
  channelId: string  // 投稿先チャンネルのID
}

export function PostForm({ channelId }: PostFormProps) {
  // 状態管理
  const [isOpen, setIsOpen] = useState(false)  // モーダルの開閉状態
  const [isLoading, setIsLoading] = useState(false)  // 投稿処理中の状態
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()  // ページ遷移用
  const { toast } = useToast()  // 通知表示用
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,        // データベースのURL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!    // 公開用キー
  )

  // 新規投稿ボタンクリック時の処理
  const handleClick = async () => {
    // ログイン状態の確認
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // 未ログインの場合、現在のURLを保持してログインページへ
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
      return
    }
    
    // ログイン済みの場合、投稿モーダルを開く
    setIsOpen(true)
  }

  // 投稿を作成する関数
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("ログインが必要です")
      }

      console.log('投稿データ:', {
        channel_id: channelId,
        title,
        description,
        user_id: session.user.id
      })

      const { data, error } = await supabase
        .from("posts")
        .insert({
          channel_id: channelId,
          user_id: session.user.id,
          title,
          description,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabaseエラー:', error)
        throw error
      }

      console.log('投稿成功:', data)
      toast({
        title: "投稿を作成しました",
        description: "投稿が正常に作成されました",
      })
      setIsOpen(false)
      setTitle("")
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error('投稿エラー:', error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "投稿の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // UIの描画
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleClick}>新規投稿</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規投稿</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              required
              minLength={3}
            />
          </div>
          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="説明（10文字以上）"
              required
              minLength={10}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "投稿中..." : "投稿"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 