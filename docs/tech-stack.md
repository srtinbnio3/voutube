# 技術スタック概要 — srtinbnio3/voutube

## 1) エグゼクティブサマリー  
- Next.js (App Router) + React 19 + TypeScript 5 によりフロント・バックエンド一体のフルスタック構成。API Routes / Server Actions を BFF として活用し、SSR + CSR ハイブリッドを実現 [1][2].  
- データ層は Supabase（PostgreSQL・Auth・Storage）。決済/本人確認は Stripe、動画情報は YouTube Data API、AI 生成は Google Gemini など多彩な外部サービスと連携 [1][5][6][7].  
- UI は Tailwind CSS + Radix UI + shadcn/ui。データ取得は SWR。テストは Vitest + RTL。GitHub Actions と（想定）Vercel で CI/CD・Cron を運用 [1][2][10][11].  

## 2) 全体像（サマリ）  
- **フレームワーク**: Next.js, React, TypeScript [1][2]  
- **データ/認証**: Supabase (Postgres, Auth, Storage) [1][8]  
- **連携**: Stripe, YouTube Data API, Google Gemini, 郵便番号API, 銀行API [1][4][5][6][12][13]  
- **スタイル/UI**: Tailwind, Radix UI, shadcn/ui [1][2][9]  
- **取得/状態**: SWR [1][14]  
- **テスト**: Vitest, @testing-library/react, jsdom [1][10]  
- **運用**: GitHub Actions, (Vercel), Web Vitals 収集 [2][11][15]  

## 3) カテゴリ別スタック  

### フロントエンド  
- Next.js (App Router) [1][2]  
- React 19 [1]  
- TypeScript 5.x [1]  
- web-vitals でパフォーマンス測定 [1][15]  

### バックエンド / サーバー  
- Next.js API Routes / Server Actions による BFF [2]  
- node-fetch による外部 API 呼び出し [1]  

### データベース・認証・ストレージ  
- Supabase PostgreSQL + Row Level Security [1][8]  
- Supabase Auth（メール / OAuth） [1][8]  
- Supabase Storage（画像等） [1]  

### UI / スタイリング  
- Tailwind CSS 3 + tailwindcss-animate + typography plugin [1][9]  
- Radix UI コンポーネント (Dialog / Select / Toast など) [1]  
- shadcn/ui パターンでデザインシステム構築 [2]  

### データ取得 / 状態管理  
- SWR (再検証制御・重複防止設定を libs/swr.ts に定義) [1][14]  

### 外部サービス / 連携 API  
- Stripe PaymentIntents, Webhook, Identity Verification [1][4][5]  
- YouTube Data API (検索・チャンネル情報取得) [1][6]  
- Google Gemini でクラファンストーリー自動生成 [1][7]  
- digital-address.app で郵便番号→住所変換 [12]  
- bank.teraren.com で銀行/支店検索 [13]  

### 画像 / メディア処理  
- sharp で画像リサイズ・最適化 [1]  
- canvas 依存でサーバーサイド描画補助 [1]  

### テスト / 品質  
- Vitest ＋ jsdom 環境 [1][10]  
- @testing-library/react / jest-dom で UI テスト [1]  
- typecheck をテスト時に実行（vitest.config.ts） [10]  

### ビルド / デプロイ / CI  
- next build / next start スクリプト [1]  
- GitHub Actions で自動テスト・Supabase/YouTube API 使用量監視 [11][16]  
- Vercel へのデプロイ & Cron Jobs 設定例（README / docs 記載） [2][4]  

### モニタリング / 分析  
- Web Vitals データを API で収集し Slack 通知 [15]  
- Supabase / YouTube API 使用量を定期監視 (cron) [11][16]  

### 型 / バリデーション  
- TypeScript 全面採用 [1]  
- zod で API / フォーム入力のスキーマ検証 [1]  

### ユーティリティ / その他  
- lodash, date-fns, clsx, lucide-react, resend など汎用ライブラリ [1]  

## 4) 参考: 主要領域 × 代表技術 対応表  

| 領域 | 代表技術 / サービス | 備考 |
|------|------------------|------|
| フロントエンド | Next.js, React, TypeScript | App Router [1][2] |
| データ | Supabase (DB/Auth/Storage) | SSR クッキー連携 [8] |
| スタイリング | Tailwind, Radix UI, shadcn/ui | デザインシステム [1][2][9] |
| 外部連携 | Stripe, YouTube API, Gemini | 決済/動画/生成 [4][5][6][7] |
| テスト | Vitest, RTL | jsdom 環境 [10] |
| 運用 | GitHub Actions, (Vercel) | 監視/CI・Cron [2][11][16] |

## 5) Sources  
1. [package.json](https://github.com/srtinbnio3/voutube/blob/main/package.json)  
2. [README.md](https://github.com/srtinbnio3/voutube/blob/main/README.md)  
3. [docs/system-architecture.md](https://github.com/srtinbnio3/voutube/blob/main/docs/system-architecture.md)  
4. [docs/publication-control-setup.md](https://github.com/srtinbnio3/voutube/blob/main/docs/publication-control-setup.md)  
5. [docs/detailed-design/stripe-identity-setup.md](https://github.com/srtinbnio3/voutube/blob/main/docs/detailed-design/stripe-identity-setup.md)  
6. [app/api/youtube/search/route.ts](https://github.com/srtinbnio3/voutube/blob/main/app/api/youtube/search/route.ts)  
7. [app/api/crowdfunding/generate-story/route.ts](https://github.com/srtinbnio3/voutube/blob/main/app/api/crowdfunding/generate-story/route.ts)  
8. [utils/supabase/server.ts](https://github.com/srtinbnio3/voutube/blob/main/utils/supabase/server.ts)  
9. [tailwind.config.ts](https://github.com/srtinbnio3/voutube/blob/main/tailwind.config.ts)  
10. [vitest.config.ts](https://github.com/srtinbnio3/voutube/blob/main/vitest.config.ts)  
11. [.github/workflows/supabase-monitoring.yml](https://github.com/srtinbnio3/voutube/blob/main/.github/workflows/supabase-monitoring.yml)  
12. [app/api/postal-code/route.ts](https://github.com/srtinbnio3/voutube/blob/main/app/api/postal-code/route.ts)  
13. [app/api/banks/search/route.ts](https://github.com/srtinbnio3/voutube/blob/main/app/api/banks/search/route.ts)  
14. [app/lib/swr.ts](https://github.com/srtinbnio3/voutube/blob/main/app/lib/swr.ts)  
15. [app/api/analytics/vitals/route.ts](https://github.com/srtinbnio3/voutube/blob/main/app/api/analytics/vitals/route.ts)  
16. [.github/workflows/youtube-api-monitoring.yml](https://github.com/srtinbnio3/voutube/blob/main/.github/workflows/youtube-api-monitoring.yml)  
