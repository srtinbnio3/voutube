import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChannelInfo } from '../channel-info'
import { Database } from '@/database.types'

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
  // CHAN-02-01: 有効なチャンネルIDでの詳細表示
  it('renders channel details correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    // チャンネル情報グループの存在確認
    expect(screen.getByRole('group', { name: 'チャンネル情報' })).toBeInTheDocument()
    
    // チャンネル名の確認
    expect(screen.getByRole('heading', { name: mockChannel.name })).toBeInTheDocument()
    
    // チャンネル説明の確認
    expect(screen.getByText(mockChannel.description!)).toBeInTheDocument()
    
    // 投稿数の確認
    expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
  })

  // CHAN-02-03: チャンネル情報の表示内容確認
  it('displays all channel information correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    // アバター画像の確認
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
    
    // チャンネル詳細グループの確認
    const detailsGroup = screen.getByRole('group', { name: 'チャンネル詳細' })
    expect(detailsGroup).toBeInTheDocument()
  })

  // CHAN-02-04: レスポンシブ表示のテスト
  it('applies responsive classes correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    // チャンネル情報グループのレイアウトクラスを確認
    const container = screen.getByRole('group', { name: 'チャンネル情報' })
    expect(container).toHaveClass('flex', 'items-center', 'gap-4')
  })

  // 説明文がない場合のフォールバックテスト
  it('shows fallback text when description is missing', () => {
    const channelWithoutDesc = {
      ...mockChannel,
      description: null
    }
    render(<ChannelInfo channel={channelWithoutDesc} />)
    
    expect(screen.getByText('説明はありません')).toBeInTheDocument()
  })

  // CHAN-02-02: 存在しないチャンネルIDでの詳細表示
  it('handles non-existent channel gracefully', () => {
    const invalidChannel: Channel = {
      ...mockChannel,
      name: 'Not Found Channel',
      description: null,
      icon_url: null,
      post_count: 0,
      latest_post_at: null
    }
    
    render(<ChannelInfo channel={invalidChannel} />)
    
    expect(screen.getByText('Not Found Channel')).toBeInTheDocument()
    expect(screen.getByText('説明はありません')).toBeInTheDocument()
    expect(screen.getByText('投稿数: 0')).toBeInTheDocument()
  })

  // CHAN-02-05: YouTubeチャンネルへのリンク
  it('renders YouTube channel link correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    const youtubeLink = screen.getByRole('link', { name: /YouTubeチャンネルを開く/i })
    expect(youtubeLink).toHaveAttribute(
      'href',
      `https://www.youtube.com/channel/${mockChannel.youtube_channel_id}`
    )
    expect(youtubeLink).toHaveAttribute('target', '_blank')
    expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  // CHAN-04-01: 投稿のあるチャンネルの統計表示
  it('displays channel statistics correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
    expect(screen.getByText(/登録者数: 1,000/)).toBeInTheDocument()
  })

  // CHAN-04-02: 投稿のないチャンネルの統計表示
  it('displays statistics for channel without posts', () => {
    const channelWithoutPosts = {
      ...mockChannel,
      post_count: 0,
      latest_post_at: null
    }
    render(<ChannelInfo channel={channelWithoutPosts} />)
    
    expect(screen.getByText('投稿数: 0')).toBeInTheDocument()
  })

  // CHAN-04-03: 統計情報の更新確認
  it('updates statistics when props change', () => {
    const { rerender } = render(<ChannelInfo channel={mockChannel} />)
    
    // 初期表示の確認
    expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
    
    // 更新されたチャンネル情報でコンポーネントを再レンダリング
    const updatedChannel = {
      ...mockChannel,
      post_count: 10
    }
    rerender(<ChannelInfo channel={updatedChannel} />)
    
    // 更新後の表示を確認
    expect(screen.getByText('投稿数: 10')).toBeInTheDocument()
  })
}) 