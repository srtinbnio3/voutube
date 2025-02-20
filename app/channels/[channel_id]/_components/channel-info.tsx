"use client"  // クライアントサイドでの実行を指定

import { Database } from "@/database.types"  // データベースの型定義
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// チャンネルデータの型定義
type Channel = Database["public"]["Tables"]["channels"]["Row"]

// コンポーネントのプロパティの型定義
interface ChannelInfoProps {
  channel: Channel  // 表示するチャンネルの情報
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  return (
    <Card>
      {/* チャンネルのヘッダー情報 */}
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        {/* チャンネルアイコン */}
        <Avatar className="h-20 w-20">
          <AvatarImage src={channel.icon_url || ""} />
          <AvatarFallback>CH</AvatarFallback>  {/* アイコンが読み込めない場合の代替表示 */}
        </Avatar>

        {/* チャンネル基本情報 */}
        <div>
          <h1 className="text-2xl font-bold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">
            投稿数: {channel.post_count || 0}
          </p>
          {/* 登録者数の表示（存在する場合のみ） */}
          {channel.subscriber_count && (
            <p className="text-sm text-muted-foreground">
              登録者数: {channel.subscriber_count.toLocaleString()}
            </p>
          )}
        </div>
      </CardHeader>

      {/* チャンネルの説明文 */}
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {channel.description || "説明はありません"}
        </p>
      </CardContent>
    </Card>
  )
} 