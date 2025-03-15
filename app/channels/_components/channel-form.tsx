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
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

/**
 * YouTubeチャンネルの型定義
 * YouTube APIから取得するチャンネル情報の構造を定義します
 */
type YouTubeChannel = {
  youtube_channel_id: string
  name: string
  description: string
  icon_url: string
  subscriber_count?: number
}

/**
 * チャンネル作成フォームコンポーネント
 * 
 * 新しいYouTubeチャンネルをシステムに追加するための
 * ダイアログフォームを提供します。
 * YouTube APIを使用してチャンネルを検索し、
 * 選択されたチャンネル情報をSupabaseに保存します。
 */
export function ChannelForm() {
  // 状態管理
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<YouTubeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()

  // Supabaseクライアント初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 新規チャンネルボタンクリック時の処理
  const handleNewChannelClick = async () => {
    // ログイン確認
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // 未ログインの場合、現在のURLを保持してログインページへリダイレクト
      const currentPath = window.location.pathname
      router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
      return
    }
    // ログイン済みの場合、ダイアログを開く
    setIsOpen(true)
  }

  /**
   * YouTubeチャンネルを検索する関数
   * 入力されたクエリでYouTube APIを検索し結果を表示します
   */
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

  /**
   * チャンネルを選択する関数
   * 検索結果から選択されたチャンネルを状態に保存します
   */
  function selectChannel(channel: YouTubeChannel) {
    setSelectedChannel(channel)
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
    
    // チャンネルが選択されていない場合は処理しない
    if (!selectedChannel) {
      toast({
        title: "エラー",
        description: "チャンネルを選択してください",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      // 登録するチャンネルデータ
      const channelData = {
        name: selectedChannel.name,
        description: selectedChannel.description || "",
        youtube_channel_id: selectedChannel.youtube_channel_id,
        subscriber_count: selectedChannel.subscriber_count,
        icon_url: selectedChannel.icon_url,
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
        resetSelection()
      }
    }}>
      <DialogTrigger asChild>
        <Button onClick={handleNewChannelClick}>新規チャンネル</Button>
      </DialogTrigger>
      <DialogContent className="p-3 sm:p-4 w-[95vw] max-w-[400px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle>新規チャンネル</DialogTitle>
        </DialogHeader>
        
        {/* YouTube検索フォーム */}
        {!selectedChannel && (
          <div className="space-y-3">
            <form onSubmit={searchYouTubeChannels} className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="YouTubeチャンネル名で検索"
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    検索中
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    検索
                  </>
                )}
              </Button>
            </form>
            
            {/* 検索結果の表示 - より最適化された高さとシンプルな表示 */}
            {searchResults.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto border rounded-md">
                <div className="p-1">
                  {searchResults.map((channel) => (
                    <div
                      key={channel.youtube_channel_id}
                      className="flex items-center gap-2 p-1.5 hover:bg-secondary rounded-md cursor-pointer"
                      onClick={() => selectChannel(channel)}
                    >
                      <div className="w-8 h-8 flex-shrink-0">
                        {channel.icon_url && (
                          <Image
                            src={channel.icon_url}
                            alt={channel.name}
                            width={32}
                            height={32}
                            className="rounded-full w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{channel.name}</p>
                        {/* 説明文は非表示 */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 選択済みチャンネル表示 - シンプル化 */}
        {selectedChannel && (
          <div className="grid grid-cols-[auto,1fr,auto] gap-2 items-center p-2 border rounded-md mb-3">
            <div className="w-8 h-8 flex-shrink-0">
              {selectedChannel.icon_url && (
                <Image
                  src={selectedChannel.icon_url}
                  alt={selectedChannel.name}
                  width={32}
                  height={32}
                  className="rounded-full w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{selectedChannel.name}</p>
            </div>
            <Button variant="ghost" size="sm" className="flex-shrink-0 h-7 px-2 py-0" onClick={resetSelection}>
              変更
            </Button>
          </div>
        )}
        
        {/* チャンネル作成フォーム */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end mt-3">
            <Button type="submit" disabled={isLoading || !selectedChannel}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  作成中...
                </>
              ) : "作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 