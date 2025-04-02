'use client'

import { Comment } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface CommentActionsProps {
  comment: Comment
  isEditing: boolean
  isSubmitting: boolean
  onEdit: () => void
  onUpdate: () => void
  onDelete: () => void
}

export function CommentActions({
  comment,
  isEditing,
  isSubmitting,
  onEdit,
  onUpdate,
  onDelete
}: CommentActionsProps) {
  if (isEditing) {
    return (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit()}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button size="sm" onClick={onUpdate} disabled={isSubmitting}>
          {isSubmitting ? '更新中...' : '更新'}
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          編集
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 