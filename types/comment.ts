import { Database } from '@/database.types'

export type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  }
  mentioned_username?: string
  replies?: Comment[]
}

export type CommentWithReplies = Comment & {
  replies: Comment[]
}

export type CreateCommentInput = {
  postId: string
  content: string
  parentId?: string | null
  mentioned_username?: string
}

export type UpdateCommentInput = {
  content: string
  mentioned_username?: string
}

export type CommentResponse = {
  comments: CommentWithReplies[]
  total: number
  page: number
  limit: number
  hasMore: boolean
} 