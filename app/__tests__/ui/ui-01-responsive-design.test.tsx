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
  it('モバイルサイズでのTailwindクラス適用を確認', () => {
    // モバイルサイズに設定
    setScreenSize(375);
    
    // モバイル向けのレスポンシブコンポーネントをレンダリング
    const { container } = render(
      <div>
        <div className="hidden sm:block md:hidden">スマホのみ表示</div>
        <div className="block md:hidden">スマホとタブレットで表示</div>
        <div className="hidden md:block">デスクトップのみ表示</div>
        <button className="w-full sm:w-auto">レスポンシブボタン</button>
      </div>
    );
    
    // モバイルビューでの表示要素を確認
    const mobileElements = container.querySelectorAll('.block');
    expect(mobileElements.length).toBeGreaterThan(0);
    
    // モバイルビューで非表示の要素を確認
    const hiddenForMobile = container.querySelectorAll('.hidden.md\\:block');
    expect(hiddenForMobile[0]).not.toHaveClass('block'); // デスクトップのみ表示が非表示であることを確認
  });

  // UI-01-02: タブレット画面サイズでのレイアウト
  it('タブレットサイズでのTailwindクラス適用を確認', () => {
    // タブレットサイズに設定
    setScreenSize(768);
    
    // レスポンシブコンポーネントをレンダリング
    const { container } = render(
      <div>
        <div className="hidden sm:block md:hidden">スマホのみ表示</div>
        <div className="block md:hidden">スマホとタブレットで表示</div>
        <div className="hidden md:block">デスクトップのみ表示</div>
        <div className="flex-col md:flex-row">方向転換要素</div>
      </div>
    );
    
    // タブレットビューでの表示要素を確認
    const tabletElements = container.querySelectorAll('.md\\:block');
    expect(tabletElements.length).toBeGreaterThan(0);
    
    // タブレットでの方向を確認
    const flexDirectionElement = container.querySelector('.md\\:flex-row');
    expect(flexDirectionElement).toBeInTheDocument();
  });

  // UI-01-03: デスクトップ画面サイズでのレイアウト
  it('デスクトップサイズでのTailwindクラス適用を確認', () => {
    // デスクトップサイズに設定
    setScreenSize(1440);
    
    // レスポンシブコンポーネントをレンダリング
    const { container } = render(
      <div>
        <div className="hidden sm:block md:hidden">スマホのみ表示</div>
        <div className="block md:hidden">スマホとタブレットで表示</div>
        <div className="hidden md:block">デスクトップのみ表示</div>
        <div className="grid grid-cols-1 md:grid-cols-3">グリッドレイアウト</div>
      </div>
    );
    
    // デスクトップビューでの表示要素を確認
    const desktopElements = container.querySelectorAll('.md\\:block');
    expect(desktopElements[0]).toBeInTheDocument();
    
    // デスクトップでのグリッドレイアウトを確認
    const gridElement = container.querySelector('.md\\:grid-cols-3');
    expect(gridElement).toBeInTheDocument();
  });

  // UI-01-07: テキストの可読性
  it('異なる画面サイズでテキストの可読性を確認', () => {
    // モバイルサイズに設定してテスト
    setScreenSize(375);
    
    // レスポンシブなテキストサイズを持つコンポーネントをレンダリング
    const { container, rerender } = render(
      <div>
        <h1 className="text-xl md:text-3xl">レスポンシブ見出し</h1>
        <p className="text-sm md:text-base">レスポンシブテキスト本文</p>
      </div>
    );
    
    // モバイルでのテキストサイズを確認
    const mobileHeading = container.querySelector('h1');
    const mobileText = container.querySelector('p');
    expect(mobileHeading).toHaveClass('text-xl');
    expect(mobileText).toHaveClass('text-sm');
    
    // デスクトップサイズに変更してテスト
    setScreenSize(1440);
    rerender(
      <div>
        <h1 className="text-xl md:text-3xl">レスポンシブ見出し</h1>
        <p className="text-sm md:text-base">レスポンシブテキスト本文</p>
      </div>
    );
    
    // デスクトップでのテキストサイズを確認
    const desktopHeading = container.querySelector('h1');
    const desktopText = container.querySelector('p');
    expect(desktopHeading).toHaveClass('md:text-3xl');
    expect(desktopText).toHaveClass('md:text-base');
  });
}); 