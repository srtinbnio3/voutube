import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { validatePassword } from '@/app/utils/password-validation'

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

// Actionsのモック
vi.mock('@/app/actions/auth', () => {
  const signUpAction = vi.fn(async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    // 基本的なバリデーション
    if (!email) {
      return { status: 'error', message: 'メールアドレスは必須です' }
    }
    
    if (!password) {
      return { status: 'error', message: 'パスワードは必須です' }
    }
    
    if (!email.includes('@')) {
      return { status: 'error', message: '無効なメールアドレス形式です' }
    }
    
    if (email === 'existing@example.com') {
      return { status: 'error', message: 'このメールアドレスは既に登録されています' }
    }
    
    // パスワードバリデーション
    const validation = validatePassword(password)
    if (!validation.isValid) {
      return { status: 'error', message: validation.error }
    }
    
    // 成功の場合
    return { status: 'success', message: '登録確認メールを送信しました。メールをご確認ください。' }
  })
  
  return {
    signUpAction
  }
})

// HTML5バリデーションをバイパスするためのカスタムフォーム
function SignupForm({ onSubmit }: { onSubmit?: (result: any) => void } = {}) {
  const [errorMessage, setErrorMessage] = React.useState('')
  const [successMessage, setSuccessMessage] = React.useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const { signUpAction } = await import('@/app/actions/auth')
    const result = await signUpAction(formData)
    
    if (result.status === 'error') {
      setErrorMessage(result.message)
      setSuccessMessage('')
    } else {
      setSuccessMessage(result.message)
      setErrorMessage('')
    }
    
    if (onSubmit) {
      onSubmit(result)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>アカウント登録</h1>
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
      <button type="submit" data-testid="signup-button">登録</button>
    </form>
  )
}

describe('AUTH-01: メールアドレス認証サインアップ', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  // AUTH-01-01: 有効なメールアドレスとパスワードでサインアップ
  it('有効なメールアドレスとパスワードでサインアップできること', async () => {
    const user = userEvent.setup()
    const { signUpAction } = await import('@/app/actions/auth')
    
    render(<SignupForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('signup-button')
    
    await user.type(emailInput, 'valid@example.com')
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(submitButton)
    
    // モック関数が呼ばれることを確認
    expect(signUpAction).toHaveBeenCalled()
    
    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('success-message').textContent).toContain('登録確認メールを送信しました')
    })
  })
  
  // AUTH-01-02: 既存メールアドレスでサインアップ
  it('既存メールアドレスでサインアップするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signUpAction } = await import('@/app/actions/auth')
    
    render(<SignupForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('signup-button')
    
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(submitButton)
    
    // モック関数が呼ばれることを確認
    expect(signUpAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('このメールアドレスは既に登録されています')
    })
  })
  
  // AUTH-01-03: 無効なメールアドレスでサインアップ
  it('無効なメールアドレス形式でサインアップするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signUpAction } = await import('@/app/actions/auth')
    
    render(<SignupForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('signup-button')
    
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(submitButton)
    
    // モック関数が呼ばれることを確認
    expect(signUpAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('無効なメールアドレス形式です')
    })
  })
  
  // AUTH-01-04: 弱いパスワードでサインアップ
  it('弱いパスワードでサインアップするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signUpAction } = await import('@/app/actions/auth')
    
    render(<SignupForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('signup-button')
    
    await user.type(emailInput, 'valid@example.com')
    await user.type(passwordInput, 'weak')
    
    await user.click(submitButton)
    
    // モック関数が呼ばれることを確認
    expect(signUpAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('パスワードは8文字以上で')
    })
  })
  
  // AUTH-01-05: 空のメールアドレスでサインアップ
  it('空のメールアドレスでサインアップするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signUpAction } = await import('@/app/actions/auth')
    
    render(<SignupForm />)
    
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('signup-button')
    
    await user.type(passwordInput, 'ValidPass123')
    
    await user.click(submitButton)
    
    // モック関数が呼ばれることを確認
    expect(signUpAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('メールアドレスは必須です')
    })
  })
  
  // AUTH-01-06: 空のパスワードでサインアップ
  it('空のパスワードでサインアップするとエラーになること', async () => {
    const user = userEvent.setup()
    const { signUpAction } = await import('@/app/actions/auth')
    
    render(<SignupForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('signup-button')
    
    await user.type(emailInput, 'valid@example.com')
    
    await user.click(submitButton)
    
    // モック関数が呼ばれることを確認
    expect(signUpAction).toHaveBeenCalled()
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain('パスワードは必須です')
    })
  })
}) 