"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Database } from "@/database.types"
import { ChannelCard } from "./channel-card"
import { SortSelect } from "./sort-select"
import { SearchInput } from "./search-input"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelListProps {
  initialChannels: Channel[]
}

export function ChannelList({ initialChannels }: ChannelListProps) {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [sortBy, setSortBy] = useState("post_count")
  const [search, setSearch] = useState("")

  useEffect(() => {
    setChannels(initialChannels)
  }, [initialChannels])

  const handleChannelClick = useCallback((channelId: string) => {
    router.push(`/channels/${channelId}`)
  }, [router])

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  )

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (sortBy === "post_count") {
      return (b.post_count || 0) - (a.post_count || 0)
    } else {
      return new Date(b.latest_post_at || 0).getTime() - new Date(a.latest_post_at || 0).getTime()
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={search} onChange={setSearch} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>
      
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