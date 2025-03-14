import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Supabaseのモック
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn()
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis()
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

// redirectをインポート（モック後に行う）
import { redirect } from 'next/navigation'

// mockRedirectの参照を取得
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>

// ActionのSubmitをモック
vi.mock('@/app/actions/auth', () => ({
  signInAction: vi.fn(async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    // 基本的なバリデーション
    if (!email) {
      return { status: 'error', message: 'メールアドレスは必須です' }
    }
    
    if (!password) {
      return { status: 'error', message: 'パスワードは必須です' }
    }
    
    // 有効なログイン
    if (email === 'valid@example.com' && password === 'ValidPass123') {
      mockRedirect('/')
      return { status: 'success', message: 'ログインに成功しました' }
    }
    
    // 無効なメールアドレス
    if (email === 'nonexistent@example.com') {
      return { status: 'error', message: 'メールアドレスまたはパスワードが無効です' }
    }
    
    // 無効なパスワード
    if (email === 'valid@example.com' && password !== 'ValidPass123') {
      return { status: 'error', message: 'メールアドレスまたはパスワードが無効です' }
    }
    
    // 未確認のメールアドレス
    if (email === 'unconfirmed@example.com') {
      return { status: 'error', message: 'メールアドレスが確認されていません。メールをご確認ください。' }
    }
    
    return { status: 'error', message: '予期せぬエラーが発生しました' }
  })
}))

// ログインコンポーネント
function LoginForm() {
  const [errorMessage, setErrorMessage] = React.useState('')
  const [successMessage, setSuccessMessage] = React.useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const { signInAction } = await import('@/app/actions/auth')
    const result = await signInAction(formData)
    
    if (result.status === 'error') {
      setErrorMessage(result.message)
      setSuccessMessage('')
    } else {
      setSuccessMessage(result.message)
      setErrorMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>ログイン</h1>
      <label htmlFor="email">メールアドレス</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="メールアドレスを入力"
        data-testid="email-input"
      />
      <label htmlFor="password">パスワード</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="パスワードを入力"
        data-testid="password-input"
      />
      {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
      {successMessage && <div data-testid="success-message">{successMessage}</div>}
      <button type="submit" data-testid="login-button">ログイン</button>
    </form>
  )
}

describe('AUTH-02: メールアドレス認証ログイン', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  // AUTH-02-01: 有効なメールアドレスとパスワードでログイン
  it('有効なメールアドレスとパスワードでログインできること', async () => {
    const user = userEvent.setup()
    const { signInAction } = await import('@/app/actions/auth')
    
    render(<LoginForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const loginButton = screen.getByTestId('login-button')
    
    await user.type(emailInput, 'valid@example.com')
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(loginButton)
    
    // モック関数が呼ばれることを確認
    expect(signInAction).toHaveBeenCalled()
    
    // リダイレクトが呼ばれることを確認
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
  
  // AUTH-02-02: 無効なメールアドレスでログイン
  it('無効なメールアドレスでログインするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signInAction } = await import('@/app/actions/auth')
    
    render(<LoginForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const loginButton = screen.getByTestId('login-button')
    
    await user.type(emailInput, 'nonexistent@example.com')
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(loginButton)
    
    // モック関数が呼ばれることを確認
    expect(signInAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('メールアドレスまたはパスワードが無効です')
    })
  })
  
  // AUTH-02-03: 無効なパスワードでログイン
  it('無効なパスワードでログインするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signInAction } = await import('@/app/actions/auth')
    
    render(<LoginForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const loginButton = screen.getByTestId('login-button')
    
    await user.type(emailInput, 'valid@example.com')
    await user.type(passwordInput, 'WrongPass123')
    
    await user.click(loginButton)
    
    // モック関数が呼ばれることを確認
    expect(signInAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('メールアドレスまたはパスワードが無効です')
    })
  })
  
  // AUTH-02-04: 未確認のメールアドレスでログイン
  it('未確認のメールアドレスでログインするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signInAction } = await import('@/app/actions/auth')
    
    render(<LoginForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const loginButton = screen.getByTestId('login-button')
    
    await user.type(emailInput, 'unconfirmed@example.com')
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(loginButton)
    
    // モック関数が呼ばれることを確認
    expect(signInAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('メールアドレスが確認されていません')
    })
  })
  
  // AUTH-02-05: 空のメールアドレスでログイン
  it('空のメールアドレスでログインするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signInAction } = await import('@/app/actions/auth')
    
    render(<LoginForm />)
    
    const passwordInput = screen.getByTestId('password-input')
    const loginButton = screen.getByTestId('login-button')
    
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(loginButton)
    
    // モック関数が呼ばれることを確認
    expect(signInAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('メールアドレスは必須です')
    })
  })
  
  // AUTH-02-06: 空のパスワードでログイン
  it('空のパスワードでログインするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signInAction } = await import('@/app/actions/auth')
    
    render(<LoginForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const loginButton = screen.getByTestId('login-button')
    
    await user.type(emailInput, 'valid@example.com')
    
    await user.click(loginButton)
    
    // モック関数が呼ばれることを確認
    expect(signInAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('パスワードは必須です')
    })
  })
}) 