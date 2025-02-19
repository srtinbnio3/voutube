"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelCardProps {
  channel: Channel
  onClick?: () => void
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
  return (
    <Card 
      className="hover:bg-accent cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={channel.icon_url || ""} />
          <AvatarFallback>CH</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="font-semibold">{channel.name}</h3>
          <p className="text-sm text-muted-foreground">
            投稿数: {channel.post_count || 0}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {channel.description || "説明はありません"}
        </p>
        {channel.latest_post_at && (
          <p className="text-xs text-muted-foreground mt-2">
            最終投稿: {formatDistanceToNow(new Date(channel.latest_post_at), { locale: ja, addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 