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
import { useToast } from "@/components/ui/use-toast"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthDialog } from "@/hooks/use-auth-dialog"
import { AuthDialog } from "@/components/ui/auth-dialog"

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
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null)
  const [searchResults, setSearchResults] = useState<YouTubeChannel[]>([])

  const router = useRouter()
  const { toast } = useToast()
  const { open, setOpen, checkAuthAndShowDialog } = useAuthDialog()

  // Supabaseクライアント初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 新規チャンネルボタンクリック時の処理
  const handleNewChannelClick = async () => {
    // ログイン確認と未ログイン時のダイアログ表示
    const isAuthenticated = await checkAuthAndShowDialog()
    if (!isAuthenticated) return
    
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
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error('検索リクエストに失敗しました')
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
  async function selectChannel(channel: YouTubeChannel) {
    try {
      setIsLoading(true)
      // 選択したチャンネルの詳細情報（登録者数含む）を取得
      const response = await fetch(`/api/youtube/channel?id=${channel.youtube_channel_id}`)
      if (!response.ok) {
        throw new Error('チャンネル情報の取得に失敗しました')
      }
      const channelDetail = await response.json()
      // 詳細情報で更新
      setSelectedChannel(channelDetail)
    } catch (error) {
      console.error('チャンネル情報取得エラー:', error)
      toast({
        title: "エラー",
        description: "チャンネル情報の取得に失敗しました",
        variant: "destructive",
      })
      // エラー時は検索結果のデータをそのまま使用
      setSelectedChannel(channel)
    } finally {
      setIsLoading(false)
    }
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
              // 事前チェック：既に同じチャンネルが存在するかチェック
      const { data: existingChannel, error: checkError } = await supabase
        .from("channels")
        .select("id, name")
        .eq("youtube_channel_id", selectedChannel.youtube_channel_id)
        .single()

              // チェック時のエラーを無視（存在しない場合は正常）
        if (checkError && checkError.code !== 'PGRST116') {
          console.warn('事前チェックエラー:', checkError)
        }

        if (existingChannel) {

        toast({
          title: "チャンネルは既に登録済みです",
          description: `「${existingChannel.name}」は既にデータベースに登録されています`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      

      // 登録するチャンネルデータ
      const channelData = {
        name: selectedChannel.name,
        description: selectedChannel.description || "",
        youtube_channel_id: selectedChannel.youtube_channel_id,
        subscriber_count: selectedChannel.subscriber_count || 0, // デフォルト値を設定
        icon_url: selectedChannel.icon_url,
        updated_at: new Date().toISOString(), // 更新日時を明示的に設定
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
        
        // 重複エラーの場合は専用メッセージを表示
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast({
            title: "チャンネルは既に登録済みです",
            description: "このチャンネルは既にデータベースに登録されています",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        
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
    } catch (error: any) {
              console.error('作成エラー:', error)
      

      
      // 重複エラーの詳細チェック
      if (error?.code === '23505' || 
          error?.message?.includes('duplicate') || 
          error?.message?.includes('unique') ||
          error?.message?.includes('already exists')) {
        toast({
          title: "チャンネルは既に登録済みです",
          description: `「${selectedChannel?.name}」は既にデータベースに登録されています`,
          variant: "destructive",
        })
      } else {
        // その他のエラー
        toast({
          title: "エラーが発生しました",
          description: error instanceof Error ? error.message : "チャンネルの作成に失敗しました",
          variant: "destructive",
        })
      }
    } finally {
              setIsLoading(false)
    }
  }

  return (
    <>
      {/* 新規チャンネル追加ボタン */}
      <div className="mb-4">
        <Button
          onClick={handleNewChannelClick}
          className="w-full"
          disabled={isLoading}
        >
          新規チャンネル追加
        </Button>
      </div>

      {/* チャンネル追加ダイアログ */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <Button type="submit" disabled={!searchQuery.trim() || isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  検索
                </Button>
              </form>
              
              {/* 検索結果の表示 */}
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
                              unoptimized={true}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate max-w-[200px]">{channel.name}</p>
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
                    loading="lazy"
                    quality={90}
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
              <Button 
                type="submit" 
                disabled={isLoading || !selectedChannel}
              >
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
      
      {/* 認証ダイアログ */}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 