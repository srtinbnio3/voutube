# Supabase Branching セットアップ・開発ガイド

## 1. 事前準備

### 前提条件
- [ ] Supabase Pro Plan以上（$25/月）
- [ ] GitHubリポジトリ
- [ ] Supabase CLI インストール済み
- [ ] `./supabase` ディレクトリがGitにコミット済み

### 現在の状況確認
```bash
# ブランチ状況
git branch -a

# マイグレーションファイル
ls -la supabase/migrations/

# config.toml確認
cat supabase/config.toml
```

## 2. Branching有効化手順

### Step 1: Supabase Dashboard設定
1. **Dashboard > Project Settings**
2. **Integrations タブ**
3. **Enable branching** をクリック
4. **GitHub Integration** のインストール
5. **Production branch** を選択（通常は `main` または `develop`）

### Step 2: 必要なGitHubチェック設定
```bash
# GitHubリポジトリ設定 > Settings > Branches
# Branch protection rules で Supabase チェックを必須に設定
```

## 3. 開発ワークフロー

### 🎯 基本的な開発サイクル

#### 1) 新機能開発開始
```bash
# 1. 新しいブランチ作成
git checkout develop
git pull origin develop
git checkout -b feature/user-profile-update

# 2. ローカル開発環境起動
supabase start
```

#### 2) スキーマ変更の実装
```bash
# ローカルStudioでスキーマ変更
# http://localhost:54323

# マイグレーションファイル生成
supabase db diff -f add_user_profile_fields

# 生成されたファイル確認
cat supabase/migrations/[timestamp]_add_user_profile_fields.sql
```

#### 3) ローカル検証
```bash
# マイグレーション適用テスト
supabase db reset

# シードデータ確認
psql 'postgresql://postgres:postgres@localhost:54322/postgres' -c 'SELECT * FROM profiles;'
```

#### 4) Pull Request作成
```bash
# 変更をコミット
git add supabase/migrations/
git commit -m "feat: add user profile fields"
git push origin feature/user-profile-update

# GitHub で Pull Request 作成
# → 自動的にPreview Branchが作成される
```

### 🔄 Preview Branch の活用

#### 自動作成されるもの
- 専用データベース環境
- 独立したAPI エンドポイント
- Supabase Studio アクセス

#### PR コメントで確認できる情報
```
🎭 Supabase Preview Branch
┌─ Database: ✅ Migrated successfully
├─ APIs: ✅ All services running  
└─ Studio: https://app.supabase.com/project/[preview-id]

Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=https://[preview-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[preview-anon-key]
```

### 🧪 プレビュー環境でのテスト
```bash
# 環境変数設定（チームメンバーも可能）
export NEXT_PUBLIC_SUPABASE_URL=https://[preview-id].supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=[preview-anon-key]

# アプリケーション起動
npm run dev
```

### ✅ マージと本番反映
```bash
# 1. PR承認・マージ
# GitHub でマージボタンクリック

# 2. 本番環境への自動マイグレーション
# main/develop ブランチにマージされると自動実行

# 3. Preview Branch自動削除
# マージ後、Preview環境は自動的に削除される
```

## 4. 実践的なTips

### 📝 シードデータの管理
```sql
-- supabase/seed.sql
-- Preview環境用のテストデータ

INSERT INTO profiles (id, username, avatar_url) VALUES
  ('user1-uuid', 'testuser1', 'https://example.com/avatar1.jpg'),
  ('user2-uuid', 'testuser2', 'https://example.com/avatar2.jpg');

INSERT INTO channels (owner_id, name, description) VALUES
  ('user1-uuid', 'テストチャンネル', 'Branchingテスト用');
```

### 🔄 マイグレーション失敗時の対処
```bash
# 1. ローカルで修正
supabase db reset
supabase db diff -f fix_migration_issue

# 2. 修正をプッシュ
git add supabase/migrations/
git commit -m "fix: migration issue"
git push origin feature/user-profile-update

# 3. Preview Branchで自動再実行
```

### 🎛️ Persistent Branch の活用
```bash
# 長期間のステージング環境が必要な場合
# Dashboard > Branches > "Switch to persistent"
# これで PR終了後も環境が残る
```

## 5. チーム開発での運用

### 👥 複数人での開発
- 各開発者が独自のfeatureブランチを作成
- それぞれに独立したPreview環境が生成
- 並行開発が安全に実行可能

### 🔍 コードレビューの効率化
```markdown
PR Description テンプレート:

## 変更内容
- [ ] スキーマ変更
- [ ] API変更  
- [ ] UI変更

## 確認事項
- [ ] Preview環境でのマニュアルテスト完了
- [ ] マイグレーションエラーなし
- [ ] シードデータ正常動作

## Preview環境
🔗 Studio: https://app.supabase.com/project/[preview-id]
🔗 App: [デプロイURL]
```

### 💰 コスト管理
```bash
# 不要なPersistent Branchの削除
# Dashboard > Branches > Delete

# 自動削除設定の活用
# Ephemeral Branch（デフォルト）を使用
# PR終了で自動削除される
```

## 6. トラブルシューティング

### ❌ よくある問題

#### マイグレーション失敗
```bash
# ログ確認
# GitHub Actions の Supabase チェック結果を確認

# ローカルで再現テスト
supabase db reset
supabase db push
```

#### 環境変数の同期エラー
```bash
# Preview環境の最新情報取得
supabase branches list

# 環境変数の手動更新
# PRコメントから最新の値をコピー
```

### 🛠️ 開発効率化

#### VS Code拡張機能
- Supabase extension
- PostgreSQL extension

#### 自動化スクリプト
```bash
#!/bin/bash
# scripts/new-feature.sh

FEATURE_NAME=$1
git checkout develop
git pull origin develop  
git checkout -b "feature/${FEATURE_NAME}"
supabase start
echo "🚀 Feature branch '${FEATURE_NAME}' ready!"
```

## 7. ベストプラクティス

### ✅ 推奨事項
- 小さなマイグレーションファイルに分割
- 分かりやすいマイグレーション名
- 十分なシードデータの準備
- 本番データのバックアップ

### ⚠️ 注意事項
- Preview環境は一時的なもの
- 本番データは含まれない
- 5分間の自動Pause機能
- Network制限に注意

---

このガイドを参考に、安全で効率的なSupabase Branchingでの開発を行ってください！ 