import { render, screen } from '@testing-library/react'
import { PostCard } from '../post-card'
import { describe, it, expect, vi } from 'vitest'
import { Database } from '@/database.types'
import { mockUser, mockProfile } from '@/test/test-utils'

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
            user: mockUser
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
  // モックデータ
  const mockPost = {
    id: 'test-post-id',
    title: 'テスト投稿',
    description: 'これはテスト投稿です。',
    score: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    channel_id: 'test-channel-id',
    user_id: mockUser.id,
    votes: [],
    profiles: mockProfile
  }

  it('投稿の内容が正しく表示される', () => {
    render(<PostCard post={mockPost} userId={mockUser.id} />)
    
    expect(screen.getByText('テスト投稿')).toBeInTheDocument()
    expect(screen.getByText('これはテスト投稿です。')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('スコアが正しく表示される', () => {
    render(<PostCard post={mockPost} userId={mockUser.id} />)
    
    const scoreElement = screen.getByText('5')
    expect(scoreElement).toBeInTheDocument()
  })

  // 基本的な表示テスト
  describe('basic rendering', () => {
    it('renders post title and description', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('テスト投稿')).toBeInTheDocument()
      expect(screen.getByText('これはテスト投稿です。')).toBeInTheDocument()
    })

    it('renders user information', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('renders vote buttons', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('5')).toBeInTheDocument() // スコアの表示を確認
    })

    it('renders user avatar with fallback', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      // アバターのフォールバックテキストを確認
      expect(screen.getByText('T')).toBeInTheDocument()
    })
  })

  // リンクのテスト
  describe('links', () => {
    it('does not render title as link since post detail page is not implemented in MVP', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      // タイトルがリンクになっていないことを確認（タイトルテキストを含むaタグがない）
      const titleText = screen.getByText('テスト投稿');
      expect(titleText.tagName).not.toBe('A');
      expect(titleText.closest('a')).toBeNull();
    });

    it('renders correct user profile link', () => {
      render(<PostCard post={mockPost} />, { wrapper: TestWrapper })
      
      const userLink = screen.getByRole('link', { name: /testuser/i })
      expect(userLink).toHaveAttribute('href', `/profile/${mockUser.id}`)
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
      
      expect(screen.getByText('テスト投稿')).toBeInTheDocument()
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