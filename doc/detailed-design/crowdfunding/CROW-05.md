# CROW-05: 支援特典数量管理機能

## 1. 機能概要
各特典の数量と残数を管理する機能

## 2. 処理フロー
1. チャンネルオーナーが特典数量管理画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. 特典の数量を更新
4. 入力内容のバリデーション
5. 特典数量をデータベースに更新

## 3. 画面設計
### 3.1 入力項目
- 特典数量（必須、最小1個）
- 残数表示（読み取り専用）

### 3.2 バリデーションルール
- 特典数量：必須、1個以上
- 残数は0以上である必要がある
- 数量は整数値のみ

## 4. データベース設計
### 4.1 更新対象テーブル
```sql
UPDATE crowdfunding_rewards
SET quantity = :quantity,
    remaining_quantity = :remaining_quantity,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :reward_id
  AND campaign_id = :campaign_id;
```

### 4.2 トリガー
```sql
CREATE OR REPLACE FUNCTION update_remaining_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity < (OLD.quantity - OLD.remaining_quantity) THEN
        RAISE EXCEPTION 'Cannot reduce quantity below allocated amount';
    END IF;
    NEW.remaining_quantity = NEW.quantity - (OLD.quantity - OLD.remaining_quantity);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_remaining_quantity_trigger
BEFORE UPDATE ON crowdfunding_rewards
FOR EACH ROW
EXECUTE FUNCTION update_remaining_quantity();
```

## 5. API設計
### 5.1 エンドポイント
```
PATCH /api/crowdfunding/campaigns/:campaignId/rewards/:rewardId/quantity
```

### 5.2 リクエスト形式
```typescript
interface UpdateRewardQuantityRequest {
  quantity: number;
}
```

### 5.3 レスポンス形式
```typescript
interface UpdateRewardQuantityResponse {
  id: string;
  campaignId: string;
  quantity: number;
  remainingQuantity: number;
  updatedAt: string;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー（チャンネルオーナーでない場合）
- バリデーションエラー（入力値が不正な場合）
- ステータスエラー（draft状態でない場合）
- 数量不足エラー（既に割り当てられた数量を下回る場合）
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
- 同時更新の制御

## 8. テストケース
### 8.1 正常系
1. チャンネルオーナーが正常に特典数量を更新できる
2. 最小数量（1個）で更新できる
3. 残数が正しく計算される

### 8.2 異常系
1. チャンネルオーナー以外が更新を試みた場合
2. 数量が1未満の場合
3. 既に割り当てられた数量を下回る場合
4. ステータスがdraft以外の場合
5. 同時更新による競合が発生した場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バリデーションの最適化
- トランザクションの適切な使用
- 同時更新の制御

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- 数量変更履歴の管理 