# 完全クラウド開発ワークフロー詳細ガイド

## 📋 概要
ローカルSupabaseを使わず、完全にクラウド環境でデータベース開発を行うワークフローです。

## 🎯 基本構成
- **フロントエンド**: ローカル（localhost:3000）
- **データベース**: Supabase Preview Branch（クラウド）
- **開発環境**: 個人専用Persistent Branch
- **統合**: Git + GitHub + Supabase Branching

---

## 🕐 典型的な1日の開発フロー

### 朝の開始（9:00）
```bash
# 1. 開発環境に切り替え
cd ~/dev/voutube
./scripts/switch-env.sh dev

# 2. 最新コードを取得
git checkout dev/kimu
git pull origin dev/kimu

# 3. 依存関係更新（必要に応じて）
npm install

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000 でクラウドDBにアクセス
```

### 機能開発（9:30-12:00）
```bash
# 5. 新機能のブランチ作成（必要に応じて）
git checkout -b feature/user-profile-enhancement

# 6. コード実装
# VS Codeで通常通り開発
# pages/, components/, app/ 等を編集

# 7. リアルタイム確認
# ブラウザ: http://localhost:3000
# Supabase Studio: https://app.supabase.com/project/[preview-id]
# 変更が即座にクラウドDBに反映される
```

### ランチ休憩（12:00-13:00）
```bash
# クラウド環境は自動的にPause（5分間非活動）
# コストを自動節約
```

### 午後の開発（13:00-18:00）
```bash
# 8. スキーマ変更が必要になった場合
# ローカルでマイグレーション作成
supabase db diff -f add_user_bio_field

# 9. 生成されたマイグレーションを確認
cat supabase/migrations/[timestamp]_add_user_bio_field.sql

# 10. 変更をプッシュ
git add supabase/migrations/
git commit -m "feat: add user bio field to profiles"
git push origin feature/user-profile-enhancement

# 11. 約1-2分後、クラウド環境に自動反映
# → ブラウザでリロードして新機能テスト
```

### 夕方の仕上げ（18:00-19:00）
```bash
# 12. Pull Request作成（機能完成時）
# GitHub: feature/user-profile-enhancement → dev/kimu

# 13. 自動でPreview環境作成
# PRコメントに環境情報が自動投稿される

# 14. チームレビュー依頼
# PRで実際のPreview環境を共有
```

---

## 🛠️ 実際のワークフロー例

### Case 1: UI変更のみ
```bash
# 時間: 30分程度

# 1. コンポーネント編集
nano app/profile/edit/page.tsx

# 2. スタイル調整
nano app/globals.css

# 3. 即座確認
# ブラウザリロード → クラウドDBの実データで確認

# 4. 問題なければコミット
git add .
git commit -m "ui: improve profile edit form"
git push origin dev/kimu
```

### Case 2: データベーススキーマ変更
```bash
# 時間: 1-2時間程度

# 1. ローカルでスキーマ設計（高速）
supabase start  # 必要に応じて
# localhost:54323 でスキーマ設計

# 2. マイグレーション生成
supabase db diff -f add_channel_categories

# 3. マイグレーション確認・修正
code supabase/migrations/[timestamp]_add_channel_categories.sql

# 4. クラウドに反映
git add supabase/migrations/
git commit -m "feat: add channel categories table"
git push origin dev/kimu

# 5. 約2分待機（マイグレーション適用）

# 6. 新APIをフロントエンドで使用
# app/api/channels/categories/route.ts 作成
# コンポーネントで新機能実装

# 7. 即座テスト
# ブラウザで新機能確認
```

### Case 3: 複雑な機能開発
```bash
# 時間: 1日程度

# 1. 機能ブランチ作成
git checkout -b feature/crowdfunding-dashboard

# 2. 段階的開発
# Phase 1: スキーマ設計
supabase db diff -f crowdfunding_dashboard_schema
git add . && git commit -m "schema: crowdfunding dashboard tables"
git push origin feature/crowdfunding-dashboard

# Phase 2: API開発
# app/api/crowdfunding/analytics/route.ts
git add . && git commit -m "api: crowdfunding analytics endpoints"
git push origin feature/crowdfunding-dashboard

# Phase 3: UI開発
# app/dashboard/analytics/page.tsx
git add . && git commit -m "ui: crowdfunding analytics dashboard"
git push origin feature/crowdfunding-dashboard

# 3. 各プッシュ後、即座にクラウド環境で確認
# 4. 完成後、PR作成してチームレビュー
```

