import { Database } from '@/database.types'

export type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: {
    username: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

export type CommentWithReplies = Comment & {
  replies: Comment[]
}

export type CreateCommentInput = {
  postId: string
  content: string
  parentId?: string | null
}

export type UpdateCommentInput = {
  content: string
}

export type CommentResponse = {
  comments: CommentWithReplies[]
  total: number
  page: number
  limit: number
  hasMore: boolean
} 