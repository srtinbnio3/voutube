"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SortSelectProps {
  value: string
  onChange: (value: string) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="並び替え" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="post_count">投稿数順</SelectItem>
        <SelectItem value="latest">最新の投稿順</SelectItem>
      </SelectContent>
    </Select>
  )
} 