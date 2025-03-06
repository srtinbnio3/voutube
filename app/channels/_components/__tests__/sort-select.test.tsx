import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SortSelect } from '../sort-select'

describe('SortSelect', () => {
  // CHAN-05-01 & CHAN-06-01: ソート選択の表示
  it('renders sort options correctly', () => {
    const mockOnChange = vi.fn()
    render(<SortSelect value="post_count" onChange={mockOnChange} />)
    
    // セレクトボックスをクリックして開く
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    // オプションが表示されていることを確認（role="option"を使用）
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('投稿数順')
    expect(options[1]).toHaveTextContent('最新の投稿順')
  })

  // CHAN-05-01: 投稿数順ソートの選択
  it('selects post count sort option', () => {
    const mockOnChange = vi.fn()
    render(<SortSelect value="latest" onChange={mockOnChange} />)
    
    // セレクトボックスをクリックして開く
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    // 投稿数順オプションを選択
    const option = screen.getByRole('option', { name: '投稿数順' })
    fireEvent.click(option)
    
    // 選択時にonChangeが正しい値で呼ばれるか
    expect(mockOnChange).toHaveBeenCalledWith('post_count')
  })

  // CHAN-06-01: 最新投稿順ソートの選択
  it('selects latest post sort option', () => {
    const mockOnChange = vi.fn()
    render(<SortSelect value="post_count" onChange={mockOnChange} />)
    
    // セレクトボックスをクリックして開く
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    // 最新投稿順オプションを選択
    const option = screen.getByRole('option', { name: '最新の投稿順' })
    fireEvent.click(option)
    
    // 選択時にonChangeが正しい値で呼ばれるか
    expect(mockOnChange).toHaveBeenCalledWith('latest')
  })

  // ソート値の表示確認
  it('displays correct sort value', () => {
    const mockOnChange = vi.fn()
    render(<SortSelect value="post_count" onChange={mockOnChange} />)
    
    // 選択された値が表示されているか（comboboxのテキストコンテンツを確認）
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('投稿数順')
  })
}) 