# CROW-03: 支援期間設定機能

## 1. 機能概要
クラウドファンディングの開始日と終了日を設定する機能

## 2. 処理フロー
1. チャンネルオーナーが支援期間設定画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. 開始日と終了日を入力
4. 入力内容のバリデーション
5. 支援期間をデータベースに更新

## 3. 画面設計
### 3.1 入力項目
- 開始日（必須、現在日以降）
- 終了日（必須、開始日から30日以上90日以内）

### 3.2 バリデーションルール
- 開始日：必須、現在日以降
- 終了日：必須、開始日から30日以上90日以内
- 日付形式：YYYY-MM-DD
- 時間は00:00:00に固定

## 4. データベース設計
### 4.1 更新対象テーブル
```sql
UPDATE crowdfunding_campaigns
SET start_date = :start_date,
    end_date = :end_date,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :campaign_id
  AND channel_id = :channel_id
  AND status = 'draft';
```

### 4.2 インデックス
既存のインデックスを使用

## 5. API設計
### 5.1 エンドポイント
```
PATCH /api/crowdfunding/campaigns/:campaignId/period
```

### 5.2 リクエスト形式
```typescript
interface UpdatePeriodRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}
```

### 5.3 レスポンス形式
```typescript
interface UpdatePeriodResponse {
  id: string;
  startDate: string;
  endDate: string;
  updatedAt: string;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー（チャンネルオーナーでない場合）
- バリデーションエラー（入力値が不正な場合）
- ステータスエラー（draft状態でない場合）
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
- 入力値のサニタイズ
- CSRFトークンの検証
- レート制限の実装

## 8. テストケース
### 8.1 正常系
1. チャンネルオーナーが正常に支援期間を設定できる
2. 最小期間（30日）で設定できる
3. 最大期間（90日）で設定できる

### 8.2 異常系
1. チャンネルオーナー以外が設定を試みた場合
2. 開始日が現在日より前の場合
3. 終了日が開始日から30日未満の場合
4. 終了日が開始日から90日を超える場合
5. ステータスがdraft以外の場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バリデーションの最適化
- トランザクションの適切な使用

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針 