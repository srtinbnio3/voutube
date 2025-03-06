import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from '../search-input'

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
}) 