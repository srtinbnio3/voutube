"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getChannelInfo } from "@/utils/youtube"
import { useState } from "react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onError?: (message: string) => void
  onSuccess?: (channelData: any) => void
}

export function SearchInput({ 
  value, 
  onChange, 
  onError,
  onSuccess 
}: SearchInputProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!value.trim()) return

    setIsLoading(true)
    try {
      if (!value.startsWith('UC') || value.length !== 24) {
        onError?.('無効なチャンネルIDです')
        return
      }

      const channelData = await getChannelInfo(value)
      if (!channelData) {
        onError?.('チャンネルが見つかりません')
        return
      }
      onSuccess?.(channelData)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          onError?.('YouTube APIの制限に達しました。しばらく時間をおいて再度お試しください。')
        } else {
          onError?.('チャンネルの検索中にエラーが発生しました')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="チャンネルを検索"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button 
        onClick={handleSearch}
        disabled={isLoading}
      >
        検索
      </Button>
    </div>
  )
} 