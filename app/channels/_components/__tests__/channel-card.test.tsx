import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChannelCard } from '../channel-card'
import { Database } from '@/database.types'

// date-fnsをモック
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '3日前'
}))

// モックデータ - 実際のデータベース型に合わせる
type Channel = Database['public']['Tables']['channels']['Row']

const mockChannel: Channel = {
  id: '1',
  youtube_channel_id: 'UC1234567890',
  name: 'チャンネルA',
  description: 'テストチャンネルの説明',
  icon_url: 'https://example.com/thumbnail.jpg',
  subscriber_count: 1000,
  post_count: 5,
  latest_post_at: '2024-03-10T10:00:00Z',
  created_at: '2024-03-01T10:00:00Z',
  updated_at: '2024-03-10T10:00:00Z'
}

describe('ChannelCard', () => {
  // CHAN-01-04: 一覧の各チャンネル情報表示
  it('renders channel card correctly', () => {
    render(<ChannelCard channel={mockChannel} />)
    
    // チャンネル名の確認
    expect(screen.getByText(mockChannel.name)).toBeInTheDocument()
    
    // 投稿数の確認（部分一致）
    const statsText = screen.getByText(/投稿数:.*登録者数:/)
    expect(statsText).toHaveTextContent(`投稿数: ${mockChannel.post_count}`)
    
    // チャンネル説明の確認
    expect(screen.getByText(mockChannel.description!)).toBeInTheDocument()
    
    // 最終投稿日時の確認（モック版）
    expect(screen.getByText(/最終投稿: 3日前/)).toBeInTheDocument()
  })

  // チャンネル説明なしのケース
  it('handles missing description', () => {
    const channelWithoutDesc = {
      ...mockChannel,
      description: null
    }
    
    render(<ChannelCard channel={channelWithoutDesc} />)
    expect(screen.getByText('説明はありません')).toBeInTheDocument()
  })

  // アイコンがない場合のフォールバック
  it('renders fallback avatar when icon_url is null', async () => {
    const channelWithoutIcon = {
      ...mockChannel,
      icon_url: null
    }
    
    render(<ChannelCard channel={channelWithoutIcon} />)
    
    // アバターフォールバックが表示されていることを確認
    const fallback = await screen.findByText(/^(CH|チャ)$/)
    expect(fallback).toBeInTheDocument()
  })

  // 最新投稿がないケース
  it('does not show latest post date when it is null', () => {
    const channelWithoutLatestPost = {
      ...mockChannel,
      latest_post_at: null
    }
    
    render(<ChannelCard channel={channelWithoutLatestPost} />)
    expect(screen.queryByText(/最終投稿:/)).not.toBeInTheDocument()
  })

  // リンク先の確認
  it('links to the correct channel detail page', () => {
    render(<ChannelCard channel={mockChannel} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/channels/${mockChannel.id}`)
  })
}) 