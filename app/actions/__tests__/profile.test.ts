import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { updateProfileAction } from '../profile'

// Supabaseクライアントのモック
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}))

// next/navigationのモック
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn()
}))

// next/cacheのモック
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// utils/utilsのモック
vi.mock('@/utils/utils', () => ({
  encodedRedirect: vi.fn((status, path, message) => {
    if (status === 'error') {
      return message;
    }
    return undefined;
  })
}))

describe('Profile Actions', () => {
  let mockSupabase: any
  let mockInsert: any
  let mockUpdate: any

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks()

    // モックの関数を作成
    mockInsert = vi.fn().mockResolvedValue({ data: { id: 'test-user-id' }, error: null })
    mockUpdate = vi.fn().mockResolvedValue({ data: { id: 'test-user-id' }, error: null })

    // Supabaseクライアントのモックを設定
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { 
            user: {
              id: 'test-user-id',
              email: 'test.user@example.com'
            } 
          }, 
          error: null 
        })
      },
      from: vi.fn().mockImplementation((table) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: mockInsert,
          update: vi.fn().mockReturnThis()
        };
      })
    }
    
    // Supabaseクライアントのモックを設定
    ;(createClient as any).mockResolvedValue(mockSupabase)
  })

  describe('PROF-01: プロフィール自動作成', () => {
    // PROF-01-01: メールアドレス認証でのプロフィール自動作成
    it('creates profile with email local part as username', async () => {
      // フォームデータを作成
      const formData = new FormData()
      formData.append('username', 'test.user')

      // 関数を実行
      await updateProfileAction(formData)
      
      // 期待する呼び出しが行われたか確認
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'test-user-id',
        username: 'test.user',
        avatar_url: null
      })
    })

    // PROF-01-03: 既存ユーザー名の場合
    it('handles duplicate username', async () => {
      // 重複エラーをモック
      mockInsert.mockResolvedValue({ error: { code: '23505' } })

      // フォームデータを作成
      const formData = new FormData()
      formData.append('username', 'existing.user')

      // 関数を実行
      const result = await updateProfileAction(formData)
      
      // 期待する結果を確認
      expect(result).toBe('このユーザー名は既に使用されています')
    })

    // PROF-01-04: 特殊文字を含むメールアドレス
    it('sanitizes username from email with special characters', async () => {
      // ユーザー情報を特殊文字付きのメールアドレスに変更
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test.user+special@example.com'
          }
        },
        error: null
      })

      // フォームデータを作成
      const formData = new FormData()
      formData.append('username', 'test.user.special')

      // 関数を実行
      await updateProfileAction(formData)
      
      // 期待する呼び出しが行われたか確認
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        username: expect.not.stringMatching(/[+]/)
      }))
    })
  })
}) 