import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PostForm } from '../post-form'

// Supabaseのモック
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: () => Promise.resolve({
        data: {
          session: {
            user: { id: 'test-user' }
          }
        }
      })
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'test-post' }, error: null })
        })
      })
    })
  })
}))

// useRouterのモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}))

describe('PostForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // POST-02-01: 有効なタイトルと内容で投稿作成
  it('creates post with valid title and content', async () => {
    render(<PostForm channelId="test-channel" />)
    
    fireEvent.click(screen.getByRole('button', { name: '新規投稿' }))
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規投稿' })).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByPlaceholderText('タイトル'), {
      target: { value: '有効なタイトル' }
    })
    fireEvent.change(screen.getByPlaceholderText('説明（10文字以上）'), {
      target: { value: '有効な内容です。これは10文字以上の説明文です。' }
    })
    fireEvent.click(screen.getByRole('button', { name: '投稿' }))
    
    await waitFor(() => {
      expect(screen.getByText('投稿中...')).toBeInTheDocument()
    })
  })

  // POST-02-02: 空のタイトルで投稿作成
  it('shows error for empty title', async () => {
    render(<PostForm channelId="test-channel" />)
    
    // モーダルを開く
    fireEvent.click(screen.getByRole('button', { name: '新規投稿' }))
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規投稿' })).toBeInTheDocument()
    })
    
    // 説明のみ入力
    fireEvent.change(screen.getByPlaceholderText('説明（10文字以上）'), {
      target: { value: '有効な内容です。これは10文字以上の説明文です。' }
    })

    // フォームを送信
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('タイトルは3文字以上で入力してください')).toBeInTheDocument()
    })
  })

  // POST-02-03: 空の内容で投稿作成
  it('shows error for empty content', async () => {
    render(<PostForm channelId="test-channel" />)
    
    // モーダルを開く
    fireEvent.click(screen.getByRole('button', { name: '新規投稿' }))
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規投稿' })).toBeInTheDocument()
    })
    
    // タイトルのみ入力
    fireEvent.change(screen.getByPlaceholderText('タイトル'), {
      target: { value: '有効なタイトル' }
    })

    // フォームを送信
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('説明は10文字以上で入力してください')).toBeInTheDocument()
    })
  })

  // POST-02-04: 文字数制限超過のタイトル
  it('shows error for title exceeding character limit', async () => {
    const longTitle = 'a'.repeat(101) // 101文字
    render(<PostForm channelId="test-channel" />)
    
    fireEvent.click(screen.getByRole('button', { name: '新規投稿' }))
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規投稿' })).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByPlaceholderText('タイトル'), {
      target: { value: longTitle }
    })
    fireEvent.change(screen.getByPlaceholderText('説明（10文字以上）'), {
      target: { value: '有効な内容です。これは10文字以上の説明文です。' }
    })
    fireEvent.click(screen.getByRole('button', { name: '投稿' }))
    
    await waitFor(() => {
      expect(screen.getByText('タイトルは100文字以内で入力してください')).toBeInTheDocument()
    })
  })

  // POST-02-07: フォーム送信中の二重投稿防止
  it('prevents double submission while form is submitting', async () => {
    render(<PostForm channelId="test-channel" />)
    
    fireEvent.click(screen.getByRole('button', { name: '新規投稿' }))
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規投稿' })).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByPlaceholderText('タイトル'), {
      target: { value: '有効なタイトル' }
    })
    fireEvent.change(screen.getByPlaceholderText('説明（10文字以上）'), {
      target: { value: '有効な内容です。これは10文字以上の説明文です。' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: '投稿' }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '投稿中...' })).toBeDisabled()
    })
  })
}) 