"use client"

import { useEffect, useState } from "react"
import { Database } from "@/database.types"
import { ChannelCard } from "./channel-card"
import { SortSelect } from "./sort-select"
import { SearchInput } from "./search-input"
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

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  )

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (sortBy === "post_count") {
      return (b.post_count || 0) - (a.post_count || 0)
    } else if (sortBy === "latest") {
      return new Date(b.latest_post_at || 0).getTime() - new Date(a.latest_post_at || 0).getTime()
    }
    return 0
  })

  const paginatedChannels = sortedChannels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedChannels.length / itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={search} onChange={setSearch} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {paginatedChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <Button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            前のページ
          </Button>
          <span className="flex items-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages}
            variant="outline"
          >
            次のページ
          </Button>
        </div>
      )}
    </div>
  )
} 