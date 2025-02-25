"use client"

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
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"

// YouTubeチャンネルの型定義
type YouTubeChannel = {
  youtube_channel_id: string
  name: string
  description: string
  icon_url: string
  subscriber_count?: number
}

export function ChannelForm() {
  // 状態管理
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<YouTubeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null)
  
  // 従来のフォーム用の状態（選択されたチャンネルがない場合用）
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()

  // Supabaseクライアント初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // YouTubeチャンネルを検索する関数
  async function searchYouTubeChannels(e: React.FormEvent) {
    e.preventDefault()
    
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setSearchResults([])
    
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error('チャンネル検索に失敗しました')
      }
      
      const channels = await response.json()
      setSearchResults(channels)
    } catch (error) {
      console.error('検索エラー:', error)
      toast({
        title: "検索エラー",
        description: "YouTubeチャンネルの検索中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // チャンネルを選択する関数
  function selectChannel(channel: YouTubeChannel) {
    setSelectedChannel(channel)
    setName(channel.name)
    setDescription(channel.description || "")
  }

  // チャンネル選択をリセットする関数
  function resetSelection() {
    setSelectedChannel(null)
    setSearchResults([])
    setSearchQuery("")
  }

  // チャンネル作成フォームを送信する関数
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ログイン確認
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("ログインが必要です")
      }

      // 登録するチャンネルデータ
      const channelData = selectedChannel 
        ? {
            name: selectedChannel.name,
            description: selectedChannel.description || "",
            youtube_channel_id: selectedChannel.youtube_channel_id,
            subscriber_count: selectedChannel.subscriber_count,
            icon_url: selectedChannel.icon_url,
          }
        : {
            name,
            description,
            youtube_channel_id: crypto.randomUUID(), // 一時的なID
          }

      // チャンネル作成
      const { data, error } = await supabase
        .from("channels")
        .insert(channelData)
        .select()
        .single()

      if (error) {
        console.error('Supabaseエラー詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      // 成功処理
      console.log('作成成功:', data)
      toast({
        title: "チャンネルを作成しました",
        description: "チャンネルが正常に作成されました",
      })
      
      // フォームをリセット
      setIsOpen(false)
      setName("")
      setDescription("")
      setSelectedChannel(null)
      setSearchQuery("")
      setSearchResults([])
      
      // 画面更新
      router.refresh()
    } catch (error) {
      console.error('作成エラー:', error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "チャンネルの作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        // ダイアログを閉じたときにリセット
        resetSelection()
        setName("")
        setDescription("")
      }
    }}>
      <DialogTrigger asChild>
        <Button>新規チャンネル</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新規チャンネル</DialogTitle>
        </DialogHeader>
        
        {/* YouTube検索フォーム */}
        {!selectedChannel && (
          <div className="space-y-4">
            <form onSubmit={searchYouTubeChannels} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="YouTubeチャンネル名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit" disabled={isSearching} size="sm">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "検索"}
              </Button>
            </form>
            
            {/* 検索結果の表示 */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                {searchResults.map((channel) => (
                  <div
                    key={channel.youtube_channel_id}
                    className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md cursor-pointer"
                    onClick={() => selectChannel(channel)}
                  >
                    {channel.icon_url && (
                      <Image
                        src={channel.icon_url}
                        alt={channel.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{channel.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{channel.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 検索結果がない場合のセパレーター */}
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-border"></div>
                <p className="mx-2 text-xs text-muted-foreground">または手動で入力</p>
                <div className="flex-grow h-px bg-border"></div>
              </div>
            )}
          </div>
        )}
        
        {/* 選択済みチャンネル表示 */}
        {selectedChannel && (
          <div className="flex items-center justify-between p-2 border rounded-md mb-4">
            <div className="flex items-center gap-2">
              {selectedChannel.icon_url && (
                <Image
                  src={selectedChannel.icon_url}
                  alt={selectedChannel.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{selectedChannel.name}</p>
                <p className="text-xs text-muted-foreground">YouTube チャンネル ID: {selectedChannel.youtube_channel_id}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSelection}>
              変更
            </Button>
          </div>
        )}
        
        {/* チャンネル作成フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedChannel && (
            <>
              <div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="チャンネル名"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="チャンネルの説明"
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "作成中..." : "作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 