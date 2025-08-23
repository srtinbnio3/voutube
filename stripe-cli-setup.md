# Stripe CLI 設定ガイド

## 1. 認証設定

以下のコマンドを実行し、ブラウザで認証を完了してください：

```bash
stripe login
```

認証後、以下で確認：
```bash
stripe config --list
```

## 2. ローカル開発用Webhook設定

### A. Webhookリスニング開始
```bash
# ローカル開発サーバーのWebhookエンドポイントにフォワード
stripe listen --forward-to localhost:3000/api/crowdfunding/webhook
```

### B. 特定イベントのみリスニング（推奨）
```bash
stripe listen \
  --forward-to localhost:3000/api/crowdfunding/webhook \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,payment_intent.succeeded,payment_intent.payment_failed,identity.verification_session.verified,identity.verification_session.requires_input,identity.verification_session.canceled,identity.verification_session.failed
```

## 3. Webhookシークレット取得

上記コマンド実行時に表示される`whsec_`で始まるシークレットを環境変数に設定：

```bash
# .env.local に追加
echo "STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx" >> .env.local
```

## 4. テスト実行

### A. 別ターミナルでテストイベント送信
```bash
# Checkoutセッション完了テスト
stripe trigger checkout.session.completed

# 決済成功テスト  
stripe trigger payment_intent.succeeded

# 決済失敗テスト
stripe trigger payment_intent.payment_failed
```

### B. 実際の決済テスト
1. ブラウザで `http://localhost:3000` にアクセス
2. クラウドファンディングプロジェクトで支援実行
3. テストカード使用: `4242 4242 4242 4242`

## 5. 本番環境Webhook設定

### Stripeダッシュボードでの設定
1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) にアクセス
2. 「エンドポイントを追加」をクリック
3. URL: `https://yourdomain.com/api/crowdfunding/webhook`
4. イベント選択：
   - `checkout.session.completed` ✅ **必須**
   - `checkout.session.async_payment_succeeded` 
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `identity.verification_session.verified`
   - `identity.verification_session.requires_input`
   - `identity.verification_session.canceled`
   - `identity.verification_session.failed`

### シークレット設定
作成されたWebhookの「署名シークレット」を本番環境変数に設定

## 6. 環境変数チェックリスト

```bash
# 開発環境 (.env.local)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 本番環境
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx  
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 7. ログ確認

```bash
# Webhookログを詳細表示でリアルタイム監視
stripe listen --forward-to localhost:3000/api/crowdfunding/webhook --log-level debug
```

## トラブルシューティング

### Webhook接続エラー
- ローカル開発サーバーが起動しているか確認
- ポート3000が使用可能か確認  
- ファイアウォール設定確認

### 認証エラー
- `stripe login` で再認証
- APIキーが正しく設定されているか確認

### イベント受信しない  
- イベントタイプが正しく設定されているか確認
- Webhookシークレットが正しく設定されているか確認
