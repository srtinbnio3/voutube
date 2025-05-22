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
- クラウドファンディングへの支援
- 支援履歴の閲覧

### 2.3 チャンネルオーナー
- ログインユーザーのすべての機能
- クラウドファンディングの作成
- 支援者管理
- 特典管理
- プロジェクト更新情報の投稿

### 2.4 管理者
- チャンネルオーナーのすべての機能
- プロジェクトの審査
- ユーザー管理
- 決済管理
- サイト統計の確認

## 3. 機能要件

### 3.1 認証機能
- Google認証によるログイン
- ログアウト機能

**注：メールアドレスとパスワードによる認証（サインアップ、ログイン、パスワードリセット）は廃止されました。**

### 3.2 チャンネル機能
- YouTubeチャンネルの検索と表示
- チャンネル情報の表示（名前、説明、登録者数、アイコン）
- チャンネルごとの投稿一覧表示
- チャンネルの統計情報表示（投稿数、最新投稿日時）

### 3.3 投稿機能
- チャンネルに対する新規投稿の作成
- 投稿のタイトルと本文の入力
- 投稿の一覧表示（最新順、人気順）
- 投稿の詳細表示

### 3.4 投票機能
- 投稿に対する「いいね」投票
- 投稿に対する「よくないね」投票
- 投票の取り消し
- 投票に基づく投稿のスコア計算

### 3.5 プロフィール機能
- ユーザープロフィールの自動作成（ユーザー登録時）
- ユーザー名とアバター画像の表示

### 3.6 クラウドファンディング機能
- チャンネルオーナーによる企画のクラウドファンディング開始(チャンネルオーナーが投稿された企画から良いアイデアを見つけた場合、企画詳細ページからクラウドファンディングを開始可能)
- 目標金額の設定（All in型：目標金額の達成に関わらず、集まった支援金を受け取る方式）
- 支援期間の設定
- 支援者への特典設定
- 支援金の受け取り（Stripe決済）
- 支援状況の表示
- 支援履歴の管理
- プロジェクト更新情報の投稿
- 支援者への通知
- 管理者による審査プロセス
- 企画者への報酬還元（集まった資金の3%）
- 報酬受け取りの意思確認と振込先情報の登録
- 月次報酬支払い（毎月15日、前月末までの確定分）
- 最低報酬還元額の設定（5万円以上）

### 3.7 プロジェクト管理機能
- プロジェクトの作成と編集
- プロジェクト画像・動画アップロード機能
- プロジェクトの審査と公開
- 支援状況のリアルタイム表示
- 支援者情報の管理
- プロジェクト更新情報の管理
- 支援者へのメッセージ配信（将来実装予定）
- FAQ管理（将来実装予定）

### 3.8 支援管理機能
- 支援履歴の確認
- 特典の配送状況確認
- プロジェクト更新通知の受信
- 発案者への質問機能（将来実装予定）
- お気に入りプロジェクトの管理（将来実装予定）

### 3.9 コミュニケーション機能
- プロジェクト更新情報の通知
- 支援完了通知
- 特典発送通知
- システムお知らせ
- SNS連携による共有機能

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
- **決済**: Stripe API

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

### 6.5 crowdfunding_campaigns（クラウドファンディング）テーブル
- id: UUID (プライマリキー)
- post_id: UUID (postsテーブルへの参照)
- channel_id: UUID (channelsテーブルへの参照)
- title: TEXT (キャンペーンタイトル)
- description: TEXT (キャンペーン説明)
- target_amount: INTEGER (目標金額)
- current_amount: INTEGER (現在の支援金額)
- start_date: TIMESTAMP (開始日時)
- end_date: TIMESTAMP (終了日時)
- status: TEXT (draft, active, completed, cancelled)
- reward_enabled: BOOLEAN (報酬受け取りの意思)
- bank_account_info: JSONB (振込先情報)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

### 6.6 crowdfunding_rewards（支援特典）テーブル
- id: UUID (プライマリキー)
- campaign_id: UUID (crowdfunding_campaignsテーブルへの参照)
- title: TEXT (特典タイトル)
- description: TEXT (特典説明)
- amount: INTEGER (支援金額)
- quantity: INTEGER (特典数量)
- remaining_quantity: INTEGER (残り数量)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

