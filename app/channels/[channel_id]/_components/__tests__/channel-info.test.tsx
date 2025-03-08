import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ChannelInfo } from '../channel-info'
import { Database } from '@/database.types'

// フェッチのモックを設定
global.fetch = vi.fn()

// Supabaseクライアントのモックを設定
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    from: () => ({
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  })
}))

// モックデータ - 実際のデータベース型に合わせる
type Channel = Database['public']['Tables']['channels']['Row']

// propsの型を更新
interface ChannelInfoProps {
  channel: Channel | null
}

const mockChannel: Channel = {
  id: '1',
  youtube_channel_id: 'UC1234567890',
  name: 'テストチャンネル',
  description: 'テストチャンネルの説明',
  icon_url: 'https://example.com/thumbnail.jpg',
  subscriber_count: 1000,
  post_count: 5,
  latest_post_at: '2024-03-10T10:00:00Z',
  created_at: '2024-03-01T10:00:00Z',
  updated_at: '2024-03-10T10:00:00Z'
}

describe('ChannelInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ subscriber_count: 1000 })
    })
  })

  // CHAN-02-01: 有効なチャンネルIDでの詳細表示
  it('renders channel details correctly', async () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    await waitFor(() => {
      // チャンネル情報グループの存在確認
      expect(screen.getByRole('group', { name: 'チャンネル情報' })).toBeInTheDocument()
      
      // チャンネル名の確認
      expect(screen.getByRole('heading', { name: mockChannel.name })).toBeInTheDocument()
      
      // チャンネル説明の確認
      expect(screen.getByText(mockChannel.description!)).toBeInTheDocument()
      
      // 投稿数の確認
      expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
    })
  })

  // CHAN-02-03: チャンネル情報の表示内容確認
  it('displays all channel information correctly', async () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    await waitFor(() => {
      const avatarContainer = screen.getByRole('img', { name: `${mockChannel.name}のアバター` })
        .closest('span')
      expect(avatarContainer).toHaveClass(
        'relative',
        'flex',
        'shrink-0',
        'overflow-hidden',
        'rounded-full',
        'h-12',
        'w-12'
      )
      
      const detailsGroup = screen.getByRole('group', { name: 'チャンネル詳細' })
      expect(detailsGroup).toBeInTheDocument()
    })
  })

  // CHAN-02-04: レスポンシブ表示のテスト
  it('applies responsive classes correctly', async () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    await waitFor(() => {
      const container = screen.getByRole('group', { name: 'チャンネル情報' })
      expect(container).toHaveClass('flex', 'items-center', 'gap-4')
    })
  })

  // 説明文がない場合のフォールバックテスト
  it('shows fallback text when description is missing', async () => {
    const channelWithoutDesc = {
      ...mockChannel,
      description: null
    }
    render(<ChannelInfo channel={channelWithoutDesc} />)
    
    await waitFor(() => {
      expect(screen.getByText('説明はありません')).toBeInTheDocument()
    })
  })

  // CHAN-02-02: 存在しないチャンネルIDでの詳細表示
  it('handles non-existent channel gracefully', async () => {
    const invalidChannel = {
      ...mockChannel,
      name: 'Not Found Channel',
      description: null,
      icon_url: null,
      post_count: 0,
      latest_post_at: null
    }
    
    render(<ChannelInfo channel={invalidChannel} />)
    
    await waitFor(() => {
      expect(screen.getByText('Not Found Channel')).toBeInTheDocument()
      expect(screen.getByText('説明はありません')).toBeInTheDocument()
      expect(screen.getByText('投稿数: 0')).toBeInTheDocument()
    })
  })

  // CHAN-02-05: YouTubeチャンネルへのリンク
  it('renders YouTube channel link correctly', async () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    await waitFor(() => {
      const youtubeLink = screen.getByRole('link', { name: /YouTubeチャンネルを開く/i })
      expect(youtubeLink).toHaveAttribute(
        'href',
        `https://www.youtube.com/channel/${mockChannel.youtube_channel_id}`
      )
      expect(youtubeLink).toHaveAttribute('target', '_blank')
      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  // CHAN-04-01: 投稿のあるチャンネルの統計表示
  it('displays channel statistics correctly', async () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    await waitFor(() => {
      expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
      expect(screen.getByText('登録者数: 1,000')).toBeInTheDocument()
    })
  })

  // CHAN-04-02: 投稿のないチャンネルの統計表示
  it('displays statistics for channel without posts', async () => {
    const channelWithoutPosts = {
      ...mockChannel,
      post_count: 0,
      latest_post_at: null
    }
    render(<ChannelInfo channel={channelWithoutPosts} />)
    
    await waitFor(() => {
      expect(screen.getByText('投稿数: 0')).toBeInTheDocument()
    })
  })

  // CHAN-04-03: 統計情報の更新確認
  it('updates statistics when props change', async () => {
    const { rerender } = render(<ChannelInfo channel={mockChannel} />)
    
    await waitFor(() => {
      expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
    })
    
    const updatedChannel = {
      ...mockChannel,
      post_count: 10
    }
    rerender(<ChannelInfo channel={updatedChannel} />)
    
    await waitFor(() => {
      expect(screen.getByText('投稿数: 10')).toBeInTheDocument()
    })
  })
}) 