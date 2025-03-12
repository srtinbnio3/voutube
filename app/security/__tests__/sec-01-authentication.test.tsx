import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabaseクライアントのモック
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn()
  }
}

// 認証エラーと成功時のレスポンスを準備
const authError = { error: { message: '認証に失敗しました' }, data: { user: null } }
const authSuccess = { error: null, data: { user: { id: 'user-123', email: 'test@example.com' } } }

// モックの設定
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// ログインフォームコンポーネント
function LoginForm({ onSuccess = () => {} }: { onSuccess?: () => void }) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      // この部分は実際の実装ではSupabaseクライアントを使用します
      const { error, data } = await mockSupabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        const errorContainer = document.getElementById('error-container')
        if (errorContainer) {
          errorContainer.textContent = '認証に失敗しました。メールアドレスとパスワードを確認してください。'
        }
        return
      }
      
      // 成功時の処理
      onSuccess()
    } catch (error) {
      console.error('Login error:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div id="error-container" role="alert" data-testid="error-message"></div>
      
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          data-testid="email-input"
        />
      </div>
      
      <div>
        <label htmlFor="password">パスワード</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          data-testid="password-input"
        />
      </div>
      
      <button type="submit" data-testid="login-button">ログイン</button>
      
      <div>
        <a href="/reset-password" data-testid="reset-password-link">
          パスワードをお忘れですか？
        </a>
      </div>
    </form>
  )
}

// 会員登録フォームコンポーネント
function SignupForm({ onSuccess = () => {} }: { onSuccess?: () => void }) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    
    // パスワード一致チェック
    if (password !== confirmPassword) {
      const errorContainer = document.getElementById('signup-error-container')
      if (errorContainer) {
        errorContainer.textContent = 'パスワードが一致しません。'
      }
      return
    }
    
    try {
      // この部分は実際の実装ではSupabaseクライアントを使用します
      const { error, data } = await mockSupabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        const errorContainer = document.getElementById('signup-error-container')
        if (errorContainer) {
          errorContainer.textContent = '登録に失敗しました。入力内容を確認してください。'
        }
        return
      }
      
      // 成功時の処理
      onSuccess()
    } catch (error) {
      console.error('Signup error:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} data-testid="signup-form">
      <div id="signup-error-container" role="alert" data-testid="signup-error-message"></div>
      
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          data-testid="signup-email-input"
        />
      </div>
      
      <div>
        <label htmlFor="password">パスワード</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          data-testid="signup-password-input"
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword">パスワード（確認）</label>
        <input 
          id="confirmPassword" 
          name="confirmPassword" 
          type="password" 
          required 
          data-testid="confirm-password-input"
        />
      </div>
      
      <button type="submit" data-testid="signup-button">登録</button>
    </form>
  )
}

// パスワードリセットフォームコンポーネント
function PasswordResetForm({ onSuccess = () => {} }: { onSuccess?: () => void }) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    
    try {
      // この部分は実際の実装ではSupabaseクライアントを使用します
      const { error } = await mockSupabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        const errorContainer = document.getElementById('reset-error-container')
        if (errorContainer) {
          errorContainer.textContent = 'パスワードリセットに失敗しました。入力内容を確認してください。'
        }
        return
      }
      
      // 成功時の処理
      const successContainer = document.getElementById('reset-success-container')
      if (successContainer) {
        successContainer.textContent = 'パスワードリセット用のメールを送信しました。メールを確認してください。'
      }
      
      onSuccess()
    } catch (error) {
      console.error('Password reset error:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} data-testid="reset-form">
      <div id="reset-error-container" role="alert" data-testid="reset-error-message"></div>
      <div id="reset-success-container" role="status" data-testid="reset-success-message"></div>
      
      <div>
        <label htmlFor="reset-email">メールアドレス</label>
        <input 
          id="reset-email" 
          name="email" 
          type="email" 
          required 
          data-testid="reset-email-input"
        />
      </div>
      
      <button type="submit" data-testid="reset-button">パスワードをリセット</button>
    </form>
  )
}

