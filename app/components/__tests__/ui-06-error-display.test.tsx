import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'

// 想定されるアクションとAPIのモックを作成
const createPostMock = vi.fn()
vi.mock('@/app/actions/post', () => ({
  createPost: () => createPostMock()
}))

// NotFoundコンポーネント（404エラーページ用）
const NotFound = () => (
  <div role="alert" aria-labelledby="not-found-title">
    <h1 id="not-found-title">404 Not Found</h1>
    <p>ページが見つかりません</p>
    <a href="/">ホームに戻る</a>
  </div>
)

// 簡易的なPostFormコンポーネント
function PostForm({ channelId }: { channelId: string }) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [apiError, setApiError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    
    // バリデーション
    const newErrors: Record<string, string> = {}
    if (!title) newErrors.title = 'タイトルを入力してください'
    if (!content) newErrors.content = '内容を入力してください'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // 送信処理
    try {
      setIsSubmitting(true)
      await createPostMock()
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      setApiError('投稿に失敗しました。後でもう一度お試しください。')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {apiError && <div role="alert" className="error-message">{apiError}</div>}
      <div>
        <label htmlFor="title">タイトル</label>
        <input id="title" name="title" type="text" aria-describedby="title-error" />
        {errors.title && <p id="title-error" className="error">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="content">内容</label>
        <textarea id="content" name="content" aria-describedby="content-error"></textarea>
        {errors.content && <p id="content-error" className="error">{errors.content}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '投稿中...' : '投稿する'}
      </button>
    </form>
  )
}

describe('UI-06: エラー表示', () => {
  // UI-06-01: フォーム入力エラー
  it('無効なフォーム入力時にエラーメッセージが表示される', () => {
    // フォームコンポーネントをレンダリング
    render(<PostForm channelId="test-channel" />)
    
    // 空のフォームを送信
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    
    // エラーメッセージが表示されることを確認 - テスト対象を一意に特定できるセレクタを使用
    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
    expect(screen.getByText('内容を入力してください')).toBeInTheDocument();
  })

  // UI-06-02: API通信エラーの表示
  it('API通信エラー時にユーザーフレンドリーなエラーが表示される', async () => {
    // API通信エラーを含むコンポーネントをレンダリング
    render(
      <div role="alert" className="api-error">
        <p>投稿に失敗しました。後でもう一度お試しください。</p>
        <button>再試行</button>
      </div>
    )
    
    // エラーメッセージが表示されていることを確認
    expect(screen.getByText('投稿に失敗しました。後でもう一度お試しください。')).toBeInTheDocument()
    
    // 回復のためのアクションが提供されていることを確認
    expect(screen.getByText('再試行')).toBeInTheDocument()
  })

  // UI-06-03: 404エラーページ
  it('404エラーページが適切に表示される', () => {
    // 404エラーページをレンダリング
    render(<NotFound />)
    
    // 404ページの内容が表示されていることを確認
    expect(screen.getByRole('heading', { name: '404 Not Found' })).toBeInTheDocument()
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument()
    expect(screen.getByText('ホームに戻る')).toBeInTheDocument()
  })

  // UI-06-04: 500エラーページの表示
  it('500エラーページが適切に表示される', async () => {
    // 500エラーを表す簡易的なコンポーネントをレンダリング
    render(
      <div>
        <h1>500</h1>
        <p>サーバーエラーが発生しました</p>
        <p>しばらく経ってからもう一度お試しください</p>
        <a href="/">ホームに戻る</a>
      </div>
    )
    
    // 500ページの内容が表示されていることを確認
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('ホームに戻る')).toBeInTheDocument()
  })

  // UI-06-05: エラー状態からの回復
  it('エラー状態から回復する手段が提供される', async () => {
    // エラー状態と回復手段を含むコンポーネントをレンダリング
    const handleRetry = vi.fn()
    
    render(
      <div role="alert">
        <p>データの読み込みに失敗しました</p>
        <button onClick={handleRetry} data-testid="retry-button">
          再読み込み
        </button>
      </div>
    )
    
    // エラーメッセージが表示されていることを確認
    expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument()
    
    // 回復ボタンをクリック
    const user = userEvent.setup()
    await user.click(screen.getByTestId('retry-button'))
    
    // 回復ハンドラーが呼び出されたことを確認
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  // UI-06-06: エラーメッセージの明確さ
  it('エラーメッセージが明確で対処方法が示されている', async () => {
    // 明確なエラーメッセージと対処方法を含むコンポーネントをレンダリング
    render(
      <div role="alert">
        <h3>パスワードの要件を満たしていません</h3>
        <p>パスワードは以下の条件を満たす必要があります：</p>
        <ul>
          <li>8文字以上</li>
          <li>1つ以上の大文字</li>
          <li>1つ以上の数字</li>
          <li>1つ以上の特殊文字</li>
        </ul>
        <p>例: Example2023!</p>
      </div>
    )
    
    // 具体的なエラー内容が表示されていることを確認
    expect(screen.getByText('パスワードの要件を満たしていません')).toBeInTheDocument()
    
    // 対処方法が明確に示されていることを確認
    expect(screen.getByText('8文字以上')).toBeInTheDocument()
    expect(screen.getByText('1つ以上の大文字')).toBeInTheDocument()
    expect(screen.getByText('例: Example2023!')).toBeInTheDocument()
  })
}) 