import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { VoteButtons } from '../vote-buttons'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

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
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      })
      const mockToast = vi.fn()
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.reject(new Error('Network error'))),
        }))
      }))
      ;(useToast as any).mockImplementation(() => ({
        toast: mockToast
      }))

      render(<VoteButtons {...defaultProps} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      fireEvent.click(upvoteButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "エラーが発生しました",
          description: "投票の更新に失敗しました",
          variant: "destructive",
        })
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
      // 1人目のユーザー
      const mockGetSession1 = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } }
      })
      // 2人目のユーザー
      const mockGetSession2 = vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-2' } } }
      })

      // 1人目のユーザー設定
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession1 },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      const { rerender } = render(<VoteButtons {...defaultProps} />)
      
      const downvoteButton = screen.getByLabelText('downvote')
      fireEvent.click(downvoteButton)

      await waitFor(() => {
        expect(downvoteButton).toHaveClass('text-blue-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('-1')
      })

      // 2人目のユーザーの投票
      ;(createBrowserClient as any).mockImplementation(() => ({
        auth: { getSession: mockGetSession2 },
        from: vi.fn(() => ({
          upsert: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve())
          }))
        }))
      }))

      // 2人目のユーザーの投票時は新しいコンポーネントをレンダリング
      // initialScore=-1, initialVote=null は1人目の投票後の状態
      rerender(<VoteButtons {...defaultProps} initialScore={-1} initialVote={null} />)
      
      // 2人目のユーザーがダウンボート
      fireEvent.click(downvoteButton)

      // テストの期待値を確認：スコアが-2で、ボタンが青色に
      await waitFor(() => {
        expect(downvoteButton).toHaveClass('text-blue-500')
        expect(screen.getByTestId('vote-score')).toHaveTextContent('-2')
      })
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

      const { rerender } = render(<VoteButtons {...defaultProps} />)
      
      const upvoteButton = screen.getByLabelText('upvote')
      const downvoteButton = screen.getByLabelText('downvote')

      // まずいいね投票
      fireEvent.click(upvoteButton)
      await waitFor(() => {
        expect(screen.getByTestId('vote-score')).toHaveTextContent('1')
        expect(upvoteButton).toHaveClass('text-orange-500')
      })

      // いいね投票の状態をコンポーネントに反映
      rerender(<VoteButtons {...defaultProps} initialScore={1} initialVote={true} />)
      
      // 次にいいねボタンをクリック（期待値：投票取り消し、スコア0）
      fireEvent.click(upvoteButton)
      await waitFor(() => {
        expect(screen.getByTestId('vote-score')).toHaveTextContent('0')
        expect(upvoteButton).not.toHaveClass('text-orange-500')
      })
      
      // 投票取り消しの状態をコンポーネントに反映
      rerender(<VoteButtons {...defaultProps} initialScore={0} initialVote={null} />)
      
      // 最後によくないね投票
      fireEvent.click(downvoteButton)
      await waitFor(() => {
        expect(screen.getByTestId('vote-score')).toHaveTextContent('-1')
        expect(downvoteButton).toHaveClass('text-blue-500')
      })

      // 最終状態の確認
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-1')
      expect(downvoteButton).toHaveClass('text-blue-500')
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

    test('VOTE-05-07: 高スコアの表示形式', () => {
      // 大きな数値でもスコアが正しく表示されることを確認
      const { rerender } = render(<VoteButtons {...defaultProps} initialScore={999999} />)
      expect(screen.getByTestId('vote-score')).toHaveTextContent('999999')

      // 負の大きな数値でもスコアが正しく表示されることを確認
      rerender(<VoteButtons {...defaultProps} initialScore={-999999} />)
      expect(screen.getByTestId('vote-score')).toHaveTextContent('-999999')
    })
  })
}) 