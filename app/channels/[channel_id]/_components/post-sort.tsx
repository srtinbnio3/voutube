"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PostSortProps {
  currentSort: string
}

export function PostSort({ currentSort }: PostSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'popular') {
      params.delete('sort') // デフォルト値なのでパラメータから削除
    } else {
      params.set('sort', value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="並び替え" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popular">人気順</SelectItem>
        <SelectItem value="recent">新着順</SelectItem>
      </SelectContent>
    </Select>
  )
} 