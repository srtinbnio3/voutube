# クラウドファーストな開発環境構築ガイド

## 概要
ローカル開発ではなく、本番環境により近いクラウド環境で開発を行うためのガイドです。

## 🎯 アプローチ別比較

### 1. **個人用Persistent Branch**（推奨）
```bash
# 個人専用の長期開発ブランチ
git checkout -b dev/[your-name]
git push origin dev/[your-name]

# Supabase Dashboard: Branch設定でPersistentに変更
# → PR終了後も環境が保持される
```

**メリット:**
- 本番と同じインフラ構成
- 独立したデータベース
- いつでもアクセス可能
- 本番デプロイフローと同じ

**月額コスト:** 約$10-15（$0.01344 × 24h × 30d）

### 2. **専用ステージング環境**
```bash
# 長期的なステージング用ブランチ
git checkout -b staging
git push origin staging

# Persistent Branchとして設定
# チーム全体で共有する開発環境
```

**メリット:**
- チーム共有の安定環境
- 本番データ構造の模倣
- 統合テスト環境

**月額コスト:** 約$10-15（チーム共有なのでコスパ良い）

### 3. **Feature Branch + 即座テスト**
```bash
# 機能ごとの短期環境
git checkout -b feature/user-management
# 開発 → PR作成 → 即座にPreview環境でテスト
```

**メリット:**
- 無駄なコストなし
- 機能ごとの独立テスト
- 自動的な環境削除

**月額コスト:** 約$3-7（使用時間による）

## 🛠️ 実装手順

### Step 1: 個人開発環境の作成

```bash
# 1. 個人用ブランチ作成
git checkout develop
git checkout -b dev/$(whoami)
git push origin dev/$(whoami)

# 2. 初回PR作成（環境構築用）
echo "# Personal Development Environment" > DEV_SETUP.md
git add DEV_SETUP.md
git commit -m "setup: personal development environment"
git push origin dev/$(whoami)

# 3. GitHub でPR作成
# → Preview Branch自動作成
```

### Step 2: Persistent設定
```
1. Supabase Dashboard → Branches
2. 作成されたブランチを選択
3. "Switch to persistent" をクリック
4. 環境変数メモ
```

### Step 3: ローカル環境設定
```bash
# .env.development 作成
NEXT_PUBLIC_SUPABASE_URL=https://[your-branch-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-branch-anon-key]
NEXT_PUBLIC_ENVIRONMENT=development
```

## 🔄 日常の開発ワークフロー

### パターンA: クラウドファースト開発
```bash
# 1. 朝の開始
export $(cat .env.development | xargs)
npm run dev  # ローカルフロントエンド + クラウドDB

# 2. スキーマ変更時
supabase db diff -f new_feature
git add supabase/migrations/
git commit -m "feat: add new feature schema"
git push origin dev/$(whoami)
# → 自動的にクラウド環境に反映

# 3. 即座にテスト
# http://localhost:3000 でクラウドDBにアクセス
```

### パターンB: ハイブリッド開発
```bash
# ローカル環境でスキーマ設計
supabase start
# http://localhost:54323 でスキーマ設計

# クラウド環境で統合テスト
supabase db diff -f feature_schema
git add . && git commit -m "feat: new schema"
git push origin dev/$(whoami)
# → クラウド環境で本格テスト
```

## 🎮 効率化Tips

### 環境切り替えスクリプト
```bash
#!/bin/bash
# scripts/switch-env.sh

ENV=${1:-local}

case $ENV in
  "local")
    echo "🏠 ローカル環境に切り替え"
    cp .env.local .env
    supabase start
    ;;
  "dev")
    echo "☁️ 個人開発環境に切り替え"
    cp .env.development .env
    ;;
  "staging")
    echo "🎭 ステージング環境に切り替え"
    cp .env.staging .env
    ;;
  *)
    echo "使用方法: $0 [local|dev|staging]"
    ;;
esac

echo "✅ 環境切り替え完了: $ENV"
npm run dev
```

### VS Code設定
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Dev (Cloud DB)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "envFile": "${workspaceFolder}/.env.development"
    },
    {
      "name": "Local (Local DB)", 
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "envFile": "${workspaceFolder}/.env.local"
    }
  ]
}
```

## 💰 コスト最適化

### 自動停止設定
```bash
# GitHub Actions: 夜間自動停止
# .github/workflows/dev-env-management.yml

name: Development Environment Management
on:
  schedule:
    - cron: '0 22 * * *'  # 22:00 JST 停止
    - cron: '0 8 * * *'   # 08:00 JST 開始

jobs:
  manage-dev-env:
    runs-on: ubuntu-latest
    steps:
      - name: Pause Dev Branch (Night)
        if: github.event.schedule == '0 22 * * *'
        run: |
          # Pause処理（Preview環境は自動Pauseされる）
          echo "Development environment paused"
      
      - name: Resume Dev Branch (Morning)  
        if: github.event.schedule == '0 8 * * *'
        run: |
          # Resume処理（APIアクセスで自動復帰）
          curl ${{ secrets.DEV_SUPABASE_URL }}/rest/v1/ \
            -H "apikey: ${{ secrets.DEV_SUPABASE_ANON_KEY }}"
```

### 使用量監視
```bash
# scripts/monitor-usage.sh
#!/bin/bash

echo "📊 今月の使用量:"
echo "- Preview Branch時間: $(supabase usage --json | jq '.branching_hours')"
echo "- 推定コスト: $$(echo 'scale=2; $(supabase usage --json | jq '.branching_hours') * 0.01344' | bc)"
```

## 🔍 本番環境との差異管理

### 設定の同期チェック
```bash
# scripts/check-prod-sync.sh
#!/bin/bash

echo "🔍 本番環境との設定差異チェック:"

# 1. スキーマ比較
supabase db diff --linked | head -20

# 2. 環境変数比較
echo "開発環境で不足している可能性のある設定:"
grep -v "^#" .env.production.example | grep -v "^$" | while read line; do
  if ! grep -q "${line%%=*}" .env.development; then
    echo "⚠️ $line"
  fi
done
```

### データ同期戦略
```sql
-- scripts/sync-reference-data.sql
-- 本番の参考データを開発環境に同期

-- カテゴリマスタなど、参考データのみ同期
INSERT INTO dev_environment_sync_log (table_name, sync_date, record_count)
SELECT 'categories', now(), count(*) FROM categories;

-- 個人情報は除外してサンプルデータのみ
```

## ⚠️ 注意事項

### セキュリティ
- 個人情報を含むデータの取り扱い注意
- APIキーの適切な管理
- 開発環境への本番データ同期は禁止

### パフォーマンス
- Preview環境は自動Pause（5分）
- レスポンス時間に若干の差異あり
- 本格的な負荷テストは別途実施

### チーム運用
- ブランチ命名規則の統一
- 不要環境の定期削除
- コスト責任の明確化

---

この方法で、本番環境により近い形での快適な開発が可能になります！ 