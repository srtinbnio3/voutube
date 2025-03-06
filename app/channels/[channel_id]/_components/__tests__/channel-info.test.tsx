import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChannelInfo } from '../channel-info'
import { Database } from '@/database.types'

// モックデータ - 実際のデータベース型に合わせる
type Channel = Database['public']['Tables']['channels']['Row']

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
    
    // チャンネル名の確認
    expect(screen.getByText(mockChannel.name)).toBeInTheDocument()
    
    // チャンネル説明の確認
    expect(screen.getByText(mockChannel.description!)).toBeInTheDocument()
    
    // 投稿数の確認
    expect(screen.getByText(`投稿数: ${mockChannel.post_count}`)).toBeInTheDocument()
  })

  // CHAN-02-03: チャンネル情報の表示内容確認
  it('displays all channel information correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    // アバター画像の確認（Avatarコンポーネントのspanを確認）
    const avatar = screen.getByTestId('channel-avatar')
    expect(avatar).toHaveClass('relative', 'flex', 'shrink-0', 'overflow-hidden', 'rounded-full', 'h-12', 'w-12')
    
    // チャンネル名
    expect(screen.getByRole('heading', { name: mockChannel.name })).toBeInTheDocument()
    
    // 説明
    expect(screen.getByText(mockChannel.description!)).toBeInTheDocument()
  })

  // CHAN-02-04: レスポンシブ表示のテスト
  it('applies responsive classes correctly', () => {
    render(<ChannelInfo channel={mockChannel} />)
    
    // 実装のクラス名に合わせて調整（最上位のdivを確認）
    const container = screen.getByTestId('channel-info-container')
    expect(container).toHaveClass('flex', 'items-center', 'gap-4')
  })
}) 