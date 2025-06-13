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
import { Loader2, Search } from "lucide-react"

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
  const [searchInput, setSearchInput] = useState("")
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(hasMore)
  const [totalCount, setTotalCount] = useState(totalChannels)

  useEffect(() => {
    setChannels(initialChannels)
    setHasMoreData(hasMore)
    setTotalCount(totalChannels)
  }, [initialChannels, hasMore, totalChannels])

  useEffect(() => {
    // 検索やソートが変更されたらデータをリセット
    const resetData = async () => {
      setIsLoadingMore(true)
      try {
        // 空文字列の検索は全件取得として扱う
        const response = (search && search.trim()) 
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
    // 空文字列でも検索ボタンを押した場合は実行されるように修正
    if (search !== undefined || sortBy !== "post_count") {
      resetData()
    }
  }, [search, sortBy])

  // 検索入力ハンドラー
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  // 検索実行ハンドラー
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }, [searchInput])

  // 検索クリアハンドラー
  const handleSearchClear = useCallback(() => {
    setSearchInput("")
    setSearch("")
  }, [])

  // ソート変更ハンドラー
  const handleSortChange = useCallback((value: string) => {
    setSortBy(value)
  }, [])

  // さらに読み込むハンドラー
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return

    setIsLoadingMore(true)
    try {
      // 空文字列の検索は全件取得として扱う
      const response = (search && search.trim()) 
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
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Input
              placeholder="チャンネルを検索..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="pl-10 h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-12 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            検索
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSearchClear}
              className="h-12 px-4 border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              クリア
            </Button>
          )}
        </form>
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
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      {/* 空の状態 */}
      {channels.length === 0 && (
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

      {/* さらに読み込むボタン（無限スクロール統一） */}
      {hasMoreData && (
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