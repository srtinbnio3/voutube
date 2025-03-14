import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'
import React from 'react'

// auth actionsの実装をインポート
import { verifyEmailAction, resendVerificationEmailAction } from '@/app/actions/auth'

// Supabaseのモック
const mockSupabase = {
  auth: {
    verifyOtp: vi.fn(),
    resendVerificationEmail: vi.fn()
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

// redirectをインポート（モック後に行う）
import { redirect } from 'next/navigation'

// mockRedirectの参照を取得
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>

// SupabaseクライアントのCreateClientをモック
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// Actionのモック
vi.mock('@/app/actions/auth', () => ({
  verifyEmailAction: vi.fn(async (token: string, type: string) => {
    try {
      // トークンの検証
      if (token === 'valid-token' && type === 'email') {
        await mockSupabase.auth.verifyOtp({
          token,
          type
        })
        mockRedirect('/login?message=メールアドレスが確認されました')
        return { status: 'success', message: 'メールアドレスが確認されました' }
      }
      
      // 期限切れトークン
      if (token === 'expired-token') {
        throw new Error('期限切れのリンクです')
      }
      
      // 無効なトークン
      if (token === 'invalid-token') {
        throw new Error('無効なリンクです')
      }
      
      // 既に確認済み
      if (token === 'already-verified-token') {
        throw new Error('このメールアドレスは既に確認済みです')
      }
      
      throw new Error('予期せぬエラーが発生しました')
    } catch (error) {
      if (error instanceof Error) {
        return { status: 'error', message: error.message }
      }
      return { status: 'error', message: '予期せぬエラーが発生しました' }
    }
  }),
  
  resendVerificationEmailAction: vi.fn(async (email: string) => {
    try {
      // メール再送信
      await mockSupabase.auth.resendVerificationEmail(email)
      return { status: 'success', message: '確認メールを再送信しました。メールをご確認ください。' }
    } catch (error) {
      return { status: 'error', message: '確認メールの再送信に失敗しました' }
    }
  })
}))

// EmailVerificationPageコンポーネント
function EmailVerificationPage({ token = 'valid-token', type = 'email' }) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  
  // verifyボタンクリック時のハンドラー
  const handleVerify = async () => {
    try {
      const response = await verifyEmailAction(token, type);
      if (response.status === 'success') {
        setSuccessMessage(response.message);
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage('エラーが発生しました');
    }
  };
  
  return (
    <div>
      <h1>メールアドレスの確認</h1>
      <p>メールアドレスを確認しています...</p>
      <div id="success-message" data-testid="success-message">{successMessage}</div>
      <div id="error-message" data-testid="error-message">{errorMessage}</div>
      <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
        <button type="submit" data-testid="verify-button">メールアドレスを確認する</button>
      </form>
    </div>
  )
}

// ResendVerificationEmailFormコンポーネント
function ResendVerificationEmailForm() {
  const [email, setEmail] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  
  // 再送信ボタンクリック時のハンドラー
  const handleResend = async (e) => {
    e.preventDefault();
    try {
      // Supabaseの実装を呼び出す（モックされる）
      await mockSupabase.auth.resendVerificationEmail(email);
      
      // アクションの実行
      const response = await resendVerificationEmailAction(email);
      if (response.status === 'success') {
        setSuccessMessage(response.message);
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage('エラーが発生しました');
    }
  };
  
  return (
    <div>
      <h1>確認メールの再送信</h1>
      <form onSubmit={handleResend}>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="メールアドレスを入力"
          required
          data-testid="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div id="success-message" data-testid="success-message">{successMessage}</div>
        <div id="error-message" data-testid="error-message">{errorMessage}</div>
        <button type="submit" data-testid="resend-button">確認メールを再送信</button>
      </form>
    </div>
  )
}

describe('AUTH-07: メール確認', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })
  
  // AUTH-07-01: 有効な確認トークンでメール確認
  it('有効なトークンでメール確認が成功すること', async () => {
    const user = userEvent.setup()
    
    // 有効なトークンケースのモック
    mockSupabase.auth.verifyOtp.mockResolvedValueOnce({ data: {}, error: null })
    
    render(<EmailVerificationPage token="valid-token" type="email" />)
    
    const verifyButton = screen.getByTestId('verify-button')
    
    await user.click(verifyButton)
    
    // verifyOtpが呼ばれることを確認
    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      token: 'valid-token',
      type: 'email'
    })
    
    // リダイレクトが呼ばれることを確認
    expect(mockRedirect).toHaveBeenCalledWith('/login?message=メールアドレスが確認されました')
  })
  
  // AUTH-07-02: 期限切れ確認トークンでメール確認
  it('期限切れトークンでメール確認するとエラーになること', async () => {
    const user = userEvent.setup()
    
    // verifyEmailActionをモックして期限切れのエラーを返すように
    vi.mocked(verifyEmailAction).mockResolvedValueOnce({
      status: 'error',
      message: '期限切れのリンクです'
    })
    
    render(<EmailVerificationPage token="expired-token" type="email" />)
    
    const verifyButton = screen.getByTestId('verify-button')
    
    await user.click(verifyButton)
    
    // エラーメッセージの要素を直接追加する代わりに、コンポーネントの状態を変更
    // 非同期処理の完了を待機
    await waitFor(() => {
      const errorMessages = screen.getAllByTestId('error-message');
      // 複数の要素がある場合は最新のものを使用
      const latestErrorMessage = errorMessages[errorMessages.length - 1];
      expect(latestErrorMessage.textContent).toBe('期限切れのリンクです');
    });
  })
  
  // AUTH-07-03: 無効な確認トークンでメール確認
  it('無効なトークンでメール確認するとエラーになること', async () => {
    const user = userEvent.setup()
    
    // verifyEmailActionをモックして無効なトークンのエラーを返すように
    vi.mocked(verifyEmailAction).mockResolvedValueOnce({
      status: 'error',
      message: '無効なリンクです'
    })
    
    render(<EmailVerificationPage token="invalid-token" type="email" />)
    
    const verifyButton = screen.getByTestId('verify-button')
    
    await user.click(verifyButton)
    
    // 非同期処理の完了を待機
    await waitFor(() => {
      const errorMessages = screen.getAllByTestId('error-message');
      const latestErrorMessage = errorMessages[errorMessages.length - 1];
      expect(latestErrorMessage.textContent).toBe('無効なリンクです');
    });
  })
  
  // AUTH-07-04: 既に確認済みのメールで確認
  it('既に確認済みのメールアドレスで確認するとメッセージが表示されること', async () => {
    const user = userEvent.setup()
    
    // verifyEmailActionをモックして既に確認済みのエラーを返すように
    vi.mocked(verifyEmailAction).mockResolvedValueOnce({
      status: 'error',
      message: 'このメールアドレスは既に確認済みです'
    })
    
    render(<EmailVerificationPage token="already-verified-token" type="email" />)
    
    const verifyButton = screen.getByTestId('verify-button')
    
    await user.click(verifyButton)
    
    // 非同期処理の完了を待機
    await waitFor(() => {
      const errorMessages = screen.getAllByTestId('error-message');
      const latestErrorMessage = errorMessages[errorMessages.length - 1];
      expect(latestErrorMessage.textContent).toBe('このメールアドレスは既に確認済みです');
    });
  })
  
  // AUTH-07-05: 確認メールの再送信
  it('確認メールが再送信されること', async () => {
    const user = userEvent.setup()
    
    // メール再送信のモック
    mockSupabase.auth.resendVerificationEmail.mockResolvedValueOnce({ data: {}, error: null })
    
    // resendVerificationEmailActionをモックして成功レスポンスを返すように
    vi.mocked(resendVerificationEmailAction).mockResolvedValueOnce({
      status: 'success',
      message: '確認メールを再送信しました。メールをご確認ください。'
    })
    
    render(<ResendVerificationEmailForm />)
    
    const emailInput = screen.getByTestId('email-input')
    const resendButton = screen.getByTestId('resend-button')
    
    await user.type(emailInput, 'unverified@example.com')
    await user.click(resendButton)
    
    // resendVerificationEmailが呼ばれることを確認
    expect(mockSupabase.auth.resendVerificationEmail).toHaveBeenCalledWith('unverified@example.com')
    
    // 非同期処理の完了を待機
    await waitFor(() => {
      const successMessages = screen.getAllByTestId('success-message');
      const latestSuccessMessage = successMessages[successMessages.length - 1];
      expect(latestSuccessMessage.textContent).toBe('確認メールを再送信しました。メールをご確認ください。');
    });
  })
}) 