# CROW-07: 支援履歴表示機能

## 1. 機能概要
支援者の一覧と支援金額を表示する機能

## 2. 処理フロー
1. ユーザーが支援履歴表示画面にアクセス
2. システムが支援履歴情報を取得
3. 支援履歴を表示

## 3. 画面設計
### 3.1 表示項目
- 支援者名（匿名表示オプションあり）
- 支援金額
- 支援日時
- 選択した特典
- 支援ステータス

### 3.2 表示ルール
- 金額は3桁区切りのカンマ表示
- 日時は「YYYY年MM月DD日 HH:mm」形式で表示
- 匿名表示の場合は「匿名の支援者」と表示
- ページネーション（20件ごと）

## 4. データベース設計
### 4.1 取得クエリ
```sql
SELECT 
    s.id,
    s.amount,
    s.created_at,
    s.payment_status,
    r.title as reward_title,
    p.username,
    p.is_anonymous
FROM crowdfunding_supporters s
JOIN crowdfunding_rewards r ON s.reward_id = r.id
JOIN profiles p ON s.user_id = p.id
WHERE s.campaign_id = :campaign_id
ORDER BY s.created_at DESC
LIMIT :limit
OFFSET :offset;
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_supporters_campaign_created ON crowdfunding_supporters(campaign_id, created_at DESC);
```

## 5. API設計
### 5.1 エンドポイント
```
GET /api/crowdfunding/campaigns/:campaignId/supporters
```

### 5.2 クエリパラメータ
```typescript
interface GetSupportersQuery {
  page?: number;      // デフォルト: 1
  limit?: number;     // デフォルト: 20
  sort?: 'newest' | 'amount';  // デフォルト: newest
}
```

### 5.3 レスポンス形式
```typescript
interface SupportersResponse {
  supporters: Array<{
    id: string;
    amount: number;
    createdAt: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    rewardTitle: string;
    supporterName: string;
    isAnonymous: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- キャンペーンが存在しない場合
- データベースエラー
- ページネーションエラー

### 6.2 エラーレスポンス
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## 7. セキュリティ考慮事項
- 匿名表示の制御
- レート制限の実装
- キャッシュ制御
- 個人情報の保護

## 8. テストケース
### 8.1 正常系
1. 支援履歴が正しく表示される
2. ページネーションが正しく機能する
3. 匿名表示が正しく機能する
4. ソート機能が正しく機能する

### 8.2 異常系
1. 存在しないキャンペーンIDの場合
2. 不正なページ番号の場合
3. データベースエラーが発生した場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- キャッシュの活用
- クエリの最適化
- N+1問題の回避

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- キャッシュ更新戦略
- 個人情報の取り扱い 