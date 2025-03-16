# IdeaTube

[![GitHub license](https://img.shields.io/github/license/srtinbnio3/ideatube)](https://github.com/srtinbnio3/ideatube/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/srtinbnio3/ideatube)](https://github.com/srtinbnio3/ideatube/issues)
[![GitHub stars](https://img.shields.io/github/stars/srtinbnio3/ideatube)](https://github.com/srtinbnio3/ideatube/stargazers)
[![Deploy Status](https://img.shields.io/github/deployments/srtinbnio3/ideatube/Production?label=vercel&logo=vercel)](https://ideatube.vercel.app)

YouTubeチャンネルについてのアイデアや感想を共有するためのコミュニティプラットフォーム。ユーザーはYouTubeチャンネルに関連する投稿を作成し、他のユーザーの投稿に対して投票することができます。

## 目次

- [機能](#機能)
- [技術スタック](#技術スタック)
- [インストール](#インストール)
- [使用方法](#使用方法)
- [開発](#開発)
- [貢献](#貢献)
- [ライセンス](#ライセンス)

## 機能

- 🔐 メールアドレスまたはGoogleアカウントでの認証
- 🔍 YouTubeチャンネルの検索と表示
- ✍️ チャンネルに対する投稿の作成
- 👍 投稿への投票（いいね/よくないね）
- 👤 ユーザープロフィール
- 📱 レスポンシブデザイン
- 🌐 多言語対応（日本語/英語）

## 技術スタック

- **フロントエンド**
  - Next.js (App Router)
  - TypeScript
  - React
  - Tailwind CSS
  - Shadcn UI
  - Radix UI

- **バックエンド**
  - Supabase (PostgreSQL)
  - Supabase Auth
  - Server Actions

- **外部API**
  - YouTube Data API

## インストール

1. リポジトリのクローン
```bash
git clone https://github.com/srtinbnio3/ideatube.git
cd ideatube
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.example`を`.env.local`にコピーし、必要な環境変数を設定：
```bash
cp .env.example .env.local
```

必要な環境変数：
- \`NEXT_PUBLIC_SUPABASE_URL\`: SupabaseプロジェクトのURL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Supabaseの匿名キー
- \`YOUTUBE_API_KEY\`: YouTube Data APIのキー

4. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で利用可能になります。

## 使用方法

1. アカウントの作成またはログイン
2. YouTubeチャンネルを検索
3. チャンネルページで投稿を作成
4. 他のユーザーの投稿に投票

詳細な使用方法は[ドキュメント](docs/usage.md)を参照してください。

## 開発

### データベースマイグレーション

```bash
npm run migration:up
```

### テストの実行

```bash
npm run test
```

### リント

```bash
npm run lint
```

## 貢献

プロジェクトへの貢献を歓迎します！以下の手順で貢献できます：

1. このリポジトリをフォーク
2. 新しいブランチを作成 (\`git checkout -b feature/amazing-feature\`)
3. 変更をコミット (\`git commit -m 'Add amazing feature'\`)
4. ブランチにプッシュ (\`git push origin feature/amazing-feature\`)
5. プルリクエストを作成

詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

### 行動規範

このプロジェクトは[Contributor Covenant](https://www.contributor-covenant.org/)の行動規範に従います。詳細は[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
