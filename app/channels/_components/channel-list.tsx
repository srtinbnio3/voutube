"use client"

import { useCallback, useState } from "react"
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
  const [channels] = useState<Channel[]>(initialChannels)
  const [sortBy, setSortBy] = useState("post_count")
  const [search, setSearch] = useState("")

  const handleChannelClick = useCallback((channelId: string) => {
    router.push(`/channels/${channelId}`)
  }, [router])

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={search} onChange={setSearch} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredChannels.map((channel) => (
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