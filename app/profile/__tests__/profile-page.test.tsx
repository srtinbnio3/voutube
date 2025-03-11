import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserProfilePage from '../[user_id]/page'
import { createClient } from '@/utils/supabase/server'

// Supabaseクライアントのモック
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}))

// next/navigationのモック
vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}))

describe('Profile Page', () => {
  const mockProfile = {
    id: 'test-user-id',
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }

  const mockPosts = [
    {
      id: 'post-1',
      title: 'テスト投稿1',
      description: 'テスト投稿の説明1',
      score: 10,
      created_at: '2024-03-01T00:00:00Z',
      channels: {
        id: 'channel-1',
        name: 'テストチャンネル1'
      }
    },
    {
      id: 'post-2',
      title: 'テスト投稿2',
      description: 'テスト投稿の説明2',
      score: 5,
      created_at: '2024-03-02T00:00:00Z',
      channels: {
        id: 'channel-2',
        name: 'テストチャンネル2'
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // PROF-02-01: 投稿のユーザープロフィール表示
  it('displays user profile information', async () => {
    const mockSupabase = {
      from: vi.fn((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
              }))
            }))
          }
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
              }))
            }))
          }))
        }
      })
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    render(await UserProfilePage({ params: Promise.resolve({ user_id: 'test-user-id' }) }))

    expect(screen.getByText(mockProfile.username)).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument() // ユーザー名の頭文字
    expect(screen.getByText(/登録日:/)).toBeInTheDocument()
  })

  // PROF-02-02: アバター画像がnullの場合の表示
  it('displays fallback avatar when avatar_url is null', async () => {
    const profileWithoutAvatar = { ...mockProfile, avatar_url: null }
    const mockSupabase = {
      from: vi.fn((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: profileWithoutAvatar, error: null })
              }))
            }))
          }
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
              }))
            }))
          }))
        }
      })
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    render(await UserProfilePage({ params: Promise.resolve({ user_id: 'test-user-id' }) }))

    expect(screen.getByText('T')).toBeInTheDocument() // ユーザー名の頭文字
  })

  // PROF-02-03: 長いユーザー名の表示処理
  it('handles long usernames correctly', async () => {
    const profileWithLongName = {
      ...mockProfile,
      username: 'verylongusernamethatmightoverflow'
    }
    const mockSupabase = {
      from: vi.fn((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: profileWithLongName, error: null })
              }))
            }))
          }
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
              }))
            }))
          }))
        }
      })
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    render(await UserProfilePage({ params: Promise.resolve({ user_id: 'test-user-id' }) }))

    const username = screen.getByText(profileWithLongName.username)
    expect(username).toBeInTheDocument()
    // Tailwindのtext-2xlクラスが適用されていることを確認
    expect(username.className).toContain('text-2xl')
  })

  // PROF-02-05: プロフィール情報の表示統一性
  it('displays user posts consistently', async () => {
    const mockSupabase = {
      from: vi.fn((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
              }))
            }))
          }
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
              }))
            }))
          }))
        }
      })
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    render(await UserProfilePage({ params: Promise.resolve({ user_id: 'test-user-id' }) }))

    // 投稿のタイトルと説明が表示されていることを確認
    mockPosts.forEach(post => {
      expect(screen.getByText(post.title)).toBeInTheDocument()
      expect(screen.getByText(post.description)).toBeInTheDocument()
      expect(screen.getByText(`スコア: ${post.score}`)).toBeInTheDocument()
      expect(screen.getByText(post.channels.name)).toBeInTheDocument()
    })
  })
}) 