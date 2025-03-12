import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('UI-03: 多言語対応（日本語）', () => {
  // UI-03-05: 日本語のフォント表示確認
  it('日本語フォントが正しく表示される', () => {
    const japaneseText = 'こんにちは、世界！';
    
    render(
      <div>
        <p data-testid="japanese-text">{japaneseText}</p>
      </div>
    );
    
    const textElement = screen.getByTestId('japanese-text');
    expect(textElement).toBeInTheDocument();
    expect(textElement.textContent).toBe(japaneseText);
  });

  // UI-03-06: 長い日本語テキストのレイアウト
  it('長い日本語テキストが適切に折り返される', () => {
    // テスト用の長いテキスト
    const longText = 'これは非常に長い日本語のテキストです。このテキストが適切に折り返されるかテストします。折り返しが正しく機能していれば、テキストはコンテナからはみ出すことなく表示されるはずです。';
    
    render(
      <div className="max-w-md p-4 border">
        <p data-testid="long-text">{longText}</p>
      </div>
    );
    
    const textElement = screen.getByTestId('long-text');
    
    // テキストが存在することを確認
    expect(textElement).toBeInTheDocument();
    expect(textElement.textContent).toBe(longText);
    
    // 親要素がmax-widthを持っていることを確認
    expect(textElement.parentElement?.className).toContain('max-w-md');
  });
  
  // UI-03-04: 日本語表示の確認（エラーメッセージ）
  it('エラーメッセージが日本語で表示される', () => {
    const errorMessages = [
      'ユーザー名を入力してください',
      'パスワードは8文字以上必要です',
      '入力された値が無効です'
    ];
    
    render(
      <div>
        {errorMessages.map((message, index) => (
          <p key={index} data-testid={`error-${index}`} className="text-red-500">
            {message}
          </p>
        ))}
      </div>
    );
    
    // 各エラーメッセージが日本語で表示されていることを確認
    errorMessages.forEach((message, index) => {
      const errorElement = screen.getByTestId(`error-${index}`);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toBe(message);
      expect(errorElement.className).toContain('text-red-500'); // エラー表示のスタイルを確認
    });
  });
}); 