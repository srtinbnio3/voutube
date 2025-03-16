# IdeaTube データフロー図

## 全体のデータフロー

```mermaid
flowchart TB
    subgraph Client[クライアント層]
        UI[ユーザーインターフェース]
        Cache[ブラウザキャッシュ]
        State[状態管理]
    end

    subgraph Vercel[Vercel層]
        API[Next.js API Routes]
        Edge[Edge Functions]
        ServerProps[getServerSideProps]
    end

    subgraph Supabase[Supabase層]
        Auth[認証サービス]
        RLS[行レベルセキュリティ]
        DB[(データベース)]
    end

    %% クライアント層の内部フロー
    UI <--> State
    State <--> Cache

    %% クライアント → Vercel
    UI -->|1. APIリクエスト| API
    UI -->|2. データフェッチ| ServerProps

    %% Vercel → Supabase
    API -->|3. クエリ実行| RLS
    ServerProps -->|4. データ取得| RLS
    
    %% Supabase内部フロー
    RLS -->|5. 認証確認| Auth
    RLS -->|6. データ操作| DB

    %% レスポンスフロー
    DB -->|7. データ返却| RLS
    RLS -->|8. レスポンス| API
    API -->|9. データ更新| State
```

## 主要機能のデータフロー

### 1. 投稿フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant UI as フロントエンド
    participant API as Next.js API
    participant Auth as Supabase Auth
    participant DB as Supabase DB

    User->>UI: 投稿フォーム入力
    UI->>API: POST /api/posts
    API->>Auth: セッション確認
    Auth-->>API: ユーザー情報
    API->>DB: INSERT投稿データ
    DB-->>API: 投稿ID
    API-->>UI: 成功レスポンス
    UI-->>User: 完了表示
```

### 2. 投票フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant UI as フロントエンド
    participant API as Next.js API
    participant DB as Supabase DB
    participant Cache as ブラウザキャッシュ

    User->>UI: 投票ボタンクリック
    UI->>Cache: 楽観的更新
    UI->>API: POST /api/votes
    API->>DB: UPSERT投票データ
    DB->>DB: スコア再計算
    DB-->>API: 更新後データ
    API-->>UI: 新しいスコア
    UI->>Cache: キャッシュ更新
```

### 3. 一覧表示フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant UI as フロントエンド
    participant SSR as getServerSideProps
    participant DB as Supabase DB
    participant Cache as エッジキャッシュ

    User->>UI: ページアクセス
    UI->>SSR: データ要求
    SSR->>Cache: キャッシュ確認
    alt キャッシュヒット
        Cache-->>SSR: キャッシュデータ
    else キャッシュミス
        SSR->>DB: 投稿一覧取得
        DB-->>SSR: 投稿データ
        SSR->>Cache: キャッシュ保存
    end
    SSR-->>UI: データ表示
    UI-->>User: ページレンダリング
```

## データの更新パターン

1. **即時更新**
   - 投票操作
   - コメント投稿
   - 投稿の削除

2. **定期更新**
   - スコアの集計
   - ランキングの更新
   - キャッシュの破棄

3. **バッチ処理**
   - デッドロック解消
   - データクリーンアップ
   - 統計情報の更新 