---

## 🔄 日常的なコマンド集

### 環境確認
```bash
# 現在の環境確認
echo $NEXT_PUBLIC_SUPABASE_URL

# クラウドDB接続確認
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/ \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# 環境変数一覧
grep -v '^#' .env | grep -v '^$'
```

### 開発効率化
```bash
# 高速環境切り替え
alias dev-env='./scripts/switch-env.sh dev && npm run dev'
alias local-env='./scripts/switch-env.sh local'

# 高速コミット
alias quick-commit='git add . && git commit -m'
alias quick-push='git push origin $(git branch --show-current)'

# 使用例
dev-env                           # 開発環境で開始
quick-commit "feat: add new feature"  # 高速コミット
quick-push                        # 高速プッシュ
```

### デバッグ・確認
```bash
# クラウドDBの中身確認
psql "$DATABASE_URL" -c "SELECT * FROM profiles LIMIT 5;"

# マイグレーション状態確認
supabase migration list --linked

# Preview Branch一覧
supabase branches list
```

---

## 📊 パフォーマンス比較

### 従来のローカル開発
```
スキーマ変更 → ローカル適用 → 動作確認 → 本番デプロイ → 本番確認
時間: 30分-1時間    リスク: 環境差異による問題
```

### 完全クラウド開発
```
スキーマ変更 → Git Push → 自動クラウド反映 → 即座確認
時間: 5-10分        リスク: ほぼなし（本番同等環境）
```

---

## 🎯 チーム開発での運用

### 朝会（9:30）
```bash
# 各メンバーの開発環境確認
echo "昨日の進捗ブランチ: $(git branch --show-current)"
echo "今日の作業予定: feature/xxx"

# 環境状況共有
supabase branches list | grep $(whoami)
```

### コードレビュー時
```markdown
# PRテンプレート
## 🎭 Preview環境
- Studio: https://app.supabase.com/project/[preview-id]
- App: [Vercel Preview URL]

## ✅ 確認済み項目
- [ ] Preview環境での動作確認
- [ ] マイグレーション正常適用
- [ ] パフォーマンス問題なし
- [ ] セキュリティ考慮済み

## 📸 動作確認スクリーンショット
[実際のPreview環境のスクリーンショット]
```

### マージ・リリース
```bash
# 1. PR承認・マージ
# GitHub web interface

# 2. 本番環境自動更新
# main/develop ブランチマージで自動実行

# 3. 確認
# 本番環境での動作確認

# 4. 開発環境のクリーンアップ
git branch -d feature/completed-feature
supabase branches delete preview-branch-name
```

---

## 💰 コスト管理

### 月額予算例
```
Pro Plan: $25
個人開発環境 (Persistent): $10
機能開発用 (Ephemeral): $3-5
合計: $38-40/月
```

### 節約Tips
```bash
# 夜間自動停止（Preview環境は自動Pause）
# 不要ブランチの定期削除
git branch --merged | grep -v main | grep -v develop | xargs git branch -d

# 使用量監視
supabase usage --project-id [project-id]
```

---

## 🚀 始め方

### 今すぐスタート
```bash
# 1. 個人開発環境セットアップ
git checkout -b dev/$(whoami)
echo "# Personal Development Environment" > DEV_SETUP.md
git add . && git commit -m "setup: personal dev environment"
git push origin dev/$(whoami)

# 2. GitHub でPR作成
# 3. Supabase Dashboard で Persistent 設定
# 4. 環境変数を .env.development に設定
# 5. 開発開始
./scripts/switch-env.sh dev
npm run dev
```

---

この完全クラウド開発ワークフローで、本番環境と同等の安全で効率的な開発が実現できます！ 

