import { render } from '@testing-library/react'
import { ReactElement } from 'react'

// テスト用のラッパーコンポーネント
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  )
}

// カスタムレンダー関数
const customRender = (ui: ReactElement) => {
  return render(ui, {
    wrapper: Providers,
  })
}

// テスト用のモックユーザー
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
}

// テスト用のモックプロフィール
export const mockProfile = {
  id: mockUser.id,
  username: 'testuser',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render } 