### 6.7 crowdfunding_supporters（支援者）テーブル
- id: UUID (プライマリキー)
- campaign_id: UUID (crowdfunding_campaignsテーブルへの参照)
- user_id: UUID (profilesテーブルへの参照)
- reward_id: UUID (crowdfunding_rewardsテーブルへの参照)
- amount: INTEGER (支援金額)
- payment_status: TEXT (pending, completed, failed)
- stripe_payment_id: TEXT (Stripe決済ID)
- created_at: TIMESTAMP (作成日時)
- updated_at: TIMESTAMP (更新日時)

### 6.8 creator_rewards（企画者報酬）テーブル
- id: UUID (プライマリキー)
- campaign_id: UUID (crowdfunding_campaignsテーブルへの参照)
- amount: INTEGER (報酬金額)
- payment_status: TEXT (pending, paid)
- payment_date: TIMESTAMP (支払日)
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

### 7.4 update_campaign_status関数とトリガー
- キャンペーンのステータスを自動更新
- 終了日時到達時にステータスをcompletedに更新
- 目標金額達成時にステータスをcompletedに更新

### 7.5 update_campaign_amount関数とトリガー
- 支援が完了した際にキャンペーンの現在の支援金額を更新
- 支援特典の残り数量を更新

### 7.6 calculate_creator_reward関数とトリガー
- クラウドファンディング終了時に報酬を計算
- 最低報酬還元額（5万円）をチェック
- 報酬金額（支援金額の5%）を計算
- creator_rewardsテーブルに報酬情報を登録

## 8. インデックス
- channels_post_count_idx: 投稿数降順のインデックス
- channels_latest_post_at_idx: 最新投稿日時降順のインデックス
- channels_youtube_id_idx: YouTubeチャンネルIDのインデックス
- posts_channel_score_idx: チャンネルID + スコア降順の複合インデックス
- posts_channel_created_idx: チャンネルID + 作成日時降順の複合インデックス
- votes_post_id_idx: 投稿IDのインデックス
- crowdfunding_campaigns_status_idx: ステータスのインデックス
- crowdfunding_campaigns_channel_idx: チャンネルIDのインデックス
- crowdfunding_supporters_campaign_idx: キャンペーンIDのインデックス
- crowdfunding_rewards_campaign_idx: キャンペーンIDのインデックス

## 9. セキュリティ要件

### 9.1 認証とアクセス制御
- Supabaseの認証システムを使用
- RLS（Row Level Security）ポリシーによるデータアクセス制御
- HTTPS通信の強制

### 9.2 データバリデーション
- サーバーサイドでのデータ検証
- クライアントサイドでのフォームバリデーション

### 9.3 決済セキュリティ
- Stripeのセキュアな決済システムの利用
- 決済情報の暗号化
- 不正アクセス防止のための認証強化

### 9.4 報酬管理セキュリティ
- 振込先情報の暗号化保存
- 報酬計算の自動化と監査ログ
- 不正な報酬支払いの防止
- 報酬支払い履歴の管理

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
- クラウドファンディングの進捗レポート機能
- 支援者向けの特典管理システム
- 自動課金システム
- 支援者限定コンテンツ配信
- プロジェクトカテゴリ機能
- プロジェクトタグ機能
- 支援者へのメッセージ配信機能
- FAQ管理機能
- プロジェクト検索・フィルタリング機能
- おすすめプロジェクト表示機能
- 売上レポート機能
- ユーザー統計機能
- カテゴリ別人気分析機能
- 不正検知機能

## 12. MVP（最小実行製品）の範囲
- 基本的な認証機能（登録、ログイン、ログアウト）
- チャンネル検索と表示
- 投稿の作成と表示
- 投票機能
- モバイル対応UIの基本実装
- 基本的なクラウドファンディング機能
- Stripe決済の統合
- 支援特典の管理
- 支援状況の表示

## 13. テスト要件
- ユニットテスト
- 統合テスト
- E2Eテスト
- アクセシビリティテスト
- パフォーマンステスト

---

本要件定義書は現在の実装に基づいており、アプリケーションの開発進行に伴い更新される可能性があります。 