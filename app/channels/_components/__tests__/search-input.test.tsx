import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from '../search-input'

// YouTubeのAPIレスポンスをモック
vi.mock('@/utils/youtube', () => ({
  getChannelInfo: vi.fn()
}))

describe('SearchInput', () => {
  // CHAN-03-04: 検索入力のテスト
  it('renders search input correctly', () => {
    const mockOnChange = vi.fn()
    render(<SearchInput value="" onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('チャンネルを検索')
    expect(input).toBeInTheDocument()
  })

  // CHAN-03-01: 検索入力と値の変更
  it('calls onChange when input value changes', () => {
    const mockOnChange = vi.fn()
    render(<SearchInput value="" onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('チャンネルを検索')
    fireEvent.change(input, { target: { value: 'テスト' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('テスト')
  })

  // CHAN-03-02: 初期値の表示
  it('displays initial value correctly', () => {
    const mockOnChange = vi.fn()
    render(<SearchInput value="初期値" onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('チャンネルを検索') as HTMLInputElement
    expect(input.value).toBe('初期値')
  })

  // CHAN-03-03: 無効なYouTubeチャンネルIDで検索
  it('handles invalid YouTube channel ID', async () => {
    const mockOnError = vi.fn()
    render(
      <SearchInput 
        value="invalid-id" 
        onChange={vi.fn()} 
        onError={mockOnError}
      />
    )
    
    const searchButton = screen.getByRole('button', { name: /検索/i })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('無効なチャンネルIDです')
    })
  })

  // CHAN-03-05: YouTube API制限時の検索
  it('handles YouTube API quota limit', async () => {
    const mockOnError = vi.fn()
    const { getChannelInfo } = await import('@/utils/youtube')
    vi.mocked(getChannelInfo).mockRejectedValueOnce(
      new Error('YouTube API quota exceeded')
    )

    render(
      <SearchInput 
        value="UC1234567890123456789012" 
        onChange={vi.fn()} 
        onError={mockOnError}
      />
    )
    
    const searchButton = screen.getByRole('button', { name: /検索/i })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'YouTube APIの制限に達しました。しばらく時間をおいて再度お試しください。'
      )
    })
  })
}) 