"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"
import { formatNumber } from "../../lib/format"
import { memo, useMemo, useEffect, useState } from "react"
import { Share2, Link as LinkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import useSWR from 'swr'
import { fetcher } from '../../lib/fetcher'
import { ShareButton } from "@/components/share-button"
import { useShare } from "@/hooks/use-share"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelCardProps {
  channel: Channel
}

const ChannelCard = memo(function ChannelCard({ channel }: ChannelCardProps) {
  const { toast } = useToast()
  const [shareUrl, setShareUrl] = useState<string>("")
  
  useEffect(() => {
    setShareUrl(`${window.location.origin}/channels/${channel.id}`)
  }, [channel.id])

  // 登録者数を取得
  const { data: channelData, error, isLoading } = useSWR(
    `/api/channels/${channel.id}/subscriber-count`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true,
      dedupingInterval: 10000,
      errorRetryCount: 2
    }
  )

  // チャンネル名から2文字のイニシャルを生成
  const initials = useMemo(() => {
    return channel.name
      .split('')
      .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [channel.name])

  // 最終投稿日時の相対表示
  const relativeTime = useMemo(() => {
    if (!channel.latest_post_at) return null
    return formatDistanceToNow(new Date(channel.latest_post_at), { locale: ja, addSuffix: true })
  }, [channel.latest_post_at])

  // 投稿ステータスの計算（新規追加）
  const postStatus = useMemo(() => {
    if (!channel.latest_post_at) {
      return {
        color: 'bg-slate-400',
        label: '投稿なし',
        description: '投稿履歴がありません'
      }
    }

    const now = new Date()
    const lastPost = new Date(channel.latest_post_at)
    const daysDiff = Math.floor((now.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 7) {
      return {
        color: 'bg-gradient-to-r from-green-400 to-emerald-500',
        label: 'アクティブ',
        description: '最近投稿があります'
      }
    } else if (daysDiff <= 30) {
      return {
        color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        label: '休止中',
        description: 'しばらく投稿がありません'
      }
    } else {
      return {
        color: 'bg-gradient-to-r from-red-400 to-rose-500',
        label: '長期休止',
        description: '長期間投稿がありません'
      }
    }
  }, [channel.latest_post_at])

  const { handleShare } = useShare({
    url: shareUrl,
    text: `${channel.name}の投稿企画一覧`
  })

  return (
    <Link href={`/channels/${channel.id}`}>
      <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1 rounded-2xl">
        {/* カードの背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-white/50 dark:ring-slate-700/50 shadow-lg">
                {channel.icon_url && (
                  <AvatarImage 
                    src={channel.icon_url} 
                    alt={channel.name} 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                )}
                <AvatarFallback delayMs={600} className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {initials || 'CH'}
                </AvatarFallback>
              </Avatar>
              {/* 投稿ステータスインジケーター */}
              <div 
                className={`absolute -bottom-1 -right-1 w-5 h-5 ${postStatus.color} rounded-full border-2 border-white dark:border-slate-800 shadow-sm`}
                title={`${postStatus.label}: ${postStatus.description}`}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                {channel.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 mt-1">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">{channel.post_count || 0}</span>
                  <span className="text-slate-500 dark:text-slate-400">企画</span>
                </div>
                <div className="w-1 h-1 bg-slate-400 rounded-full" />
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">
                    {isLoading ? (
                      <div className="w-12 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ) : (
                      formatNumber(channelData?.subscriber_count || channel.subscriber_count || 0)
                    )}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">登録者</span>
                </div>
              </div>
            </div>
            
            {/* シェアボタン */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" onClick={(e) => e.preventDefault()}>
              <ShareButton onShare={handleShare} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 pt-0">
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {channel.description || "説明はありません"}
          </p>
          
          {/* 最終投稿時間とステータス */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className={`w-2 h-2 ${postStatus.color} rounded-full ${postStatus.label === 'アクティブ' ? 'animate-pulse' : ''}`} />
              <span>
                {relativeTime ? `最終投稿: ${relativeTime}` : '投稿履歴なし'}
              </span>
            </div>
            
            {/* 右下の装飾アイコン */}
            <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </CardContent>
        
        {/* ホバー時のボーダーエフェクト */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500" />
      </Card>
    </Link>
  )
})

// コンポーネントの名前を設定
ChannelCard.displayName = 'ChannelCard'

// コンポーネントをエクスポート
export { ChannelCard } 