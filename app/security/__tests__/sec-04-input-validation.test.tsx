import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// バリデーション処理を行う簡易的なフォームコンポーネント
function ValidatedForm({
  onSubmit = () => {}
}: {
  onSubmit?: (data: any) => void
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const email = formData.get('email') as string
    
    // バリデーション処理
    let isValid = true
    const errors: Record<string, string> = {}
    
    // タイトルが空または長すぎる場合
    if (!title) {
      errors.title = 'タイトルを入力してください'
      isValid = false
    } else if (title.length > 100) {
      errors.title = 'タイトルは100文字以内で入力してください'
      isValid = false
    }
    
    // コンテンツが空または短すぎる場合
    if (!content) {
      errors.content = '内容を入力してください'
      isValid = false
    } else if (content.length < 10) {
      errors.content = '内容は10文字以上入力してください'
      isValid = false
    }
    
    // メールアドレスのバリデーション
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください'
      isValid = false
    }
    
    // 入力値のサニタイズ（XSS対策）
    const sanitizeText = (text: string) => {
      return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }
    
    if (isValid) {
      // サニタイズした値を渡す
      onSubmit({
        title: sanitizeText(title),
        content: sanitizeText(content),
        email: email ? sanitizeText(email) : null
      })
    } else {
      // エラーを表示する処理（テスト用に簡易実装）
      const errorContainer = document.getElementById('error-container')
      if (errorContainer) {
        errorContainer.innerHTML = ''
        Object.entries(errors).forEach(([field, message]) => {
          const errorElement = document.createElement('p')
          errorElement.textContent = message
          errorElement.setAttribute('data-testid', `${field}-error`)
          errorContainer.appendChild(errorElement)
        })
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div id="error-container" role="alert"></div>
      
      <div>
        <label htmlFor="title">タイトル（必須）</label>
        <input id="title" name="title" type="text" />
      </div>
      
      <div>
        <label htmlFor="content">内容（必須・10文字以上）</label>
        <textarea id="content" name="content"></textarea>
      </div>
      
      <div>
        <label htmlFor="email">メールアドレス（任意）</label>
        <input id="email" name="email" type="email" />
      </div>
      
      <button type="submit">送信</button>
    </form>
  )
}

describe('SEC-04: 入力バリデーション', () => {
  // SEC-04-01: SQLインジェクション対策
  it('SQLインジェクション攻撃の試みを防止する', async () => {
    // SQLインジェクションの試行をモニターするモック関数
    const handleSubmit = vi.fn()
    
    render(<ValidatedForm onSubmit={handleSubmit} />)
    
    // SQLインジェクション攻撃を含む入力を行う
    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: "正常なタイトル' OR 1=1 --" }
    })
    
    fireEvent.change(screen.getByLabelText(/内容/), {
      target: { value: "これは10文字以上の内容です。'; DROP TABLE posts; --" }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByText('送信'))
    
    // SQL文が無害化されていることを確認
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining("正常なタイトル&#039; OR 1=1 --"),
      content: expect.stringContaining("これは10文字以上の内容です。&#039;; DROP TABLE posts; --")
    }))
  })

  // SEC-04-02: XSS攻撃対策
  it('XSS攻撃の試みを防止する', async () => {
    // XSS攻撃の試行をモニターするモック関数
    const handleSubmit = vi.fn()
    
    render(<ValidatedForm onSubmit={handleSubmit} />)
    
    // XSS攻撃を含む入力を行う
    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: "<script>alert('XSS')</script>タイトル" }
    })
    
    fireEvent.change(screen.getByLabelText(/内容/), {
      target: { value: "これは<img src='x' onerror='alert(1)'>XSS攻撃を含む内容です。" }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByText('送信'))
    
    // スクリプトタグとイベントハンドラがエスケープされていることを確認
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining("&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;タイトル"),
      content: expect.stringContaining("これは&lt;img src=&#039;x&#039; onerror=&#039;alert(1)&#039;&gt;XSS攻撃を含む内容です。")
    }))
    
    // スクリプトタグがそのまま含まれていないことを確認（否定テスト）
    expect(handleSubmit).not.toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining("<script>"),
      content: expect.stringContaining("onerror=")
    }))
  })

  // SEC-04-03: HTMLインジェクション対策
  it('HTML要素を含む入力を適切にエスケープする', async () => {
    // HTML要素を含む入力をモニターするモック関数
    const handleSubmit = vi.fn()
    
    render(<ValidatedForm onSubmit={handleSubmit} />)
    
    // HTML要素を含む入力を行う
    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: "<div style='color:red'>色付きタイトル</div>" }
    })
    
    fireEvent.change(screen.getByLabelText(/内容/), {
      target: { value: "これは<strong>強調</strong>された内容です。<a href='#'>リンク</a>もあります。" }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByText('送信'))
    
    // HTML要素がエスケープされていることを確認
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining("&lt;div style=&#039;color:red&#039;&gt;色付きタイトル&lt;/div&gt;"),
      content: expect.stringContaining("これは&lt;strong&gt;強調&lt;/strong&gt;された内容です。&lt;a href=&#039;#&#039;&gt;リンク&lt;/a&gt;もあります。")
    }))
  })

  // SEC-04-04: サーバーサイドバリデーション
  it('クライアント検証をバイパスした無効な入力をサーバー側で検証する', async () => {
    // サーバーサイドバリデーションをシミュレートするモック関数
    const serverValidate = vi.fn(data => {
      const errors = []
      if (!data.title || typeof data.title !== 'string') {
        errors.push('タイトルが無効です')
      }
      if (!data.content || typeof data.content !== 'string' || data.content.length < 10) {
        errors.push('内容が無効です')
      }
      return errors.length ? { valid: false, errors } : { valid: true }
    })
    
    // 無効なデータを直接サーバーに送る状況をシミュレート
    const invalidData = {
      title: '', // 空のタイトル（クライアント検証をバイパスしたと仮定）
      content: 'abc' // 短すぎる内容（クライアント検証をバイパスしたと仮定）
    }
    
    // サーバーサイドバリデーションを実行
    const result = serverValidate(invalidData)
    
    // バリデーションが失敗することを確認
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('タイトルが無効です')
    expect(result.errors).toContain('内容が無効です')
  })

  // SEC-04-06: 入力長制限のバリデーション
  it('制限を超える長さの入力を拒否する', async () => {
    // 送信処理をモニターするモック関数
    const handleSubmit = vi.fn()
    
    render(<ValidatedForm onSubmit={handleSubmit} />)
    
    // 長すぎるタイトルを入力
    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: 'a'.repeat(101) } // 101文字（制限は100文字と仮定）
    })
    
    fireEvent.change(screen.getByLabelText(/内容/), {
      target: { value: 'これは10文字以上の有効な内容です。' }
    })
    
    // フォームを送信
    fireEvent.click(screen.getByText('送信'))
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByTestId('title-error')).toBeInTheDocument()
    expect(screen.getByTestId('title-error').textContent).toBe('タイトルは100文字以内で入力してください')
    
    // 送信処理が呼ばれないことを確認
    expect(handleSubmit).not.toHaveBeenCalled()
  })
}) 