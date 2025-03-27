"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChannelCard } from "./channel-card"
import { Database } from "@/database.types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelListProps {
  initialChannels: Channel[]
}

export function ChannelList({ initialChannels }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [sortBy, setSortBy] = useState("post_count")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    setChannels(initialChannels)
    setCurrentPage(1) // 新しいチャンネルリストが来たら1ページ目に戻る
  }, [initialChannels])

  useEffect(() => {
    setCurrentPage(1) // 検索やソートが変更されたら1ページ目に戻る
  }, [search, sortBy])

  // 検索とソートを適用したチャンネルリストを生成
  const filteredAndSortedChannels = useMemo(() => {
    // 検索フィルター
    const filtered = channels.filter(channel =>
      channel.name.toLowerCase().includes(search.toLowerCase())
    )

    // ソート
    return [...filtered].sort((a, b) => {
      if (sortBy === "post_count") {
        return (b.post_count || 0) - (a.post_count || 0)
      } else if (sortBy === "latest") {
        return new Date(b.latest_post_at || 0).getTime() - new Date(a.latest_post_at || 0).getTime()
      }
      return 0
    })
  }, [channels, search, sortBy])

  // ページネーション適用後のチャンネルリスト
  const paginatedChannels = useMemo(() => {
    return filteredAndSortedChannels.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [filteredAndSortedChannels, currentPage])

  // 総ページ数の計算
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedChannels.length / itemsPerPage)
  }, [filteredAndSortedChannels.length])

  // 検索ハンドラー
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  // ソート変更ハンドラー
  const handleSortChange = useCallback((value: string) => {
    setSortBy(value)
  }, [])

  // ページ変更ハンドラー
  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber)
  }, [])

  return (
    <div className="space-y-4">
      {/* 検索とソートのコントロール */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="チャンネルを検索..."
          value={search}
          onChange={handleSearch}
          className="sm:max-w-[300px]"
        />
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="post_count">投稿数順</SelectItem>
            <SelectItem value="latest">最新の投稿順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* チャンネル一覧 */}
      <div className="grid gap-4">
        {paginatedChannels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
        {paginatedChannels.length === 0 && (
          <p className="text-center text-muted-foreground">
            チャンネルが見つかりません
          </p>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
} 