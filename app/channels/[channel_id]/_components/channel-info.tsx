"use client"  // クライアントサイドでの実行を指定

import { useState, useMemo } from "react"
import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Youtube, Share2, Link as LinkIcon, Users, FileText, ExternalLink, TrendingUp } from "lucide-react"
import { formatNumber } from "../../../lib/format"
import { createBrowserClient } from "@supabase/ssr"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ShareButton } from "@/components/share-button"
import { useShare } from "@/hooks/use-share"
import { Card, CardContent } from "@/components/ui/card"

// チャンネルデータの型定義
type Channel = Database["public"]["Tables"]["channels"]["Row"]

// コンポーネントのプロパティの型定義
interface ChannelInfoProps {
  channel: Channel  // 表示するチャンネルの情報
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  const { toast } = useToast()
  const { data: channelData, error, isLoading } = useSWR(
    `/api/channels/${channel.id}/subscriber-count`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // チャンネル名から2文字のイニシャルを生成
  const initials = useMemo(() => {
    return channel.name
      .split('')
      .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CH'
  }, [channel.name])

  const { handleShare } = useShare({
    url: typeof window !== 'undefined' ? `${window.location.origin}/channels/${channel.id}` : '',
    text: `${channel.name}の投稿企画一覧`
  })

  const youtubeUrl = channel.youtube_channel_id 
    ? `https://www.youtube.com/channel/${channel.youtube_channel_id}`
    : null

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* チャンネルアバター - モバイル最適化 */}
        <div className="flex-shrink-0">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-3 border-white/50 shadow-lg ring-2 ring-gradient-to-r ring-from-blue-400 ring-to-purple-400">
            <AvatarImage src={channel.icon_url || undefined} alt={channel.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* チャンネル情報 - モバイル最適化 */}
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400 truncate">
                {channel.name}
              </h1>
              {channel.description && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {channel.description}
                </p>
              )}
            </div>
            
            {/* YouTubeチャンネルリンク - モバイル最適化 */}
            {youtubeUrl && (
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  asChild
                  size="sm"
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    YouTube
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* 統計情報 - モバイル最適化 */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">{channel.post_count || 0}</span>
              <span className="text-slate-500 dark:text-slate-400">企画</span>
            </div>
            
            {channel.subscriber_count && (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                </div>
                                  <span className="font-medium">{formatNumber(channel.subscriber_count)}</span>
                <span className="text-slate-500 dark:text-slate-400">登録</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 