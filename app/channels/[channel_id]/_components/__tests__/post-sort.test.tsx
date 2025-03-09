import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PostSort } from '../post-sort'
import { useRouter, useSearchParams } from 'next/navigation'

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

const mockSearchParams = {
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  forEach: vi.fn(),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  toString: vi.fn()
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/channels/test-channel'
}))

describe('PostSort Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // scrollIntoViewのモックを追加
    Element.prototype.scrollIntoView = vi.fn()
  })

  // POST-03-01: 人気順ソートの選択
  it('displays sort options correctly', async () => {
    render(<PostSort currentSort="popular" />)
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
    
    fireEvent.click(trigger)
    
    await waitFor(() => {
      const popularOption = screen.getByRole('option', { name: '人気順' })
      const recentOption = screen.getByRole('option', { name: '新着順' })
      expect(popularOption).toBeInTheDocument()
      expect(recentOption).toBeInTheDocument()
    })
  })

  // POST-03-02: 人気順の選択
  it('selects popular sort option', async () => {
    render(<PostSort currentSort="recent" />)
    
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      const popularOption = screen.getByRole('option', { name: '人気順' })
      fireEvent.click(popularOption)
    })
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('?')
    })
  })

  // POST-03-03: 新着順の選択
  it('selects recent sort option', async () => {
    render(<PostSort currentSort="popular" />)
    
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    await waitFor(() => {
      const recentOption = screen.getByRole('option', { name: '新着順' })
      fireEvent.click(recentOption)
    })
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('?sort=recent')
    })
  })
}) 