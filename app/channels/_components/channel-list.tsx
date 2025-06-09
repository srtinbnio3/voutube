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
import { getChannels, searchChannels } from "../_actions/channel-actions"
import { Loader2 } from "lucide-react"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelListProps {
  initialChannels: Channel[]
  totalChannels?: number
  hasMore?: boolean
}

export function ChannelList({ initialChannels, totalChannels = 0, hasMore = false }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [sortBy, setSortBy] = useState("post_count")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(hasMore)
  const [totalCount, setTotalCount] = useState(totalChannels)

  useEffect(() => {
    setChannels(initialChannels)
    setCurrentPage(1)
    setHasMoreData(hasMore)
    setTotalCount(totalChannels)
  }, [initialChannels, hasMore, totalChannels])

  useEffect(() => {
    setCurrentPage(1)
    // 検索やソートが変更されたらデータをリセット
    const resetData = async () => {
      setIsLoadingMore(true)
      try {
        const response = search 
          ? await searchChannels(search, 0, 16, sortBy)
          : await getChannels(0, 16, sortBy)
        
        setChannels(response.channels)
        setHasMoreData(response.hasMore)
        setTotalCount(response.total)
      } catch (error) {
        console.error('データ取得エラー:', error)
      } finally {
        setIsLoadingMore(false)
      }
    }
    
    // 検索クエリまたはソートが変更された場合のみリセット
    if (search || sortBy !== "post_count") {
      resetData()
    }
  }, [search, sortBy])

  // 表示用チャンネルリストの生成
  const displayChannels = useMemo(() => {
    // 検索・ソート中の場合はクライアントサイドフィルタリング＋ページネーション
    if (search || sortBy !== "post_count") {
    // 検索フィルター
    const filtered = channels.filter(channel =>
      channel.name.toLowerCase().includes(search.toLowerCase())
    )

    // ソート
      const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "post_count") {
        return (b.post_count || 0) - (a.post_count || 0)
      } else if (sortBy === "latest") {
        return new Date(b.latest_post_at || 0).getTime() - new Date(a.latest_post_at || 0).getTime()
      }
      return 0
    })

      // ページネーション適用
      return sorted.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    } else {
      // デフォルト表示の場合は無限スクロール（全件表示）
      return channels
    }
  }, [channels, search, sortBy, currentPage])

  // 総ページ数の計算（検索・ソート時のみ）
  const totalPages = useMemo(() => {
    if (search || sortBy !== "post_count") {
      const filtered = channels.filter(channel =>
        channel.name.toLowerCase().includes(search.toLowerCase())
      )
      return Math.ceil(filtered.length / itemsPerPage)
    }
    return 0
  }, [channels, search, sortBy])

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

  // さらに読み込むハンドラー
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return

    setIsLoadingMore(true)
    try {
      const response = search 
        ? await searchChannels(search, channels.length, 16, sortBy)
        : await getChannels(channels.length, 16, sortBy)
      
      setChannels(prev => [...prev, ...response.channels])
      setHasMoreData(response.hasMore)
      setTotalCount(response.total)
    } catch (error) {
      console.error('追加読み込みエラー:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMoreData, search, channels.length, sortBy])

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
        {displayChannels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
        {displayChannels.length === 0 && (
          <p className="text-center text-muted-foreground">
            チャンネルが見つかりません
          </p>
        )}
      </div>



      {/* さらに読み込むボタン */}
      {hasMoreData && !search && sortBy === "post_count" && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                読み込み中...
              </>
            ) : (
              <>
                さらに読み込む ({totalCount - channels.length}件)
              </>
            )}
          </Button>
        </div>
      )}

      {/* ページネーション（検索・ソート時のみ） */}
      {(search || sortBy !== "post_count") && totalPages > 1 && (
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