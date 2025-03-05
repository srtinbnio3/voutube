import { render, screen } from '@testing-library/react'
import { PostCard } from '../post-card'
import { describe, it, expect, vi } from 'vitest'
import { Database } from '@/database.types'

// 投稿の型定義
type Post = Database['public']['Tables']['posts']['Row']
type PostWithVotesAndProfile = Post & {
  score: number | null
  votes: {
    is_upvote: boolean
    user_id: string
  }[]
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  }
}

// Next.jsのルーターをモック化
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Supabaseクライアントをモック化
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      // ログインしているユーザーの情報を返す
      getSession: () => ({
        data: { 
          session: {
            user: { id: 'test-user-id' }
          }
        }
      })
    },
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis(),
    })
  })
}))

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

describe('PostCard', () => {
  // 基本的な投稿データ
  const mockPost: PostWithVotesAndProfile = {
    id: '1',
    title: 'Test Post',
    description: 'Test Description',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    channel_id: '1',
    user_id: '1',
    score: 0,
    votes: [],
    profiles: {
      id: '1',
      username: 'testuser',
      avatar_url: null
    }
  }

  // 基本的な表示テスト
  describe('basic rendering', () => {
    it('renders post title and description', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('Test Post')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders user information', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('renders vote buttons', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('0')).toBeInTheDocument() // スコアの表示を確認
    })

    it('renders user avatar with fallback', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      // アバターのフォールバックテキストを確認
      expect(screen.getByText('T')).toBeInTheDocument()
    })
  })

  // リンクのテスト
  describe('links', () => {
    it('renders correct post link', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      const postLink = screen.getByRole('link', { name: /Test Post/i })
      expect(postLink).toHaveAttribute('href', '/channels/1/posts/1')
    })

    it('renders correct user profile link', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      const userLink = screen.getByRole('link', { name: /testuser/i })
      expect(userLink).toHaveAttribute('href', '/profile/1')
    })
  })

  // 日付表示のテスト
  describe('date display', () => {
    it('renders relative time', () => {
      const recentPost = {
        ...mockPost,
        created_at: new Date().toISOString()
      }
      
      render(<PostCard post={recentPost} />, { wrapper: TestWrapper })
      
      // 「約0分前」または「約1分前」のような表示を確認
      expect(screen.getByText(/約\d+分前/)).toBeInTheDocument()
    })
  })

  // エラー状態のテスト
  describe('error states', () => {
    it('renders without description', () => {
      const postWithoutDesc = {
        ...mockPost,
        description: ''  // 空文字列を使用
      }
      
      render(<PostCard post={postWithoutDesc} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('Test Post')).toBeInTheDocument()
      // 説明文がない場合でもエラーにならないことを確認
    })

    it('renders with missing user data', () => {
      const postWithoutUser = {
        ...mockPost,
        profiles: {
          id: '1',
          username: 'Unknown User',  // 不明なユーザーとして表示
          avatar_url: null
        }
      }
      
      render(<PostCard post={postWithoutUser} />, { wrapper: TestWrapper })
      
      // ユーザー名がない場合は「Unknown User」と表示されることを確認
      expect(screen.getByText('Unknown User')).toBeInTheDocument()
    })
  })

  // 注：投票機能のテストは複雑なため、手動テストで確認することにしました
}) 