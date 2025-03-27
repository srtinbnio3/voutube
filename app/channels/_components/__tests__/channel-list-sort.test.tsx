import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChannelList } from '../channel-list'
import { Database } from '@/database.types'

// モックデータ - 実際のデータベース型に合わせる
type Channel = Database['public']['Tables']['channels']['Row']

const mockChannels: Channel[] = [
  {
    id: '1',
    youtube_channel_id: 'UC1234567890',
    name: 'チャンネルA',
    description: 'テストチャンネルの説明1',
    icon_url: 'https://example.com/thumbnail1.jpg',
    subscriber_count: 1000,
    post_count: 5,
    latest_post_at: '2024-03-10T10:00:00Z',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    youtube_channel_id: 'UC0987654321',
    name: 'チャンネルB',
    description: 'テストチャンネルの説明2',
    icon_url: 'https://example.com/thumbnail2.jpg',
    subscriber_count: 2000,
    post_count: 3,
    latest_post_at: '2024-03-11T10:00:00Z', // チャンネルB が最新
    created_at: '2024-03-02T10:00:00Z',
    updated_at: '2024-03-09T10:00:00Z'
  },
  {
    id: '3',
    youtube_channel_id: 'UC5555555555',
    name: 'チャンネルC',
    description: 'テストチャンネルの説明3',
    icon_url: null,
    subscriber_count: 500,
    post_count: 0,
    latest_post_at: null, // 投稿なし
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-05T10:00:00Z'
  }
]

describe('ChannelList Sorting', () => {
  // CHAN-05-01: 投稿数順ソートの選択
  it('sorts channels by post count by default', () => {
    render(<ChannelList initialChannels={mockChannels} />)
    
    // チャンネルカードの並び順をチェック
    const channelNames = screen.getAllByText(/チャンネル[A-C]/).map(el => el.textContent)
    
    // デフォルトでは投稿数順（A > B > C）
    expect(channelNames[0]).toBe('チャンネルA') // 5投稿
    expect(channelNames[1]).toBe('チャンネルB') // 3投稿
    expect(channelNames[2]).toBe('チャンネルC') // 0投稿
  })

  // CHAN-06-01: 最新投稿順ソートの選択
  it('sorts channels by latest post when selected', async () => {
    render(<ChannelList initialChannels={mockChannels} />)
    
    // ソートセレクトを開く
    const sortSelect = screen.getByRole('combobox')
    fireEvent.click(sortSelect)
    
    // 最新の投稿順を選択
    const latestOption = screen.getByText('最新の投稿順')
    fireEvent.click(latestOption)
    
    // ソート後の並び順をチェック
    const channelNames = screen.getAllByText(/チャンネル[A-C]/).map(el => el.textContent)
    
    // 最新投稿順（B > A > C）
    expect(channelNames[0]).toBe('チャンネルB') // 2024-03-11 が最新
    expect(channelNames[1]).toBe('チャンネルA') // 2024-03-10
    expect(channelNames[2]).toBe('チャンネルC') // 投稿なし
  })

  // CHAN-06-03: 投稿のないチャンネルのソート位置
  it('places channels without posts at the end', () => {
    render(<ChannelList initialChannels={mockChannels} />)
    
    // ソートセレクトを開く
    const sortSelect = screen.getByRole('combobox')
    fireEvent.click(sortSelect)
    
    // 最新の投稿順を選択
    const latestOption = screen.getByText('最新の投稿順')
    fireEvent.click(latestOption)
    
    // ソート後の並び順をチェック
    const channelNames = screen.getAllByText(/チャンネル[A-C]/).map(el => el.textContent)
    
    // 投稿のないチャンネルCが最後に表示されるか
    expect(channelNames[channelNames.length - 1]).toBe('チャンネルC')
  })

  // CHAN-03: 検索機能
  it.skip('検索機能が正しく動作する', () => {
    const searchInput = screen.getByPlaceholderText('チャンネルを検索...')
    fireEvent.change(searchInput, { target: { value: 'テスト' } })
    expect(screen.getByText('テストチャンネル')).toBeInTheDocument()
    expect(screen.queryByText('サンプルチャンネル')).not.toBeInTheDocument()
  })
}) 