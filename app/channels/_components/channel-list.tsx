"use client"  // クライアントサイドでの実行を指定

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Database } from "@/database.types"
import { ChannelCard } from "./channel-card"
import { SortSelect } from "./sort-select"
import { SearchInput } from "./search-input"

// チャンネルの型定義
type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelListProps {
  initialChannels: Channel[]  // 初期表示用のチャンネル一覧
}

export function ChannelList({ initialChannels }: ChannelListProps) {
  const router = useRouter()
  // 状態管理
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [sortBy, setSortBy] = useState("post_count")  // 並び替えの基準
  const [search, setSearch] = useState("")  // 検索キーワード

  // チャンネル一覧が更新されたら状態を更新
  useEffect(() => {
    setChannels(initialChannels)
  }, [initialChannels])

  // チャンネルクリック時の処理
  const handleChannelClick = useCallback((channelId: string) => {
    router.push(`/channels/${channelId}`)  // チャンネル詳細ページへ遷移
  }, [router])

  // 検索フィルター
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  )

  // チャンネルの並び替え
  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (sortBy === "post_count") {
      // 投稿数順の並び替え
      return (b.post_count || 0) - (a.post_count || 0)
    } else {
      // 最新の投稿順の並び替え
      return new Date(b.latest_post_at || 0).getTime() - new Date(a.latest_post_at || 0).getTime()
    }
  })

  return (
    <div className="space-y-6">
      {/* 検索と並び替えのコントロール */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={search} onChange={setSearch} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>
      
      {/* チャンネル一覧の表示 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sortedChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onClick={() => handleChannelClick(channel.id)}
          />
        ))}
      </div>
    </div>
  )
} 