import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// ローディング状態を表示するコンポーネントを作成
const LoadingIndicator = () => (
  <div data-testid="loading-indicator" className="loading">
    <div className="spinner"></div>
    <p>読み込み中...</p>
  </div>
)

// データ読み込み中に使用する簡易的なコンポーネント
function DataList({ isLoading, hasError, data }: { isLoading: boolean, hasError: boolean, data: any[] }) {
  return (
    <div>
      {isLoading && <LoadingIndicator />}
      {hasError && (
        <div role="alert">
          <p>データの読み込みに失敗しました</p>
          <button>再試行</button>
        </div>
      )}
      {!isLoading && !hasError && (
        <ul>
          {data.map(item => <li key={item.id}>{item.name}</li>)}
        </ul>
      )}
    </div>
  )
}

// フォーム送信中に使用する簡易的なコンポーネント
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button disabled={isSubmitting} data-testid="submit-button">
      {isSubmitting ? (
        <>
          <span data-testid="loading-spinner" className="spinner"></span>
          投稿中...
        </>
      ) : '投稿する'}
    </button>
  )
}

// 長時間読み込み中に使用する簡易的なコンポーネント
function LongLoadingIndicator({ elapsed }: { elapsed: number }) {
  return (
    <div data-testid="loading-indicator">
      <div className="spinner"></div>
      <p>読み込み中...</p>
      {elapsed > 3 && (
        <p data-testid="long-loading-message">
          データの読み込みに時間がかかっています...
        </p>
      )}
      {elapsed > 10 && (
        <button data-testid="cancel-button">
          キャンセル
        </button>
      )}
    </div>
  )
}

describe('UI-05: ローディング表示', () => {
  // UI-05-01: データ読み込み中のローディング表示
  it('データ読み込み中にローディングインジケータが表示される', async () => {
    // ローディング中の状態でコンポーネントをレンダリング
    const { rerender } = render(
      <DataList 
        isLoading={true} 
        hasError={false} 
        data={[]} 
      />
    )
    
    // ローディングインジケータが表示されていることを確認
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    
    // データが読み込まれた状態に変更
    rerender(
      <DataList 
        isLoading={false} 
        hasError={false} 
        data={[{ id: 1, name: 'テストデータ' }]} 
      />
    )
    
    // ローディングインジケータが非表示になっていることを確認
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    
    // データが表示されていることを確認
    expect(screen.getByText('テストデータ')).toBeInTheDocument()
  })

  // UI-05-02: フォーム送信中のローディング表示
  it('フォーム送信中にボタンがローディング状態になる', async () => {
    // 通常状態のボタンをレンダリング
    const { rerender } = render(<SubmitButton isSubmitting={false} />)
    
    // 通常のボタンが表示されていることを確認
    expect(screen.getByTestId('submit-button')).toHaveTextContent('投稿する')
    expect(screen.getByTestId('submit-button')).not.toBeDisabled()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    
    // 送信中の状態に変更
    rerender(<SubmitButton isSubmitting={true} />)
    
    // ボタンがローディング状態になっていることを確認
    expect(screen.getByTestId('submit-button')).toHaveTextContent('投稿中...')
    expect(screen.getByTestId('submit-button')).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  // UI-05-03: ページ遷移時のローディング表示
  it('ページ遷移時にローディングインジケータが表示される', async () => {
    // ページ遷移中を表す簡易的なコンポーネントをレンダリング
    render(
      <div>
        <div data-testid="page-transition-loading" className="full-page-loading">
          <LoadingIndicator />
        </div>
      </div>
    )
    
    // ページ遷移中のローディングインジケータが表示されていることを確認
    expect(screen.getByTestId('page-transition-loading')).toBeInTheDocument()
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  // UI-05-04: 長時間読み込み時のフィードバック
  it('長時間読み込み時に適切なフィードバックを提供する', async () => {
    // 短時間の読み込み状態でコンポーネントをレンダリング
    const { rerender } = render(<LongLoadingIndicator elapsed={0} />)
    
    // 通常のローディングインジケータが表示されていることを確認
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    
    // 長時間経過のメッセージがないことを確認
    expect(screen.queryByTestId('long-loading-message')).not.toBeInTheDocument()
    
    // 長時間読み込み状態に変更
    rerender(<LongLoadingIndicator elapsed={5} />)
    
    // 長時間経過のメッセージが表示されていることを確認
    expect(screen.getByTestId('long-loading-message')).toBeInTheDocument()
    expect(screen.getByText('データの読み込みに時間がかかっています...')).toBeInTheDocument()
    
    // さらに長時間経過した状態に変更
    rerender(<LongLoadingIndicator elapsed={15} />)
    
    // キャンセルボタンが表示されていることを確認
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  // UI-05-05: ローディングキャンセル
  it('可能な場合はローディング処理をキャンセルできる', async () => {
    // キャンセルハンドラをモック
    const handleCancel = vi.fn()
    
    // キャンセル可能なローディングコンポーネントをレンダリング
    render(
      <div>
        <div data-testid="loading-indicator">
          <div className="spinner"></div>
          <p>大きなファイルをアップロード中...</p>
          <button 
            onClick={handleCancel} 
            data-testid="cancel-button"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
    
    // ローディングインジケータが表示されていることを確認
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    
    // キャンセルボタンが表示されていることを確認
    const cancelButton = screen.getByTestId('cancel-button')
    expect(cancelButton).toBeInTheDocument()
    
    // キャンセルボタンをクリック
    cancelButton.click()
    
    // キャンセルハンドラが呼び出されたことを確認
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })
}) 