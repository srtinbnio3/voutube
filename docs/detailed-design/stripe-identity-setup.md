# Stripe Identity 本人確認機能 設定ガイド

## 概要

本機能は、Stripe Identityを使用してクラウドファンディング機能の本人確認を実装しています。
ユーザーは政府発行の身分証明書を使用して本人確認を行うことができます。

## 必要な環境変数

### 開発環境 (.env.dev)

```bash
# 既存の環境変数に加えて以下を追加

# Stripe Identity 本人確認機能
# テスト環境用のStripeキー（Stripeダッシュボードから取得）
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
```

### 本番環境 (.env.local)

```bash
# 既存の環境変数に加えて以下を追加

# Stripe Identity 本人確認機能
# 本番環境用のStripeキー（Stripeダッシュボードから取得）
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
```

## Stripe ダッシュボードでの設定

### 1. Stripe Identity の有効化

1. [Stripe ダッシュボード](https://dashboard.stripe.com) にログイン
2. 左サイドバーの「製品」→「Identity」を選択
3. 「Identity を有効にする」をクリック

### 2. API キーの取得

1. Stripe ダッシュボードの「開発者」→「API キー」を選択
2. **テストモード**の場合:
   - `STRIPE_SECRET_KEY`: `sk_test_` で始まるキー
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_` で始まるキー
3. **本番モード**の場合:
   - `STRIPE_SECRET_KEY`: `sk_live_` で始まるキー
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_` で始まるキー

### 3. Webhook エンドポイントの設定

1. Stripe ダッシュボードの「開発者」→「Webhook」を選択
2. 「エンドポイントを追加」をクリック
3. エンドポイント URL: `https://yourdomain.com/api/crowdfunding/webhook`
   - 開発環境: `http://localhost:3000/api/crowdfunding/webhook` (ngrok等を使用)
   - 本番環境: `https://yourdomain.com/api/crowdfunding/webhook`
4. 監視するイベントを選択:
   - `identity.verification_session.verified`
   - `identity.verification_session.requires_input`
   - `identity.verification_session.canceled`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 4. Webhook シークレットの取得

1. 作成したWebhookエンドポイントをクリック
2. 「署名シークレットを表示」をクリック
3. 表示されたシークレットを `STRIPE_WEBHOOK_SECRET` として設定

## 環境変数設定手順

### 開発環境の設定

```bash
# .env.devファイルに以下を追加
echo "" >> .env.dev
echo "# Stripe Identity 本人確認機能" >> .env.dev
echo "STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here" >> .env.dev
echo "STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here" >> .env.dev
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here" >> .env.dev
```

### 本番環境の設定

```bash
# .env.localファイルに以下を追加
echo "" >> .env.local
echo "# Stripe Identity 本人確認機能" >> .env.local
echo "STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here" >> .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here" >> .env.local
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here" >> .env.local
```

## データベース設定

以下のマイグレーションが適用されている必要があります：

```sql
-- 20250101000001_add_identity_verification.sql
-- identity_verificationsテーブルの作成
-- crowdfunding_campaignsテーブルへの本人確認関連フィールド追加
```

## API エンドポイント

### 本人確認セッション作成
```
POST /api/identity/verification
```

### 本人確認状況取得
```
GET /api/identity/verification?campaign_id=xxx
```

### セッション詳細取得
```
GET /api/identity/verification/[sessionId]
```

### Webhook
```
POST /api/crowdfunding/webhook
```

## フロントエンド実装

### IdentityVerificationコンポーネント

本人確認UIは `IdentityVerification` コンポーネントとして実装されています：

- 本人確認セッションの開始
- 確認状況の表示
- 確認済みデータの表示
- エラー状態の処理

### 使用方法

```tsx
import { IdentityVerification } from '@/app/crowdfunding/[id]/edit/_components/sections/identity-verification'

<IdentityVerification 
  campaign={campaign} 
  userId={userId} 
/>
```

## 本人確認フロー

1. **開始**: ユーザーが「本人確認を開始」ボタンをクリック
2. **セッション作成**: API が Stripe Identity セッションを作成
3. **Stripe画面**: ユーザーがStripeの本人確認画面にリダイレクト
4. **書類撮影**: 身分証明書とセルフィーを撮影
5. **結果通知**: Webhook で結果を受信・データベース更新
6. **完了表示**: アプリで確認済み状態を表示

## 対応書類

- 運転免許証
- パスポート
- マイナンバーカード
- その他政府発行身分証明書

## セキュリティ

- すべての通信はHTTPS経由
- Webhook署名検証による改ざん防止
- Row Level Security (RLS) による適切なアクセス制御
- 最小限の個人情報のみ保存

## トラブルシューティング

### よくある問題

1. **Webhook が動作しない**
   - `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認
   - Webhook URL がHTTPSかつアクセス可能か確認

2. **本人確認セッションが作成できない**
   - `STRIPE_SECRET_KEY` が正しく設定されているか確認
   - Stripe Identity が有効になっているか確認

3. **画面が表示されない**
   - ユーザーが認証済みか確認
   - キャンペーンの所有者権限があるか確認

### ログ確認

本人確認関連のログは `🔐` プレフィックスで出力されます：

```bash
# 開発環境での確認
npm run dev

# ログ例
🔐 本人確認セッション作成API開始
🔐 Stripe本人確認セッション作成完了: { sessionId: 'vs_xxx' }
🔐 本人確認成功webhook処理開始: { sessionId: 'vs_xxx' }
```

## 本番環境への移行

1. Stripe を本番モードに切り替え
2. 本番用の API キーを設定
3. 本番用の Webhook エンドポイントを設定
4. HTTPS ドメインでの動作確認

## 関連ファイル

- `app/crowdfunding/[id]/edit/_components/sections/identity-verification.tsx`
- `app/api/identity/verification/route.ts`
- `app/api/identity/verification/[sessionId]/route.ts`
- `app/api/crowdfunding/webhook/route.ts`
- `app/lib/stripe.ts`
- `supabase/migrations/20250101000001_add_identity_verification.sql` 