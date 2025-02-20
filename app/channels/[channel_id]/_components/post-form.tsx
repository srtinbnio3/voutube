"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface PostFormProps {
  channelId: string
}

export function PostForm({ channelId }: PostFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 投稿ボタンクリック時の処理
  const handleClick = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // 現在のURLをredirect_toパラメータとして追加
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
      return
    }
    
    setIsOpen(true)
  }

  // 投稿を作成する関数
  async function handleSubmit(title: string, description: string) {
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("ユーザーが見つかりません")

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

      toast({
        title: "投稿を作成しました",
      })
      
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      // エラーの詳細をコンソールに出力
      console.error('投稿エラー:', error)
      
      // ユーザーにより詳細なエラーメッセージを表示
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "投稿に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          <div>
            <Input
              id="title"
              placeholder="タイトル"
              required
              minLength={3}
              maxLength={100}
            />
          </div>
          <div>
            <Textarea
              id="description"
              placeholder="説明（10文字以上1000文字以内）"
              required
              minLength={10}
              maxLength={1000}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={async () => {
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