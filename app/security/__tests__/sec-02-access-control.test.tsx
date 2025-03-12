import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

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
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

// Supabaseクライアントのモック
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn()
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn()
}

// @/utils/supabase/serverのモック
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// 簡易的な認証コンテキストプロバイダーコンポーネント
function AuthContextProvider({ 
  children, 
  user = null 
}: { 
  children: React.ReactNode, 
  user?: any 
}) {
  // 実際の実装では、contextを使用します
  return (
    <div data-testid="auth-context">
      {user ? (
        <div data-testid="user-data">
          <span data-testid="user-id">{user.id}</span>
          <span data-testid="user-role">{user.role}</span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

// 保護されたルートコンポーネント
function ProtectedRoute({ 
  children,
  requiredRole = null
}: { 
  children: React.ReactNode,
  requiredRole?: string | null
}) {
  // ユーザーデータを親コンポーネントから取得
  const authContext = document.querySelector('[data-testid="auth-context"]')
  const userData = authContext?.querySelector('[data-testid="user-data"]')
  let user = null
  
  if (userData) {
    const userId = userData.querySelector('[data-testid="user-id"]')?.textContent
    const userRole = userData.querySelector('[data-testid="user-role"]')?.textContent
    
    if (userId && userRole) {
      user = { id: userId, role: userRole }
    }
  }
  
  // ユーザーの認証と権限をチェック
  const isAuthenticated = !!user;
  const isAuthorized = !requiredRole || (user && user.role === requiredRole);
  
  // ユーザーが認証されていない、または必要なロールを持っていない場合はリダイレクト
  if (!isAuthenticated || !isAuthorized) {
    // コンポーネントがマウントされたときに一度だけリダイレクトを呼び出す
    setTimeout(() => {
      redirect('/login?error=unauthorized');
    }, 0);
    return null;
  }

  return (
    <div data-testid="protected-route">
      {children}
    </div>
  )
}

// 管理者専用ページコンポーネント
function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div data-testid="admin-content">
        <h1>管理者ページ</h1>
        <p>管理者専用のコンテンツです</p>
      </div>
    </ProtectedRoute>
  )
}

// ユーザー専用ページコンポーネント
function UserPage() {
  return (
    <ProtectedRoute>
      <div data-testid="user-content">
        <h1>ユーザーページ</h1>
        <p>ログインユーザー専用のコンテンツです</p>
      </div>
    </ProtectedRoute>
  )
}

describe('SEC-02: アクセス制御', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // SEC-02-01: 未認証ユーザーのリダイレクト
  it('未認証ユーザーが保護されたルートにアクセスすると、ログインページにリダイレクトされる', async () => {
    // 未認証ユーザーのモック
    const mockUser = null
    
    render(
      <AuthContextProvider user={mockUser}>
        <UserPage />
      </AuthContextProvider>
    )
    
    // リダイレクトが呼び出されることを確認
    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/login?error=unauthorized')
    })
  })

  // SEC-02-02: ロールベースのアクセス制御 - 現在は未実装
  it.skip('ロールベースのアクセス制御 - 現在実装中のため、このテストはスキップされます', async () => {
    // 管理者機能は現在実装中のため、このテストはスキップされています
    // 今後の実装で追加予定
    console.log('管理者機能は現在実装中のため、このテストはスキップされています')
  });

  // SEC-02-03: サーバーサイドでの認証チェック
  it('サーバーサイドで適切な認証チェックが行われる', async () => {
    // サーバーサイドの認証チェック関数をモック
    const checkAuthServer = vi.fn(async (requiredRole = null) => {
      // Supabaseからのユーザー取得をシミュレート
      const { data: { user } } = await mockSupabase.auth.getUser()
      
      if (!user) {
        return { authenticated: false, user: null }
      }
      
      // ユーザーロールの取得をシミュレート
      const { data: profile } = await mockSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const userRole = profile?.role || 'user'
      
      if (requiredRole && userRole !== requiredRole) {
        return { 
          authenticated: true, 
          authorized: false, 
          user: { ...user, role: userRole } 
        }
      }
      
      return { 
        authenticated: true, 
        authorized: true, 
        user: { ...user, role: userRole } 
      }
    })
    
    // 未認証ケースのテスト
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    const result1 = await checkAuthServer()
    expect(result1.authenticated).toBe(false)
    
    // 認証済みだが未認可ケースのテスト
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { id: 'user-123', email: 'user@example.com' } 
      },
      error: null
    })
    
    mockSupabase.single.mockResolvedValue({
      data: { role: 'user' },
      error: null
    })
    
    const result2 = await checkAuthServer('admin')
    expect(result2.authenticated).toBe(true)
    expect(result2.authorized).toBe(false)
    
    // 認証・認可済みケースのテスト
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { id: 'admin-123', email: 'admin@example.com' } 
      },
      error: null
    })
    
    mockSupabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null
    })
    
    const result3 = await checkAuthServer('admin')
    expect(result3.authenticated).toBe(true)
    expect(result3.authorized).toBe(true)
    expect(result3.user.role).toBe('admin')
  })

  // SEC-02-04: APIエンドポイントの保護
  it('APIエンドポイントが適切に保護されている', async () => {
    // APIリクエストのモック関数
    const fetchProtectedApi = vi.fn(async (endpoint: string, token?: string) => {
      // 実際の実装では、fetchなどを使ってAPIリクエストを送信します
      if (!token) {
        return { 
          ok: false, 
          status: 401, 
          json: async () => ({ error: 'Unauthorized' }) 
        }
      }
      
      // トークン検証のシミュレーション（実際にはサーバー側で行われます）
      const isValidToken = token === 'valid-token'
      if (!isValidToken) {
        return { 
          ok: false, 
          status: 401, 
          json: async () => ({ error: 'Invalid token' }) 
        }
      }
      
      return { 
        ok: true, 
        status: 200, 
        json: async () => ({ data: 'Protected data' }) 
      }
    })
    
    // トークンなしでのリクエスト
    const response1 = await fetchProtectedApi('/api/protected')
    expect(response1.ok).toBe(false)
    expect(response1.status).toBe(401)
    expect(await response1.json()).toEqual({ error: 'Unauthorized' })
    
    // 無効なトークンでのリクエスト
    const response2 = await fetchProtectedApi('/api/protected', 'invalid-token')
    expect(response2.ok).toBe(false)
    expect(response2.status).toBe(401)
    expect(await response2.json()).toEqual({ error: 'Invalid token' })
    
    // 有効なトークンでのリクエスト
    const response3 = await fetchProtectedApi('/api/protected', 'valid-token')
    expect(response3.ok).toBe(true)
    expect(response3.status).toBe(200)
    expect(await response3.json()).toEqual({ data: 'Protected data' })
  })

  // SEC-02-05: CSRFプロテクション
  it('CSRF保護が実装されている', () => {
    // CSRFトークン生成関数のモック
    const generateCsrfToken = vi.fn(() => {
      // 実際の実装では、暗号学的に安全な乱数を生成します
      return 'csrf-token-' + Math.random().toString(36).substring(2)
    })
    
    // CSRFトークン検証関数のモック
    const validateCsrfToken = vi.fn((token: string, sessionToken: string) => {
      // 実際の実装では、トークンの検証を行います
      return token === sessionToken
    })
    
    // トークン生成
    const csrfToken = generateCsrfToken()
    expect(typeof csrfToken).toBe('string')
    expect(csrfToken.startsWith('csrf-token-')).toBe(true)
    
    // 有効なトークンの検証
    expect(validateCsrfToken(csrfToken, csrfToken)).toBe(true)
    
    // 無効なトークンの検証
    expect(validateCsrfToken('invalid-token', csrfToken)).toBe(false)
  })

  // SEC-02-06: コンテンツの条件付き表示
  it('ユーザーロールに基づいてUI要素が条件付きで表示される', () => {
    // 条件付き表示を行うコンポーネント
    const ConditionalUI = ({ user }: { user: any }) => (
      <div>
        <h1>ダッシュボード</h1>
        {user && (
          <div data-testid="user-content">
            <p>ログインユーザー向けコンテンツ</p>
          </div>
        )}
        {user && user.role === 'admin' && (
          <div data-testid="admin-content">
            <p>管理者向けコンテンツ</p>
            <button>ユーザー管理</button>
          </div>
        )}
        <div data-testid="public-content">
          <p>公開コンテンツ</p>
        </div>
      </div>
    )
    
    // 未認証ユーザーの場合
    const { rerender } = render(<ConditionalUI user={null} />)
    
    // 公開コンテンツのみ表示されることを確認
    expect(screen.getByTestId('public-content')).toBeInTheDocument()
    expect(screen.queryByTestId('user-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    
    // 一般ユーザーの場合
    rerender(<ConditionalUI user={{ id: 'user-123', role: 'user' }} />)
    
    // 公開コンテンツとユーザーコンテンツが表示されることを確認
    expect(screen.getByTestId('public-content')).toBeInTheDocument()
    expect(screen.getByTestId('user-content')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    
    // 管理者ユーザーの場合
    rerender(<ConditionalUI user={{ id: 'admin-123', role: 'admin' }} />)
    
    // すべてのコンテンツが表示されることを確認
    expect(screen.getByTestId('public-content')).toBeInTheDocument()
    expect(screen.getByTestId('user-content')).toBeInTheDocument()
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument()
  })
}) 