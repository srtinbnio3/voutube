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
  async function handleSubmit(title: string, description: string) {
    setIsLoading(true)  // 投稿中の状態に設定

    try {
      // ログイン状態の再確認
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("ユーザーが見つかりません")

      // データベースに投稿を保存
      const { error } = await supabase
        .from("posts")
        .insert([
          {
            channel_id: channelId,
            user_id: session.user.id,
            title,
            description,
          },
        ])

      if (error) throw error

      // 投稿成功時の処理
      toast({
        title: "投稿を作成しました",
      })
      
      setIsOpen(false)  // モーダルを閉じる
      router.refresh()  // ページを更新して新しい投稿を表示
    } catch (error) {
      // エラー発生時の処理
      console.error('投稿エラー:', error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "投稿に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)  // 投稿中の状態を解除
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
        <div className="space-y-4">
          {/* タイトル入力フィールド */}
          <div>
            <Input
              id="title"
              placeholder="タイトル"
              required
              minLength={3}
              maxLength={100}
            />
          </div>
          {/* 説明入力フィールド */}
          <div>
            <Textarea
              id="description"
              placeholder="説明（10文字以上1000文字以内）"
              required
              minLength={10}
              maxLength={1000}
            />
          </div>
          {/* 投稿ボタン */}
          <div className="flex justify-end">
            <Button 
              onClick={async () => {
                // 入力値を取得して投稿処理を実行
                const title = (document.getElementById('title') as HTMLInputElement).value
                const description = (document.getElementById('description') as HTMLTextAreaElement).value
                await handleSubmit(title, description)
              }}
              disabled={isLoading}
            >
              {isLoading ? "投稿中..." : "投稿する"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 