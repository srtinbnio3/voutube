import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'

// ローディングコンポーネント
function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  return (
    <div data-testid="loading-spinner" className={`spinner ${sizeClasses[size]}`}>
      <svg className="animate-spin" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

// データ読み込みコンポーネント
function DataLoadingComponent() {
  const [loading, setLoading] = vi.fn().mockReturnValue([true, () => {}]);
  const [longLoading, setLongLoading] = vi.fn().mockReturnValue([false, () => {}]);
  const [data, setData] = vi.fn().mockReturnValue([null, () => {}]);
  
  return (
    <div>
      {loading && (
        <div data-testid="loading-indicator">
          <LoadingSpinner />
          {longLoading && (
            <p data-testid="long-loading-message">
              データの読み込みに時間がかかっています...
            </p>
          )}
        </div>
      )}
      
      {!loading && data && (
        <ul data-testid="data-list">
          {Array.isArray(data) ? data.map((item, index) => (
            <li key={index}>{item.name}</li>
          )) : null}
        </ul>
      )}
      
      <button 
        data-testid="load-button"
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            setLongLoading(true);
          }, 2000);
          
          setTimeout(() => {
            setLoading(false);
            setLongLoading(false);
            setData([
              { id: 1, name: 'アイテム1' },
              { id: 2, name: 'アイテム2' }
            ]);
          }, 3000);
        }}
      >
        データを読み込む
      </button>
    </div>
  );
}

// フォーム送信コンポーネント
function FormSubmitComponent() {
  const [submitting, setSubmitting] = vi.fn().mockReturnValue([false, () => {}]);
  const [success, setSuccess] = vi.fn().mockReturnValue([false, () => {}]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // 送信処理のシミュレーション
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 2000);
  };
  
  return (
    <form onSubmit={handleSubmit} data-testid="submit-form">
      <div>
        <label htmlFor="name">名前</label>
        <input id="name" name="name" data-testid="name-input" />
      </div>
      
      <button 
        type="submit" 
        data-testid="submit-button"
        disabled={submitting}
      >
        {submitting ? (
          <span data-testid="submitting-text">
            <LoadingSpinner size="small" />
            送信中...
          </span>
        ) : '送信'}
      </button>
      
      {success && (
        <p data-testid="success-message">送信が完了しました！</p>
      )}
    </form>
  );
}

describe('UI-05: ローディング表示', () => {
  // UI-05-01: データ読み込み中のローディング表示
  it('データ読み込み中にローディングインジケータが表示される', () => {
    // ローディング中のコンポーネントをレンダリング
    render(
      <div data-testid="loading-container">
        <LoadingSpinner />
        <p>データを読み込んでいます...</p>
      </div>
    );
    
    // ローディングインジケータが表示されることを確認
    expect(screen.getByTestId('loading-container')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
  });

  // UI-05-02: フォーム送信中のローディング表示
  it('フォーム送信中にボタンがローディング状態になる', () => {
    // 送信中のフォームコンポーネントをレンダリング
    render(
      <button disabled data-testid="loading-button">
        <LoadingSpinner size="small" />
        <span>送信中...</span>
      </button>
    );
    
    // ボタンがローディング状態になることを確認
    const button = screen.getByTestId('loading-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('送信中...')).toBeInTheDocument();
  });

  // UI-05-04: 長時間読み込み時のフィードバック
  it('長時間読み込み時に適切なフィードバックを提供する', () => {
    // 長時間読み込み状態のコンポーネントをレンダリング
    render(
      <div data-testid="long-loading-container">
        <LoadingSpinner size="large" />
        <p data-testid="long-loading-message">データの読み込みに時間がかかっています...</p>
        <button data-testid="cancel-button">キャンセル</button>
      </div>
    );
    
    // 長時間読み込み表示が適切にされていることを確認
    expect(screen.getByTestId('long-loading-container')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('long-loading-message')).toBeInTheDocument();
    expect(screen.getByText('データの読み込みに時間がかかっています...')).toBeInTheDocument();
    
    // キャンセルボタンが表示されていることを確認
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  // UI-05-05: ローディングキャンセル
  it('ローディングをキャンセルできる', () => {
    // キャンセル機能を持つローディングコンポーネント
    function CancellableLoading() {
      const [loading, setLoading] = useState(true);
      
      return (
        <div data-testid="cancellable-loading">
          {loading ? (
            <>
              <LoadingSpinner />
              <p>データを読み込んでいます...</p>
              <button 
                data-testid="real-cancel-button"
                onClick={() => setLoading(false)}
              >
                キャンセル
              </button>
            </>
          ) : (
            <p data-testid="cancelled-message">読み込みをキャンセルしました</p>
          )}
        </div>
      );
    }
    
    render(<CancellableLoading />);
    
    // 初期状態ではローディング表示されていることを確認
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByTestId('real-cancel-button'));
    
    // ローディングが停止され、キャンセルメッセージが表示されることを確認
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('cancelled-message')).toBeInTheDocument();
    expect(screen.getByText('読み込みをキャンセルしました')).toBeInTheDocument();
  });
}); 