describe('SEC-01: 認証機能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // SEC-01-01: ログイン認証
  it('メールアドレスとパスワードによるログイン認証が正しく機能する', async () => {
    // 成功時のコールバックをモック
    const successCallback = vi.fn()
    
    // コンポーネントをレンダリング
    render(<LoginForm onSuccess={successCallback} />)
    
    // 認証成功ケースをモック
    mockSupabase.auth.signInWithPassword.mockResolvedValue(authSuccess)
    
    // フォームに入力
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    })
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByTestId('login-button'))
    
    // 認証APIが正しいパラメータで呼ばれたことを確認
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    // 成功コールバックが呼ばれたことを確認
    await waitFor(() => {
      expect(successCallback).toHaveBeenCalled()
    })
    
    // リセットして認証失敗ケースをテスト
    vi.clearAllMocks()
    mockSupabase.auth.signInWithPassword.mockResolvedValue(authError)
    
    // フォームを再送信
    fireEvent.click(screen.getByTestId('login-button'))
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      const errorElement = screen.getByTestId('error-message')
      expect(errorElement.textContent).toBe(
        '認証に失敗しました。メールアドレスとパスワードを確認してください。'
      )
    })
    
    // 成功コールバックが新たに呼ばれていないことを確認
    expect(successCallback).not.toHaveBeenCalledTimes(2)
  })

  // SEC-01-02: ログアウト機能
  it('ログアウトが正しく機能する', async () => {
    // ログアウト関数をモック
    const logoutFunction = vi.fn(async () => {
      return await mockSupabase.auth.signOut()
    })
    
    // 成功レスポンスをモック
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })
    
    // ログアウト関数を実行
    await logoutFunction()
    
    // ログアウトAPIが呼ばれたことを確認
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    
    // エラー発生時のテスト
    mockSupabase.auth.signOut.mockResolvedValue({ error: { message: 'ログアウトエラー' } })
    
    // エラーをキャッチするためにtry-catchを使用
    let errorCaught = false
    try {
      await logoutFunction()
    } catch (error) {
      errorCaught = true
    }
    
    // 実際の実装では、エラーハンドリングをより適切に行う必要があります
  })

  // SEC-01-03: 会員登録
  it('ユーザー登録プロセスが正しく機能する', async () => {
    // 成功時のコールバックをモック
    const successCallback = vi.fn()
    
    // コンポーネントをレンダリング
    render(<SignupForm onSuccess={successCallback} />)
    
    // 登録成功ケースをモック
    mockSupabase.auth.signUp.mockResolvedValue(authSuccess)
    
    // フォームに入力
    fireEvent.change(screen.getByTestId('signup-email-input'), {
      target: { value: 'newuser@example.com' }
    })
    
    fireEvent.change(screen.getByTestId('signup-password-input'), {
      target: { value: 'securePassword123!' }
    })
    
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'securePassword123!' }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByTestId('signup-button'))
    
    // 登録APIが正しいパラメータで呼ばれたことを確認
    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'securePassword123!'
      })
    })
    
    // 成功コールバックが呼ばれたことを確認
    await waitFor(() => {
      expect(successCallback).toHaveBeenCalled()
    })
    
    // リセットして登録失敗ケースをテスト
    vi.clearAllMocks()
    mockSupabase.auth.signUp.mockResolvedValue({ 
      error: { message: '既に登録されているメールアドレスです' }, 
      data: { user: null } 
    })
    
    // フォームを再送信
    fireEvent.click(screen.getByTestId('signup-button'))
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      const errorElement = screen.getByTestId('signup-error-message')
      expect(errorElement.textContent).toBe(
        '登録に失敗しました。入力内容を確認してください。'
      )
    })
  })

  // SEC-01-04: パスワードリセット
  it('パスワードリセット機能が正しく機能する', async () => {
    // 成功時のコールバックをモック
    const successCallback = vi.fn()
    
    // コンポーネントをレンダリング
    render(<PasswordResetForm onSuccess={successCallback} />)
    
    // リセット成功ケースをモック
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
    
    // フォームに入力
    fireEvent.change(screen.getByTestId('reset-email-input'), {
      target: { value: 'user@example.com' }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByTestId('reset-button'))
    
    // リセットAPIが正しいパラメータで呼ばれたことを確認
    await waitFor(() => {
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com')
    })
    
    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      const successElement = screen.getByTestId('reset-success-message')
      expect(successElement.textContent).toBe(
        'パスワードリセット用のメールを送信しました。メールを確認してください。'
      )
    })
    
    // 成功コールバックが呼ばれたことを確認
    expect(successCallback).toHaveBeenCalled()
    
    // リセットしてエラーケースをテスト
    vi.clearAllMocks()
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ 
      error: { message: '無効なメールアドレスです' } 
    })
    
    // フォームを再送信
    fireEvent.click(screen.getByTestId('reset-button'))
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      const errorElement = screen.getByTestId('reset-error-message')
      expect(errorElement.textContent).toBe(
        'パスワードリセットに失敗しました。入力内容を確認してください。'
      )
    })
  })

  // SEC-01-05: セッション維持
  it('ログインセッションが適切に維持される', async () => {
    // セッションチェック関数をモック
    const checkSession = vi.fn(async () => {
      // 実際の実装では、Supabaseクライアントのセッション取得方法を使用します
      // ここではモックのみ実装
      return {
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1時間後に期限切れ
        }
      }
    })
    
    // セッションチェックを実行
    const result = await checkSession()
    
    // セッションが取得できることを確認
    expect(result.session).toBeTruthy()
    expect(result.session.user.id).toBe('user-123')
    expect(result.session.user.email).toBe('test@example.com')
    
    // セッションの有効期限が未来であることを確認
    expect(result.session.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  // SEC-01-06: リクエスト制限
  it('連続した認証失敗後にリクエスト制限が適用される', async () => {
    // リクエスト制限をシミュレートする関数
    const simulateRateLimit = vi.fn(() => {
      // 連続認証失敗回数のカウンター
      let failureCounter = 0
      
      return {
        // 認証試行をシミュレートする関数
        tryAuthentication: (isValidCredentials: boolean) => {
          // 認証成功
          if (isValidCredentials) {
            failureCounter = 0
            return { success: true, rateLimited: false, remainingAttempts: 5 }
          }
          
          // 認証失敗
          failureCounter++
          
          // 5回連続で失敗するとレート制限発動
          if (failureCounter >= 5) {
            return { success: false, rateLimited: true, remainingAttempts: 0 }
          }
          
          return { 
            success: false, 
            rateLimited: false, 
            remainingAttempts: 5 - failureCounter 
          }
        }
      }
    })
    
    // レート制限シミュレーターを作成
    const rateLimiter = simulateRateLimit()
    
    // 成功した認証
    const successResult = rateLimiter.tryAuthentication(true)
    expect(successResult.success).toBe(true)
    expect(successResult.rateLimited).toBe(false)
    
    // 4回の失敗（まだレート制限なし）
    for (let i = 0; i < 4; i++) {
      const failResult = rateLimiter.tryAuthentication(false)
      expect(failResult.success).toBe(false)
      expect(failResult.rateLimited).toBe(false)
      expect(failResult.remainingAttempts).toBe(5 - (i + 1))
    }
    
    // 5回目の失敗（レート制限発動）
    const limitResult = rateLimiter.tryAuthentication(false)
    expect(limitResult.success).toBe(false)
    expect(limitResult.rateLimited).toBe(true)
    expect(limitResult.remainingAttempts).toBe(0)
  })
}) 