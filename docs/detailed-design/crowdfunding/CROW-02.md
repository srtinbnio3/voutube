# CROW-02: 目標金額設定機能

## 1. 機能概要
クラウドファンディングの目標金額を設定する機能（目標達成に関わらず支援金を受け取る方式）

## 2. 処理フロー
1. チャンネルオーナーが目標金額設定画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. 目標金額を入力
4. 入力内容のバリデーション
5. 目標金額をデータベースに更新

## 3. 画面設計
### 3.1 入力項目
- 目標金額（必須、最小1000円、最大1000万円）

### 3.2 バリデーションルール
- 目標金額：必須、1000円以上1000万円以下
- 小数点以下は切り捨て
- 3桁区切りのカンマ表示

## 4. データベース設計
### 4.1 更新対象テーブル
```sql
UPDATE crowdfunding_campaigns
SET target_amount = :target_amount,
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
PATCH /api/crowdfunding/campaigns/:campaignId/target-amount
```

### 5.2 リクエスト形式
```typescript
interface UpdateTargetAmountRequest {
  targetAmount: number;
}
```

### 5.3 レスポンス形式
```typescript
interface UpdateTargetAmountResponse {
  id: string;
  targetAmount: number;
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
1. チャンネルオーナーが正常に目標金額を設定できる
2. 最小金額（1000円）で設定できる
3. 最大金額（1000万円）で設定できる

### 8.2 異常系
1. チャンネルオーナー以外が設定を試みた場合
2. 最小金額未満の値を設定しようとした場合
3. 最大金額を超える値を設定しようとした場合
4. ステータスがdraft以外の場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バリデーションの最適化
- トランザクションの適切な使用

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針 