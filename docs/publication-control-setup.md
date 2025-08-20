# プロジェクト公開制御機能のセットアップガイド

## 概要

プロジェクトオーナーが承認後の公開タイミングを制御できる機能です。

### 新機能
- 管理者承認後、プロジェクトオーナーが手動で公開
- 公開予約（指定日時に自動公開）
- 公開予約のキャンセル・変更

## セットアップ手順

### 1. 環境変数の設定

`.env.local`に以下を追加：

```bash
# 公開予約処理用のセキュリティトークン
CRON_SECRET_TOKEN=your-secret-token-here

# Supabase Service Role Key（RLS回避用）
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 2. データベースマイグレーション

新しいマイグレーションを実行：

```bash
# Supabaseローカル環境の場合
supabase migration up

# 本番環境の場合はSupabase Dashboard経由でマイグレーションを実行
```

### 3. 公開予約の定期処理設定

Vercelの場合：

1. Vercel Dashboardでプロジェクトを選択
2. `Settings` > `Environment Variables`に環境変数を追加
3. `Settings` > `Functions` > `Cron Jobs`で以下を設定：

```
Path: /api/admin/crowdfunding/process-scheduled
Schedule: */5 * * * * (5分毎)
Method: POST
Headers: Authorization: Bearer YOUR_CRON_SECRET_TOKEN
```

他のホスティングプラットフォームの場合は、外部のcronサービス（GitHub Actions、cron-job.org等）を使用。

## API仕様

### プロジェクト公開制御

**エンドポイント**: `POST /api/crowdfunding/[id]/publish`

**パラメータ**:
- `action`: `'publish_now' | 'schedule_publish' | 'cancel_schedule'`
- `scheduledPublishAt`: 公開予約日時（ISO文字列、schedule_publishの場合のみ）

**例**:
```javascript
// 即座に公開
fetch('/api/crowdfunding/123/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'publish_now' })
});

// 公開予約
fetch('/api/crowdfunding/123/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'schedule_publish',
    scheduledPublishAt: '2025-01-20T10:00:00Z'
  })
});
```

### 公開予約処理

**エンドポイント**: `POST /api/admin/crowdfunding/process-scheduled`

**認証**: Bearer トークン（CRON_SECRET_TOKEN）

## データベーススキーマの変更

### 新しいフィールド
- `published_at`: 実際の公開日時
- `scheduled_publish_at`: 公開予約日時
- `auto_publish_enabled`: 自動公開の有効/無効

### 新しいステータス値
- `approved`: 管理者承認済み、公開待ち
- `scheduled`: 公開予約中

## ステータスフロー

```
draft → under_review → approved → active
                    ↘           ↗
                     scheduled
```

## トラブルシューティング

### よくある問題

1. **公開予約が動作しない**
   - CRON_SECRET_TOKENが正しく設定されているか確認
   - 定期実行の設定が正しいか確認

2. **権限エラー**
   - プロジェクトの所有者のみが公開制御を操作可能
   - SUPABASE_SERVICE_KEYが正しく設定されているか確認

3. **型エラー**
   - 新しいCampaignStatusが型定義に含まれているか確認

## 開発時のテスト

開発環境では以下のエンドポイントで手動実行可能：

```bash
GET /api/admin/crowdfunding/process-scheduled
```

**注意**: 本番環境では無効化されています。
