import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PostCard } from '../post-card'
import { useRouter, useSearchParams } from 'next/navigation'

// モックデータ
const mockPosts = [
  {
    id: '1',
    title: 'テスト投稿1',
    description: 'テスト内容1',
    user_id: 'user1',
    channel_id: 'channel1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    score: 10,
    profiles: {
      id: 'user1',
      username: 'ユーザー1',
      avatar_url: null
    },
    votes: [{ is_upvote: true, user_id: 'user2' }]
  },
  {
    id: '2',
    title: 'テスト投稿2',
    description: 'テスト内容2',
    user_id: 'user2',
    channel_id: 'channel1',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    score: 5,
    profiles: {
      id: 'user2',
      username: 'ユーザー2',
      avatar_url: null
    },
    votes: []
  }
]

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  pathname: '/channels/[channel_id]',
  query: {}
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn()
  }),
  usePathname: () => '/channels/test-channel'
}))

describe('PostList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // POST-01-01: 投稿のあるチャンネルの投稿一覧表示
  it('displays list of posts when posts exist', async () => {
    render(
      <div>
        {mockPosts.map(post => (
          <PostCard key={post.id} post={post} userId={undefined} />
        ))}
      </div>
    )
    
    await waitFor(() => {
      expect(screen.getByText('テスト投稿1')).toBeInTheDocument()
      expect(screen.getByText('テスト投稿2')).toBeInTheDocument()
    })
  })

  // POST-01-02: 投稿のないチャンネルの投稿一覧表示
  it('displays no posts message when no posts exist', async () => {
    render(
      <div className="grid gap-4">
        <p className="text-center text-muted-foreground">投稿がありません</p>
      </div>
    )
    
    await waitFor(() => {
      expect(screen.getByText('投稿がありません')).toBeInTheDocument()
    })
  })

  // POST-01-04: 投稿一覧の各投稿情報表示
  it('displays post details correctly', async () => {
    render(
      <div>
        {mockPosts.map(post => (
          <PostCard key={post.id} post={post} userId={undefined} />
        ))}
      </div>
    )
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー1')).toBeInTheDocument()
      const dateElements = screen.getAllByText(/約1年前/)
      expect(dateElements.length).toBeGreaterThan(0)
      expect(dateElements[0]).toBeInTheDocument()
      expect(screen.getByText('テスト投稿1')).toBeInTheDocument()
      expect(screen.getByText('テスト内容1')).toBeInTheDocument()
      const voteScores = screen.getAllByTestId('vote-score')
      expect(voteScores[0]).toHaveTextContent('10')
    })
  })
}) 