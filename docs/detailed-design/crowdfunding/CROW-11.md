# CROW-11: プロジェクト更新情報機能

## 1. 機能概要
プロジェクトの進捗状況や更新情報を投稿する機能

## 2. 処理フロー
1. チャンネルオーナーが更新情報投稿画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. 更新情報を入力
4. 入力内容のバリデーション
5. 更新情報をデータベースに保存
6. 支援者への通知を送信

## 3. 画面設計
### 3.1 入力項目
- 更新タイトル（必須、最大100文字）
- 更新内容（必須、最大2000文字）
- 画像アップロード（任意、最大5枚）
- 公開設定（全員公開/支援者のみ）

### 3.2 表示ルール
- 更新情報は時系列順に表示
- 画像はサムネイル表示
- 公開設定に応じて表示制限
- ページネーション（10件ごと）

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    visibility TEXT NOT NULL DEFAULT 'public',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crowdfunding_update_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID REFERENCES crowdfunding_updates(id),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_updates_campaign ON crowdfunding_updates(campaign_id, created_at DESC);
CREATE INDEX idx_crowdfunding_update_images_update ON crowdfunding_update_images(update_id);
```

## 5. API設計
### 5.1 エンドポイント
```
POST /api/crowdfunding/campaigns/:campaignId/updates
```

### 5.2 リクエスト形式
```typescript
interface CreateUpdateRequest {
  title: string;
  content: string;
  images?: File[];
  visibility: 'public' | 'supporters';
}
```

### 5.3 レスポンス形式
```typescript
interface CreateUpdateResponse {
  id: string;
  title: string;
  content: string;
  images: string[];
  visibility: string;
  createdAt: string;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー
- バリデーションエラー
- 画像アップロードエラー
- データベースエラー

### 6.2 エラーレスポンス
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## 7. セキュリティ考慮事項
- チャンネルオーナー権限の確認
- 画像ファイルの検証
- コンテンツのサニタイズ
- アクセス制御

## 8. テストケース
### 8.1 正常系
1. 更新情報が正しく投稿される
2. 画像が正しくアップロードされる
3. 公開設定が正しく機能する
4. 支援者への通知が正しく送信される

### 8.2 異常系
1. 権限のないユーザーが投稿を試みた場合
2. 必須項目が未入力の場合
3. 画像サイズが制限を超える場合
4. データベースエラーが発生した場合

## 9. パフォーマンス考慮事項
- 画像の最適化
- インデックスの適切な使用
- キャッシュの活用
- バッチ処理の最適化

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- 画像ストレージの管理
- 通知配信の管理
- 運用マニュアル 