# IdeaTube E2Eテスト仕様書

## 1. 概要

このドキュメントでは、IdeaTubeアプリケーションのE2E（エンドツーエンド）テストの仕様を定義します。Playwrightフレームワークを使用して、実際のブラウザ環境でユーザーの行動を模倣し、アプリケーション全体の機能を検証します。

## 2. テスト環境

### 2.1 テストツール
- Playwright
- TypeScript
- GitHub Actions（CI環境）

### 2.2 テスト対象ブラウザ
- Chromium
- Firefox
- WebKit（Safari）

### 2.3 テストデータ
- テスト用Supabaseプロジェクト
- テストユーザーアカウント
- サンプルYouTubeチャンネルID

## 3. テストシナリオ

### 3.1 基本フロー

#### E2E-BASIC-001: 新規ユーザーの基本フロー
**概要**: 新規ユーザーが登録からチャンネル追加、投稿作成までを行う
**ステップ**:
1. トップページにアクセス
2. サインアップページに移動
3. アカウント登録
4. メール確認
5. チャンネル検索
6. 投稿作成
7. ログアウト

```typescript
test('新規ユーザーの基本フロー', async ({ page }) => {
  await page.goto('/')
  await page.click('text=サインアップ')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('text=アカウント作成')
  // ... 以降のステップ
})
```

### 3.2 認証機能

#### E2E-AUTH-001: メールアドレスによるサインアップ
**ステップ**:
1. サインアップページにアクセス
2. メールアドレスとパスワードを入力
3. アカウント作成ボタンをクリック
4. メール確認ページの表示を確認
5. メール確認リンクをクリック
6. ダッシュボードへのリダイレクトを確認

#### E2E-AUTH-002: Google認証によるログイン
**ステップ**:
1. ログインページにアクセス
2. Googleログインボタンをクリック
3. Googleログインフォームでの認証
4. ダッシュボードへのリダイレクトを確認

### 3.3 チャンネル機能

#### E2E-CHAN-001: チャンネルの検索と追加
**ステップ**:
1. ダッシュボードにアクセス
2. チャンネル検索フォームを表示
3. YouTubeチャンネルIDを入力
4. 検索実行
5. チャンネル情報の表示確認
6. チャンネル追加
7. チャンネル一覧での表示確認

#### E2E-CHAN-002: チャンネル一覧の操作
**ステップ**:
1. チャンネル一覧ページにアクセス
2. 投稿数でのソート
3. 最新投稿日時でのソート
4. チャンネル詳細表示

### 3.4 投稿機能

#### E2E-POST-001: 投稿の作成と表示
**ステップ**:
1. チャンネル詳細ページにアクセス
2. 新規投稿ボタンをクリック
3. タイトルと本文を入力
4. 投稿を作成
5. 投稿一覧での表示確認
6. チャンネル統計の更新確認

#### E2E-POST-002: 投稿の並び替えと投票
**ステップ**:
1. 投稿一覧ページにアクセス
2. 人気順でソート
3. いいね投票を実行
4. スコアの更新確認
5. 新着順でソート
6. 表示順の変更確認

### 3.5 投票機能

#### E2E-VOTE-001: 投票操作の一連フロー
**ステップ**:
1. 投稿詳細表示
2. いいね投票
3. 投票状態の確認
4. 投票の取り消し
5. よくないね投票
6. スコアの更新確認

## 4. テストの実装

### 4.1 ページオブジェクトモデル
```typescript
// pages/auth.page.ts
export class AuthPage {
  constructor(private page: Page) {}

  async signup(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="signup-button"]')
  }
}

// pages/channel.page.ts
export class ChannelPage {
  constructor(private page: Page) {}

  async searchChannel(channelId: string) {
    await this.page.fill('[data-testid="channel-search-input"]', channelId)
    await this.page.click('[data-testid="search-button"]')
  }
}
```

### 4.2 テストフィクスチャー
```typescript
// fixtures/test-data.ts
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
}

export const TEST_CHANNEL = {
  id: 'UC...',
  name: 'Test Channel'
}
```

### 4.3 カスタムアサーション
```typescript
// utils/assertions.ts
export async function expectToBeOnDashboard(page: Page) {
  await expect(page).toHaveURL(/.*\/dashboard/)
  await expect(page.locator('h1')).toContainText('ダッシュボード')
}
```

## 5. テスト実行環境

### 5.1 ローカル環境
```bash
# テストの実行
npx playwright test

# 特定のブラウザでのテスト
npx playwright test --project=chromium
```

### 5.2 CI環境
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
```

## 6. テスト実行計画

### 6.1 実行タイミング
- プルリクエスト作成時
- mainブランチへのマージ時
- 定期実行（毎日深夜）

### 6.2 実行順序
1. 認証関連テスト
2. チャンネル管理テスト
3. 投稿管理テスト
4. 投票システムテスト

### 6.3 パラレル実行
- 独立したテストケースは並列実行
- ブラウザごとに並列実行
- CIでのシャーディング設定

## 7. エラーハンドリング

### 7.1 リトライ戦略
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  timeout: 30000,
  expect: {
    timeout: 5000
  }
})
```

### 7.2 スクリーンショット
- テスト失敗時に自動キャプチャ
- ステップごとのスクリーンショット保存
- CIでの成果物保存

### 7.3 動画記録
- 失敗したテストの実行動画保存
- CIでの成果物としてアップロード

## 8. メンテナンス

### 8.1 定期的なメンテナンス
- セレクターの更新
- テストデータの更新
- 新機能のテストケース追加

### 8.2 パフォーマンス最適化
- 実行時間の監視
- 不要なwaitの削除
- テストの並列実行設定

### 8.3 レポーティング
- テスト実行結果のレポート生成
- 失敗したテストの分析
- トレンド分析とボトルネックの特定

---

このE2Eテスト仕様書は、アプリケーションの変更に応じて継続的に更新されます。 