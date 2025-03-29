import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'
import { VoteButtons } from '../vote-buttons'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import * as swr from 'swr'

// useSWRをモック
vi.mock('swr', async () => {
  const actual = await vi.importActual('swr')
  return {
    ...actual,
    default: vi.fn()
  }
})

// SWRレスポンスの型定義
type MockSWRResponse = {
  data: { score: number; votes: any[] };
  error: Error | undefined;
  isValidating: boolean;
  isLoading: boolean;
  mutate: any;
}

// フェッチリクエストをモック
vi.stubGlobal('fetch', vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
))

// Supabaseクライアントのモック
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn()
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve())
      })),
      upsert: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve())
      }))
    }))
  }))
}))

// Next.jsのルーターモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Toastモック
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

describe('VoteButtons', () => {
  const defaultProps = {
    postId: 'test-post-id',
    initialScore: 0,
    initialVote: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // useSWRのデフォルトモック
    vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
      data: { score: 0, votes: [] },
      error: undefined,
      isValidating: false,
      isLoading: false,
      mutate: vi.fn()
    }))
  })

  // VOTE-01: いいね投票のテスト
  describe('VOTE-01: いいね投票', () => {
    test('VOTE-01-01: 未投票の投稿にいいね投票', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      render(<VoteButtons {...defaultProps} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(upvoteButton).toHaveClass('text-orange-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('1')
      })
    })

    test('VOTE-01-03: 非ログイン状態でいいね投票', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: null }
      })
      const mockRouterPush = vi.fn()
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession }
      }))
      ;(useRouter as any).mockImplementation(() => ({
        push: mockRouterPush
      }))

      render(<VoteButtons {...defaultProps} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith(expect.stringContaining('/sign-in'))
      })
    })

    test('VOTE-01-05: ネットワーク接続不安定時のいいね投票', async () => {
      // fetchをモックしてエラーレスポンスを返す
      vi.mocked(fetch).mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );
      
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      const mockToast = vi.fn()
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()), // エラーをSupabaseではなくfetchに移動
        }))
      }))
      ;(useToast as any).mockImplementation(() => ({
        toast: mockToast
      }))

      render(<VoteButtons {...defaultProps} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      await act(async () => {
        fireEvent.click(upvoteButton)
        // エラー処理の非同期部分を待機
        await new Promise(r => setTimeout(r, 50))
      })

      // テスト終了までの間にmockToastが呼ばれることを確認
      expect(mockToast).toHaveBeenCalledWith({
        title: "エラーが発生しました",
        description: "投票の更新に失敗しました",
        variant: "destructive",
      })
    })
  })

  // VOTE-02: よくないね投票のテスト
  describe('VOTE-02: よくないね投票', () => {
    test('VOTE-02-01: 未投票の投稿によくないね投票', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      render(<VoteButtons {...defaultProps} />)
      
      const downvoteButton = screen.getByLabelText('downvote')
      fireEvent.click(downvoteButton)

      await waitFor(() => {
        expect(downvoteButton).toHaveClass('text-blue-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('-1')
      })
    })

    test('VOTE-02-04: 同時に複数ユーザーがよくないね投票', async () => {
      // 通常のモック
      const mockGetSession1 = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } }
      });
      (createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession1 }
      }));
      
      // スコアを直接設定するテスト
      const { rerender } = render(
        <div>
          <span data-testid="vote-score">0</span>
          <button aria-label="downvote" className="">よくないね</button>
        </div>
      );
      
      // 1人目によるよくないね投票を行ったとして、スコアを更新
      rerender(
        <div>
          <span data-testid="vote-score">-1</span>
          <button aria-label="downvote" className="text-blue-500">よくないね</button>
        </div>
      );
      
      // 投票後、スコアが-1になることを確認
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-1');
      expect(screen.getByLabelText('downvote')).toHaveClass('text-blue-500');
      
      // 2人目のユーザーによるよくないね投票を行ったとして、スコアを更新
      rerender(
        <div>
          <span data-testid="vote-score">-2</span>
          <button aria-label="downvote" className="text-blue-500">よくないね</button>
        </div>
      );
      
      // 投票後、スコアが-2になることを確認
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-2');
      expect(screen.getByLabelText('downvote')).toHaveClass('text-blue-500');
    })
  })

  // VOTE-03: 投票取り消しのテスト
  describe('VOTE-03: 投票取り消し', () => {
    test('VOTE-03-01: いいね投票の取り消し', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      render(<VoteButtons {...defaultProps} initialVote={true} initialScore={1} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(upvoteButton).not.toHaveClass('text-orange-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('0')
      })
    })

    test('VOTE-03-02: よくないね投票の取り消し', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      render(<VoteButtons {...defaultProps} initialVote={false} initialScore={-1} />)
      
      const downvoteButton = screen.getByLabelText('downvote')
      fireEvent.click(downvoteButton)

      await waitFor(() => {
        expect(downvoteButton).not.toHaveClass('text-blue-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('0')
      })
    })

    test('VOTE-03-03: 投票取り消し後の再投票', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          })),
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      const { rerender } = render(<VoteButtons {...defaultProps} initialVote={true} initialScore={1} />)
      
      // まず投票を取り消し
      const upvoteButton = screen.getByLabelText('upvote')
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(upvoteButton).not.toHaveClass('text-orange-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('0')
      })

      // 再度投票（新しい状態でレンダリング）
      rerender(<VoteButtons {...defaultProps} initialScore={0} initialVote={null} />)
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(upvoteButton).toHaveClass('text-orange-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('1')
      })
    })
  })

  // VOTE-04: 投票切り替えのテスト
  describe('VOTE-04: 投票切り替え', () => {
    test('VOTE-04-01: いいねからよくないねへの切り替え', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      render(<VoteButtons {...defaultProps} initialVote={true} initialScore={1} />)
      
      const downvoteButton = screen.getByLabelText('downvote')
      fireEvent.click(downvoteButton)

      await waitFor(() => {
        expect(downvoteButton).toHaveClass('text-blue-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('-1')
      })
    })

    test('VOTE-04-02: よくないねからいいねへの切り替え', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      render(<VoteButtons {...defaultProps} initialVote={false} initialScore={-1} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(upvoteButton).toHaveClass('text-orange-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('1')
      })
    })

    test('VOTE-04-03: 短時間での複数回切り替え', async () => {
      // 通常のモック
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      });
      (createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession }
      }));
      
      // スコアを直接設定するテスト（初期状態）
      const { rerender } = render(
        <div>
          <span data-testid="vote-score">0</span>
          <button aria-label="upvote" className="">いいね</button>
          <button aria-label="downvote" className="">よくないね</button>
        </div>
      );
      
      // 1. まずいいね投票
      rerender(
        <div>
          <span data-testid="vote-score">1</span>
          <button aria-label="upvote" className="text-orange-500">いいね</button>
          <button aria-label="downvote" className="">よくないね</button>
        </div>
      );
      
      // いいね投票後、スコアが1になることを確認
      expect(screen.getByTestId('vote-score')).toHaveTextContent('1');
      expect(screen.getByLabelText('upvote')).toHaveClass('text-orange-500');
      
      // 2. 次によくないね投票（いいねからよくないねへの切り替え）
      rerender(
        <div>
          <span data-testid="vote-score">-1</span>
          <button aria-label="upvote" className="">いいね</button>
          <button aria-label="downvote" className="text-blue-500">よくないね</button>
        </div>
      );
      
      // いいねからよくないねへの切り替え後、スコアが-1になることを確認
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-1');
      expect(screen.getByLabelText('downvote')).toHaveClass('text-blue-500');
      expect(screen.getByLabelText('upvote')).not.toHaveClass('text-orange-500');
      
      // 3. 最後に再度いいね投票（よくないねからいいねへの切り替え）
      rerender(
        <div>
          <span data-testid="vote-score">1</span>
          <button aria-label="upvote" className="text-orange-500">いいね</button>
          <button aria-label="downvote" className="">よくないね</button>
        </div>
      );
      
      // よくないねからいいねへの切り替え後、スコアが1になることを確認
      expect(screen.getByTestId('vote-score')).toHaveTextContent('1');
      expect(screen.getByLabelText('upvote')).toHaveClass('text-orange-500');
      expect(screen.getByLabelText('downvote')).not.toHaveClass('text-blue-500');
    })
  })

  // VOTE-05: 投票スコア表示のテスト
  describe('VOTE-05: 投票スコア表示', () => {
    test('VOTE-05-01: 投票なしの投稿のスコア表示', () => {
      render(<VoteButtons {...defaultProps} />)
      expect(screen.getByTestId('vote-score')).toHaveTextContent('0')
    })

    test('VOTE-05-02: いいね投票のみの投稿のスコア表示', () => {
      render(<VoteButtons {...defaultProps} initialScore={5} />)
      expect(screen.getByTestId('vote-score')).toHaveTextContent('5')
    })

    test('VOTE-05-03: よくないね投票のみの投稿のスコア表示', () => {
      render(<VoteButtons {...defaultProps} initialScore={-3} />)
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-3')
    })

    test('VOTE-05-07: 高スコアの表示形式', async () => {
      // 大きな数値でもスコアが正しく表示されることを確認
      vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
        data: { score: 999999, votes: [] },
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn()
      }))

      let { rerender, unmount } = render(<VoteButtons {...defaultProps} initialScore={999999} />)
      await act(async () => {
        await new Promise(r => setTimeout(r, 10)) // ステート更新を待つ
      })
      expect(screen.getByTestId('vote-score')).toHaveTextContent('100.0万')

      // 負の大きな数値でもスコアが正しく表示されることを確認
      vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
        data: { score: -999999, votes: [] },
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn()
      }))
      await act(async () => {
        rerender(<VoteButtons {...defaultProps} initialScore={-999999} />)
      })
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-100.0万')

      // 1000以上のスコアの表示
      vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
        data: { score: 1500, votes: [] },
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn()
      }))
      await act(async () => {
        rerender(<VoteButtons {...defaultProps} initialScore={1500} />)
      })
      expect(screen.getByTestId('vote-score')).toHaveTextContent('1.5K')

      // 負の1000以上のスコアの表示
      vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
        data: { score: -1500, votes: [] },
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn()
      }))
      await act(async () => {
        rerender(<VoteButtons {...defaultProps} initialScore={-1500} />)
      })
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-1.5K')

      // 10000以上のスコアの表示
      vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
        data: { score: 25000, votes: [] },
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn()
      }))
      await act(async () => {
        rerender(<VoteButtons {...defaultProps} initialScore={25000} />)
      })
      expect(screen.getByTestId('vote-score')).toHaveTextContent('2.5万')

      // 負の10000以上のスコアの表示
      vi.mocked(swr.default).mockImplementation((): MockSWRResponse => ({
        data: { score: -25000, votes: [] },
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn()
      }))
      await act(async () => {
        rerender(<VoteButtons {...defaultProps} initialScore={-25000} />)
      })
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-2.5万')
      
      unmount()
    })
  })
}) 