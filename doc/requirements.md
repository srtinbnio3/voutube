# IdeaTube 要件定義書

## 1. 概要

IdeaTubeは、YouTuberと視聴者をつなぐラットフォームです。視聴者がYouTube企画のアイデアを投稿し、コミュニティがそれを評価することで、クリエイターが本当に求められているコンテンツを把握できるようにします。

## 2. ユーザー種別と権限

### 2.1 非ログインユーザー
- チャンネル一覧の閲覧
- チャンネル詳細の閲覧
- 投稿の閲覧
- アカウント登録
- ログイン

### 2.2 ログインユーザー
- 非ログインユーザーのすべての機能
- 投稿の作成
- 投稿への投票（いいね/よくないね）
- パスワードのリセット
- プロフィール情報の閲覧

## 3. 機能要件

### 3.1 認証機能
- メールアドレスとパスワードによるサインアップ
- メールアドレスとパスワードによるログイン
- Google認証によるログイン
- パスワードリセット機能
- ログアウト機能

### 3.2 チャンネル機能
- YouTubeチャンネルの検索と表示
- チャンネル情報の表示（名前、説明、登録者数、アイコン）
- チャンネルごとの投稿一覧表示
- チャンネルの統計情報表示（投稿数、最新投稿日時）

### 3.3 投稿機能
- チャンネルに対する新規投稿の作成
- 投稿のタイトルと本文の入力
- 投稿の一覧表示（最新順、人気順）
- 投稿の詳細表示（将来実装予定）

### 3.4 投票機能
- 投稿に対する「いいね」投票
- 投稿に対する「よくないね」投票
- 投票の取り消し
- 投票に基づく投稿のスコア計算

### 3.5 プロフィール機能
- ユーザープロフィールの自動作成（ユーザー登録時）
- ユーザー名とアバター画像の表示

## 4. 技術仕様

### 4.1 フロントエンド
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **UIライブラリ**: React
- **スタイリング**: Tailwind CSS, Shadcn UI, Radix UI
- **状態管理**: React Server Components (RSC)優先
- **認証**: Supabase Auth

### 4.2 バックエンド
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth
- **API**: Supabase API, Server Actions

### 4.3 外部連携
- **YouTube Data API**: チャンネル情報の取得

## 5. UI/UX要件

### 5.1 レスポンシブデザイン
- モバイル、タブレット、デスクトップに対応したレスポンシブレイアウト
- モバイルファーストアプローチ

### 5.2 多言語対応
- 日本語インターフェース
- 英語インターフェース（一部実装済み）

### 5.3 アクセシビリティ
- WAI-ARIAガイドラインに準拠
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 6. データモデル

### 6.1 channels（チャンネル）テーブル
- id: UUID (プライマリキー)
- youtube_channel_id: TEXT (YouTubeチャンネルID、一意)
- name: TEXT (チャンネル名)
- description: TEXT (チャンネル説明)
- subscriber_count: INTEGER (登録者数)
- icon_url: TEXT (アイコンURL)
- post_count: INTEGER (投稿数、デフォルト0)
- latest_post_at: TIMESTAMP (最新投稿日時)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

### 6.2 profiles（プロフィール）テーブル
- id: UUID (プライマリキー、auth.usersへの参照)
- username: TEXT (ユーザー名、一意)
- avatar_url: TEXT (アバターURL)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

### 6.3 posts（投稿）テーブル
- id: UUID (プライマリキー)
- channel_id: UUID (channelsテーブルへの参照)
- user_id: UUID (profilesテーブルへの参照)
- title: TEXT (投稿タイトル)
- content: TEXT (投稿内容)
- score: INTEGER (投票スコア、nullable)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

### 6.4 votes（投票）テーブル
- id: UUID (プライマリキー)
- post_id: UUID (postsテーブルへの参照)
- user_id: UUID (profilesテーブルへの参照)
- vote_type: BOOLEAN (trueでいいね、falseでよくないね)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

## 7. データベーストリガーと関数

### 7.1 create_profile_for_new_user関数とトリガー
- 新規ユーザー登録時に自動的にプロフィールを作成
- OAuth認証の場合はユーザーメタデータからユーザー名とアバターURLを取得
- 通常登録の場合はメールアドレスのローカル部分をユーザー名として使用

### 7.2 update_channel_stats関数とトリガー
- 投稿の作成・削除時にチャンネルの統計情報を更新
- 投稿数と最新投稿日時を更新

### 7.3 update_post_score関数とトリガー
- 投票の作成・更新・削除時に投稿のスコアを更新
- いいね数からよくないね数を引いた値をスコアとして計算

## 8. インデックス
- channels_post_count_idx: 投稿数降順のインデックス
- channels_latest_post_at_idx: 最新投稿日時降順のインデックス
- channels_youtube_id_idx: YouTubeチャンネルIDのインデックス
- posts_channel_score_idx: チャンネルID + スコア降順の複合インデックス
- posts_channel_created_idx: チャンネルID + 作成日時降順の複合インデックス
- votes_post_id_idx: 投稿IDのインデックス

## 9. セキュリティ要件

### 9.1 認証とアクセス制御
- Supabaseの認証システムを使用
- RLS（Row Level Security）ポリシーによるデータアクセス制御
- HTTPS通信の強制

### 9.2 データバリデーション
- サーバーサイドでのデータ検証
- クライアントサイドでのフォームバリデーション

## 10. パフォーマンス要件
- ページロード時間の最適化（Web Vitals指標の向上）
- 画像の最適化（WebP形式、サイズデータの含有、遅延ローディング）
- SSR（サーバーサイドレンダリング）とRSC（React Server Components）の活用
- データベースクエリの最適化とインデックスの適切な設定

## 11. 将来の拡張予定
- 投稿詳細ページの実装
- ユーザープロフィール編集機能
- コメント機能
- 通知システム
- ソーシャルシェア機能
- モデレーション機能

## 12. MVP（最小実行製品）の範囲
- 基本的な認証機能（登録、ログイン、ログアウト）
- チャンネル検索と表示
- 投稿の作成と表示
- 投票機能
- モバイル対応UIの基本実装

## 13. テスト要件
- ユニットテスト
- 統合テスト
- E2Eテスト
- アクセシビリティテスト
- パフォーマンステスト

---

本要件定義書は現在の実装に基づいており、アプリケーションの開発進行に伴い更新される可能性があります。 