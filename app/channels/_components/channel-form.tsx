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
import { Search, Loader2, PlusCircle, Youtube, Sparkles, Check, X, ExternalLink } from "lucide-react"
import Image from "next/image"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthDialog } from "@/hooks/use-auth-dialog"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { Card, CardContent } from "@/components/ui/card"

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
      // 現在のユーザー情報を取得（認証確認のため）
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("ユーザー認証が必要です")
      }

      // 登録するチャンネルデータ（owner_idは設定しない）
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
        title: "チャンネルを登録しました",
        description: `「${selectedChannel.name}」が正常に登録されました`,
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
      {/* 新規チャンネル追加ボタン - モダンなデザイン */}
      <Button
        onClick={handleNewChannelClick}
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-105 rounded-2xl px-8 py-4 font-semibold text-lg"
      >
        {/* 背景のアニメーション効果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* ボタンの内容 */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative">
            <PlusCircle className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          </div>
          <span>新規チャンネル追加</span>
          <Youtube className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        {/* ホバー時のグラデーションボーダー */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-red-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Button>

      {/* チャンネル追加モーダル */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl max-h-[90vh] overflow-hidden mx-4">
          {/* モーダルの背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-pink-50/50 dark:from-red-950/30 dark:via-transparent dark:to-pink-950/30 rounded-3xl" />
          
          <div className="relative z-10 max-h-[80vh] overflow-y-auto p-1">
            <DialogHeader className="pb-4 sm:pb-6 px-1">
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-red-600 to-pink-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-pink-400">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-lg">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                新規チャンネル追加
              </DialogTitle>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">
                YouTubeチャンネルを検索して、システムに追加しましょう
              </p>
            </DialogHeader>
            
            {/* 検索フォーム */}
            {!selectedChannel && (
              <div className="space-y-4 sm:space-y-6 px-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    YouTubeチャンネル検索
                  </label>
                  <form onSubmit={searchYouTubeChannels} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="チャンネル名やキーワードを入力"
                      className="flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all duration-300 text-sm sm:text-base"
                    />
                    <Button 
                      type="submit" 
                      disabled={!searchQuery.trim() || isSearching}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </form>
                </div>
                
                {/* 検索結果の表示 */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      検索結果から選択
                    </label>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                      {searchResults.map((channel) => (
                        <Card
                          key={channel.youtube_channel_id}
                          className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden"
                          onClick={() => selectChannel(channel)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 flex-shrink-0 rounded-2xl overflow-hidden ring-2 ring-white/50 dark:ring-slate-700/50 shadow-lg">
                                {channel.icon_url && (
                                  <Image
                                    src={channel.icon_url}
                                    alt={channel.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    unoptimized={true}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 truncate">
                                  {channel.name}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                                  {channel.description || "説明なし"}
                                </p>
                              </div>
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 選択済みチャンネル表示 */}
            {selectedChannel && (
              <div className="space-y-4 sm:space-y-6 px-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    選択されたチャンネル
                  </label>
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50 rounded-2xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl overflow-hidden ring-2 sm:ring-4 ring-white/50 dark:ring-slate-700/50 shadow-lg">
                          {selectedChannel.icon_url && (
                            <Image
                              src={selectedChannel.icon_url}
                              alt={selectedChannel.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              quality={90}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                            {selectedChannel.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                            {selectedChannel.description || "説明なし"}
                          </p>
                          {selectedChannel.subscriber_count && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 sm:mt-2">
                              登録者数: {selectedChannel.subscriber_count.toLocaleString()}人
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={resetSelection}
                          className="flex-shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs sm:text-sm"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          変更
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* 作成ボタン */}
                <div className="flex justify-end pt-2 sm:pt-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedChannel}
                    className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 rounded-2xl px-6 sm:px-8 py-2 sm:py-3 font-semibold min-w-[120px] sm:min-w-[140px] text-sm sm:text-base"
                  >
                    {/* 背景のアニメーション効果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* ボタンの内容 */}
                    <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white" />
                          <span>作成中...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                          <span>チャンネル作成</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 認証ダイアログ */}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 