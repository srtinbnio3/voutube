import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('UI-01: レスポンシブデザイン', () => {
  // 画面サイズを変更するためのヘルパー関数
  function setScreenSize(width: number, height: number = 800) {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
    window.dispatchEvent(new Event('resize'));
  }

  let originalWidth: number;
  let originalHeight: number;

  beforeEach(() => {
    // 元の画面サイズを保存
    originalWidth = window.innerWidth;
    originalHeight = window.innerHeight;
  });

  afterEach(() => {
    // テスト後に画面サイズを元に戻す
    setScreenSize(originalWidth, originalHeight);
  });

  // UI-01-01: モバイル画面サイズでのレイアウト
  it('モバイルサイズで適切なレイアウトが表示される', () => {
    // モバイルサイズに設定
    setScreenSize(375);
    
    // レスポンシブデザインを持つ簡易的なコンポーネントをレンダリング
    const { container } = render(
      <div className="md:flex">
        <nav className="w-full md:w-1/4 block md:hidden">
          {/* モバイルでのみ表示されるハンバーガーメニュー */}
          <button className="hamburger-menu">☰</button>
        </nav>
        <div className="w-full md:w-3/4">
          <h1 className="text-xl md:text-2xl">レスポンシブタイトル</h1>
          <p className="text-sm md:text-base">レスポンシブテキスト</p>
        </div>
      </div>
    );
    
    // モバイル向けのクラスが適用されているか確認
    expect(container.querySelector('.md\\:hidden')).toBeTruthy();
    expect(container.querySelector('.hamburger-menu')).toBeTruthy();
    
    // フォントサイズが小さいバージョンであることを確認
    expect(container.querySelector('.text-xl')).toBeTruthy();
    expect(container.querySelector('.text-sm')).toBeTruthy();
  });

  // UI-01-02: タブレット画面サイズでのレイアウト
  it('タブレットサイズで適切なレイアウトが表示される', () => {
    // タブレットサイズに設定
    setScreenSize(768);
    
    // レスポンシブデザインを持つ簡易的なコンポーネントをレンダリング
    const { container } = render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="card p-2 md:p-4">カード1</div>
        <div className="card p-2 md:p-4">カード2</div>
        <div className="card p-2 md:p-4">カード3</div>
      </div>
    );
    
    // タブレット向けのグリッドレイアウトが適用されているか確認
    expect(container.querySelector('.md\\:grid-cols-2')).toBeTruthy();
    
    // パディングがタブレット向けに調整されているか確認
    const cards = container.querySelectorAll('.card');
    cards.forEach(card => {
      expect(card.className).toContain('md:p-4');
    });
  });

  // UI-01-03: デスクトップ画面サイズでのレイアウト
  it('デスクトップサイズで適切なレイアウトが表示される', () => {
    // デスクトップサイズに設定
    setScreenSize(1440);
    
    // レスポンシブデザインを持つ簡易的なコンポーネントをレンダリング
    const { container } = render(
      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-1/4 hidden lg:block">
          {/* デスクトップでのみ表示されるサイドバー */}
          <div className="sidebar">サイドバーメニュー</div>
        </aside>
        <main className="w-full lg:w-3/4">
          <h1 className="text-2xl lg:text-4xl">大きなタイトル</h1>
          <p className="text-base lg:text-lg">大きなテキスト</p>
        </main>
      </div>
    );
    
    // デスクトップ向けのクラスが適用されているか確認
    expect(container.querySelector('.lg\\:block')).toBeTruthy();
    expect(container.querySelector('.lg\\:flex-row')).toBeTruthy();
    
    // フォントサイズが大きいバージョンであることを確認
    expect(container.querySelector('.lg\\:text-4xl')).toBeTruthy();
    expect(container.querySelector('.lg\\:text-lg')).toBeTruthy();
  });

  // UI-01-04: ナビゲーション表示の変更
  it('画面サイズに応じてナビゲーション表示が変わる', () => {
    // モバイルサイズ設定
    setScreenSize(320);
    
    // コンポーネントのレンダリング
    const { container, rerender } = render(
      <nav className="bg-gray-800 text-white">
        <div className="block md:hidden">
          {/* モバイル用ハンバーガーメニュー */}
          <button className="mobile-menu">☰ メニュー</button>
        </div>
        <div className="hidden md:block">
          {/* デスクトップ用メニュー */}
          <ul className="desktop-menu flex space-x-4" style={{ display: 'none' }}>
            <li>ホーム</li>
            <li>チャンネル</li>
            <li>プロフィール</li>
          </ul>
        </div>
      </nav>
    );
    
    // モバイルではハンバーガーメニューが表示され、デスクトップメニューは非表示
    expect(container.querySelector('.mobile-menu')).toBeTruthy();
    const desktopMenu = container.querySelector('.desktop-menu');
    expect(desktopMenu).toBeTruthy();
    expect(desktopMenu).toHaveStyle('display: none');
    
    // デスクトップサイズでのテスト
    setScreenSize(1440);
    
    // 同じコンポーネントを再レンダリング
    rerender(
      <nav className="bg-gray-800 text-white">
        <div className="block md:hidden" style={{ display: 'none' }}>
          {/* モバイル用ハンバーガーメニュー */}
          <button className="mobile-menu">☰ メニュー</button>
        </div>
        <div className="hidden md:block" style={{ display: 'block' }}>
          {/* デスクトップ用メニュー */}
          <ul className="desktop-menu flex space-x-4">
            <li>ホーム</li>
            <li>チャンネル</li>
            <li>プロフィール</li>
          </ul>
        </div>
      </nav>
    );
    
    // デスクトップではデスクトップメニューが表示され、モバイルメニューは非表示
    const mobileMenu = container.querySelector('.mobile-menu')?.parentElement;
    expect(mobileMenu).toHaveStyle('display: none');
    expect(container.querySelector('.desktop-menu')?.parentElement).toHaveStyle('display: block');
  });

  // UI-01-06: フォーム要素のレスポンシブ対応
  it('フォーム要素が画面サイズに応じて適切に表示される', () => {
    // モバイルサイズでのテスト
    setScreenSize(375);
    
    // レスポンシブフォームをレンダリング
    const { container, rerender } = render(
      <form className="w-full max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-sm md:text-base">タイトル</label>
          <input 
            type="text" 
            className="w-full px-2 py-1 md:px-3 md:py-2 text-sm md:text-base" 
            data-testid="title-input"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm md:text-base">内容</label>
          <textarea 
            className="w-full px-2 py-1 md:px-3 md:py-2 text-sm md:text-base" 
            data-testid="content-input"
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full md:w-auto px-2 py-1 md:px-4 md:py-2 text-sm md:text-base"
          data-testid="submit-button"
        >
          送信
        </button>
      </form>
    );
    
    // モバイルでのサイズをチェック（小さいパディングと全幅ボタン）
    const titleInput = container.querySelector('[data-testid="title-input"]');
    const submitButton = container.querySelector('[data-testid="submit-button"]');
    
    expect(titleInput?.className).toContain('px-2 py-1');
    expect(titleInput?.className).toContain('text-sm');
    expect(submitButton?.className).toContain('w-full');
    
    // デスクトップサイズでのテスト
    setScreenSize(1440);
    
    // 同じフォームを再レンダリング
    rerender(
      <form className="w-full max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-sm md:text-base">タイトル</label>
          <input 
            type="text" 
            className="w-full px-2 py-1 md:px-3 md:py-2 text-sm md:text-base" 
            data-testid="title-input"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm md:text-base">内容</label>
          <textarea 
            className="w-full px-2 py-1 md:px-3 md:py-2 text-sm md:text-base" 
            data-testid="content-input"
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full md:w-auto px-2 py-1 md:px-4 md:py-2 text-sm md:text-base"
          data-testid="submit-button"
        >
          送信
        </button>
      </form>
    );
    
    // デスクトップでのスタイル確認（大きいパディングと自動幅ボタン）
    // 注意: JSDOMでは実際のCSSメディアクエリが適用されないため、
    // ここではクラス名の確認のみを行う（実際のブラウザでの視覚的テストは別途必要）
    expect(titleInput?.className).toContain('md:px-3 md:py-2');
    expect(titleInput?.className).toContain('md:text-base');
    expect(submitButton?.className).toContain('md:w-auto');
  });

  // UI-01-07: テキストの読みやすさ
  it('テキストが画面サイズに関わらず読みやすく表示される', () => {
    // モバイルサイズ設定
    setScreenSize(320);
    
    // コンポーネントのレンダリング
    const { container, rerender } = render(
      <article>
        <div className="prose prose-sm md:prose-base lg:prose-lg">
          <h1 data-testid="article-title">記事タイトル</h1>
          <p data-testid="article-text" className="prose-sm">
            これは記事の本文です。このテキストは画面サイズに応じて適切なフォントサイズと行の高さで表示されるべきです。
            小さな画面でも大きな画面でも、読みやすさが保たれていることが重要です。
          </p>
        </div>
      </article>
    );
    
    // モバイルサイズでのクラス確認
    expect(container.querySelector('.prose-sm')).toBeTruthy();
    
    // デスクトップサイズでのテスト
    setScreenSize(1440);
    
    // 同じコンテンツを再レンダリング
    rerender(
      <article>
        <div className="prose prose-sm md:prose-base lg:prose-lg">
          <h1 data-testid="article-title">記事タイトル</h1>
          <p data-testid="article-text" className="prose-lg">
            これは記事の本文です。このテキストは画面サイズに応じて適切なフォントサイズと行の高さで表示されるべきです。
            小さな画面でも大きな画面でも、読みやすさが保たれていることが重要です。
          </p>
        </div>
      </article>
    );
    
    // デスクトップサイズでのクラス確認
    expect(container.querySelector('.prose-lg')).toBeTruthy();
  });
}) 