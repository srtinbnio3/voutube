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

  // 投稿を作成する関数
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const title = formData.get("title") as string
      const description = formData.get("description") as string

      const { error } = await supabase
        .from("posts")
        .insert([
          {
            channel_id: channelId,
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
      toast({
        title: "エラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>新規投稿</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規投稿</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              name="title"
              placeholder="タイトル"
              required
              minLength={3}
              maxLength={100}
            />
          </div>
          <div>
            <Textarea
              name="description"
              placeholder="説明（10文字以上1000文字以内）"
              required
              minLength={10}
              maxLength={1000}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "投稿中..." : "投稿する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 