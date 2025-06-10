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
      
      // 重複を除去して新しいチャンネルのみを追加
      setChannels(prev => {
        const existingIds = new Set(prev.map(channel => channel.id))
        const newChannels = response.channels.filter(channel => !existingIds.has(channel.id))
        return [...prev, ...newChannels]
      })
      setHasMoreData(response.hasMore)
      setTotalCount(response.total)
    } catch (error) {
      console.error('追加読み込みエラー:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMoreData, search, channels.length, sortBy])

  return (
    <div className="space-y-8">
      {/* 検索とソートのコントロール */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg max-w-6xl mx-auto">
        <div className="relative flex-1 sm:max-w-md">
          <Input
            placeholder="チャンネルを検索..."
            value={search}
            onChange={handleSearch}
            className="pl-10 h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="sm:w-[200px] h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <SelectItem value="post_count" className="rounded-lg">投稿数順</SelectItem>
            <SelectItem value="latest" className="rounded-lg">最新の投稿順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* チャンネル一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {displayChannels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      {/* 空の状態 */}
      {displayChannels.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
            <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
            チャンネルが見つかりません
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            検索条件を変更して再度お試しください
          </p>
        </div>
      )}

      {/* ページネーション（検索・ソート時のみ） */}
      {(search || sortBy !== "post_count") && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={`h-10 w-10 rounded-xl transition-all duration-200 ${
                currentPage === pageNum 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}

      {/* さらに読み込むボタン */}
      {hasMoreData && !search && sortBy === "post_count" && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="h-14 px-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">読み込み中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="font-medium">
                  さらに読み込む ({totalCount - channels.length}件)
                </span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  )
} 