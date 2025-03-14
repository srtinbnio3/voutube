# Supabase使用量監視システム

このスクリプトは、Supabaseの無料枠の使用状況を監視し、設定した閾値を超えた場合にSlackに通知を送信します。

## 機能

- データベースサイズの監視
- ストレージ使用量の監視
- ユーザー数の監視
- テーブルごとの行数の監視
- 警告閾値に達した場合のSlack通知

## 必要条件

- Node.js 16以上
- Supabaseプロジェクト（無料枠または有料プラン）
- GitHubリポジトリ（GitHub Actions用）
- Slack Webhook URL（通知用）

## セットアップ手順

### 1. Supabaseにデータベース関数をセットアップ

以下のSQLスクリプトをSupabaseのSQLエディタで実行してください：
`scripts/monitoring/db-functions.sql`

これにより、以下の関数が作成されます：
- `get_db_size()` - データベースのサイズを取得
- `get_table_row_counts()` - テーブルごとの行数を取得
- `get_slow_queries()` - スロークエリを取得
- `get_connection_count()` - アクティブな接続数を取得

### 2. GitHubリポジトリにシークレットを設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定してください：

- `SUPABASE_URL`: Supabaseプロジェクトの URL (例: `https://xxxxxxxxxxxx.supabase.co`)
- `SUPABASE_SERVICE_KEY`: Supabaseのサービスロールキー（Settings > API > service_role secretキー）
- `SLACK_WEBHOOK_URL`: Slack Incoming Webhook URL（オプション、通知を送信する場合）

### 3. GitHub Actionsの設定

GitHubリポジトリにある `.github/workflows/supabase-monitoring.yml` ファイルによって、6時間ごとに監視スクリプトが実行されます。

この設定は以下のように変更できます：
- 実行頻度の変更: `cron` 式を修正（例: `0 */12 * * *` で12時間ごと）
- 通知閾値の変更: `scripts/monitoring/supabase-usage.js` の `WARNING_THRESHOLD` 変数を変更

## ローカル環境での実行

ローカル環境で手動実行する場合は以下の手順に従ってください：

1. 必要な環境変数をセット
```bash
export SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
export SUPABASE_SERVICE_KEY=your-service-key
export SLACK_WEBHOOK_URL=your-slack-webhook-url
```

2. 必要なパッケージをインストール
```bash
npm install @supabase/supabase-js node-fetch
```

3. スクリプトを実行
```bash
node scripts/monitoring/supabase-usage.js
```

## カスタマイズ

### 監視項目の追加

`scripts/monitoring/supabase-usage.js` を編集して監視項目を追加できます。

### 通知方法の変更

Slack以外の通知方法（メールやDiscordなど）に変更する場合は、`sendSlackAlert` 関数を適宜修正してください。

### 閾値の変更

警告を出す閾値を変更したい場合は、`WARNING_THRESHOLD` の値を調整してください。

## トラブルシューティング

### スクリプトがエラーを返す場合

1. 環境変数が正しく設定されているか確認
2. Supabaseのサービスロールキーに十分な権限があるか確認
3. データベース関数が正しく作成されているか確認

### Slack通知が届かない場合

1. Webhook URLが正しいか確認
2. Slackのチャンネル設定を確認
3. ファイアウォールや制限がないか確認

## セキュリティ上の注意

- サービスロールキーは最高レベルの権限を持つため、厳重に管理してください
- GitHub Actionsのワークフローログにシークレット情報が表示されないよう注意してください
- セキュリティを強化するため、必要最小限の権限を持つ専用のAPIキーを作成することをお勧めします 