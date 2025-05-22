# CROW-10: 支援者向け特典管理機能

## 1. 機能概要
支援者への特典提供状況を管理する機能

## 2. 処理フロー
1. チャンネルオーナーが特典管理画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. 特典の提供状況を更新
4. 支援者への通知を送信

## 3. 画面設計
### 3.1 表示項目
- 支援者一覧
- 特典情報
- 提供状況
- 発送情報
- 備考欄

### 3.2 表示ルール
- 支援者情報は匿名表示オプションに対応
- 特典は選択したもののみ表示
- 提供状況はステータスで表示（未提供、準備中、発送済み、完了）
- 発送情報は発送日時と追跡番号を表示

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_reward_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supporter_id UUID REFERENCES crowdfunding_supporters(id),
    reward_id UUID REFERENCES crowdfunding_rewards(id),
    status TEXT NOT NULL DEFAULT 'pending',
    shipping_info JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- トリガー関数
CREATE OR REPLACE FUNCTION update_reward_delivery_status()
RETURNS TRIGGER AS $$
BEGIN
    -- 特典提供状況の変更を記録
    INSERT INTO crowdfunding_reward_delivery_history (
        delivery_id,
        status,
        notes
    ) VALUES (
        NEW.id,
        NEW.status,
        NEW.notes
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER reward_delivery_status_change_trigger
AFTER UPDATE ON crowdfunding_reward_deliveries
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_reward_delivery_status();
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_reward_deliveries_supporter ON crowdfunding_reward_deliveries(supporter_id);
CREATE INDEX idx_crowdfunding_reward_deliveries_status ON crowdfunding_reward_deliveries(status);
```

## 5. API設計
### 5.1 エンドポイント
```
PATCH /api/crowdfunding/campaigns/:campaignId/rewards/:rewardId/deliveries/:deliveryId
```

### 5.2 リクエスト形式
```typescript
interface UpdateRewardDeliveryRequest {
  status: 'pending' | 'preparing' | 'shipped' | 'completed';
  shippingInfo?: {
    trackingNumber?: string;
    shippingDate?: string;
    carrier?: string;
  };
  notes?: string;
}
```

### 5.3 レスポンス形式
```typescript
interface UpdateRewardDeliveryResponse {
  id: string;
  status: string;
  shippingInfo?: {
    trackingNumber?: string;
    shippingDate?: string;
    carrier?: string;
  };
  notes?: string;
  updatedAt: string;
  history: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー
- ステータス遷移エラー
- データベースエラー
- 特典情報の不一致

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
- 個人情報の保護
- 発送情報の暗号化
- アクセスログの記録

## 8. テストケース
### 8.1 正常系
1. 特典提供状況が正しく更新される
2. 発送情報が正しく記録される
3. 支援者への通知が正しく送信される

### 8.2 異常系
1. 権限のないユーザーが更新を試みた場合
2. 不正なステータス遷移を試みた場合
3. データベースエラーが発生した場合
4. 特典情報が一致しない場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バッチ処理の最適化
- トランザクションの適切な使用
- 履歴テーブルの管理

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- 特典提供状況の定期確認
- 支援者への通知管理
- 発送情報の管理
- 運用マニュアル 