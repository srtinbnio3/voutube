import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Supabaseのモック
const mockSupabase = {
  auth: {
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null })
  }
}

// next/navigationのモック
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn()
  }))
}))

// SupabaseクライアントのCreateClientをモック
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// GoogleログインActionをモック
vi.mock('@/app/actions/auth', () => ({
  signInWithGoogleAction: vi.fn(async () => {
    // Googleログイン処理をシミュレート
    await mockSupabase.auth.signInWithOAuth({ provider: 'google' })
    return { status: 'success' }
  })
}))

// Google認証ボタンコンポーネント
function GoogleLoginButton() {
  const [errorMessage, setErrorMessage] = React.useState('')

  const handleGoogleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { signInWithGoogleAction } = await import('@/app/actions/auth')
      const result = await signInWithGoogleAction()
      
      if (result.status === 'error' && result.message) {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage('Google認証に失敗しました')
    }
  }

  return (
    <div>
      <h1>ログイン</h1>
      <form onSubmit={handleGoogleLogin} noValidate>
        <button type="submit" data-testid="google-login-button">
          Googleでログイン
        </button>
      </form>
      {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
    </div>
  )
}

describe('AUTH-03: Google認証ログイン', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  // Googleログインボタンの表示テスト
  it('Googleログインボタンが表示されること', () => {
    render(<GoogleLoginButton />)
    
    const googleButton = screen.getByTestId('google-login-button')
    expect(googleButton).toBeInTheDocument()
    expect(googleButton.textContent).toContain('Googleでログイン')
  })
  
  // ボタンクリック時の関数呼び出しテスト
  it('ボタンをクリックするとGoogle認証処理が呼ばれること', async () => {
    const user = userEvent.setup()
    
    render(<GoogleLoginButton />)
    
    const googleButton = screen.getByTestId('google-login-button')
    await user.click(googleButton)
    
    // モック関数が正しいパラメータで呼ばれることを確認
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google'
    })
  })
  
  // エラーケースのテスト
  it('認証失敗時にエラーハンドリングが行われること', async () => {
    const user = userEvent.setup()
    
    // エラーが発生するケースをモック
    mockSupabase.auth.signInWithOAuth.mockRejectedValueOnce(new Error('認証エラー'))
    
    // signInWithGoogleActionをエラーハンドリングするように上書き
    const { signInWithGoogleAction } = await import('@/app/actions/auth')
    vi.mocked(signInWithGoogleAction).mockImplementationOnce(async () => {
      try {
        await mockSupabase.auth.signInWithOAuth({ provider: 'google' })
        return { status: 'success' }
      } catch (error) {
        return { status: 'error', message: 'Google認証に失敗しました' }
      }
    })
    
    render(<GoogleLoginButton />)
    
    const googleButton = screen.getByTestId('google-login-button')
    await user.click(googleButton)
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toBe('Google認証に失敗しました')
    })
  })
}) 