"use client"

import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelInfoProps {
  channel: Channel
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-20 w-20">
          <AvatarImage src={channel.icon_url || ""} />
          <AvatarFallback>CH</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">
            投稿数: {channel.post_count || 0}
          </p>
          {channel.subscriber_count && (
            <p className="text-sm text-muted-foreground">
              登録者数: {channel.subscriber_count.toLocaleString()}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {channel.description || "説明はありません"}
        </p>
      </CardContent>
    </Card>
  )
} 