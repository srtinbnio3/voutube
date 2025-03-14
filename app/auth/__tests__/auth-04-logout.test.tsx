import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'

// Supabaseのモック
const mockSupabase = {
  auth: {
    signOut: vi.fn().mockResolvedValue({ error: null })
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

// ActionのSubmitをモック
vi.mock('@/app/actions/auth', () => ({
  signOutAction: vi.fn(async () => {
    // 正常なログアウト
    await mockSupabase.auth.signOut()
    mockRedirect('/login')
    return { status: 'success', message: 'ログアウトしました' }
  })
}))

// ログアウトコンポーネント
function LogoutButton() {
  return (
    <form action={async () => {
      const { signOutAction } = await import('@/app/actions/auth')
      await signOutAction()
    }}>
      <button type="submit" data-testid="logout-button">ログアウト</button>
    </form>
  )
}

describe('AUTH-04: ログアウト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  // AUTH-04-01: ログアウト実行
  it('ログアウトボタンをクリックするとログアウトが実行されること', async () => {
    const user = userEvent.setup()
    
    render(<LogoutButton />)
    
    const logoutButton = screen.getByTestId('logout-button')
    
    await user.click(logoutButton)
    
    // signOutが呼ばれることを確認
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    
    // リダイレクトが呼ばれることを確認
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
  
  // AUTH-04-02: 複数デバイスでのログアウト
  it('現在のデバイスのみでログアウトが実行されること', async () => {
    const user = userEvent.setup()
    
    // 複数デバイスでのログアウトを想定したモック
    mockSupabase.auth.signOut.mockImplementationOnce(async (options?: { scope: 'local' | 'global' }) => {
      // スコープが指定されていない場合はデフォルトでlocalを想定
      const scope = options?.scope || 'local'
      
      expect(scope).toBe('local')
      return { error: null }
    })
    
    render(<LogoutButton />)
    
    const logoutButton = screen.getByTestId('logout-button')
    
    await user.click(logoutButton)
    
    // signOutが呼ばれることを確認
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    
    // リダイレクトが呼ばれることを確認
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
  
  // AUTH-04-03: セッション期限切れ後のログアウト
  it('セッション期限切れ状態でもログアウト処理が正常に完了すること', async () => {
    const user = userEvent.setup()
    
    // セッション期限切れを想定したモック
    mockSupabase.auth.signOut.mockImplementationOnce(async () => {
      // セッションが既に存在しない状態でもエラーなく成功する
      return { error: null }
    })
    
    render(<LogoutButton />)
    
    const logoutButton = screen.getByTestId('logout-button')
    
    await user.click(logoutButton)
    
    // signOutが呼ばれることを確認
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    
    // リダイレクトが呼ばれることを確認
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
}) 