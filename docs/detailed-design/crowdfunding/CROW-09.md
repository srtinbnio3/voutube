# CROW-09: キャンペーンステータス管理機能

## 1. 機能概要
キャンペーンの状態（下書き、進行中、完了、キャンセル）を管理する機能

## 2. 処理フロー
1. システムが定期的にキャンペーンの状態をチェック
2. 条件に応じてステータスを更新
3. ステータス変更時に必要な処理を実行

## 3. 画面設計
### 3.1 表示項目
- 現在のステータス
- ステータス変更履歴
- ステータス変更理由
- ステータス変更日時

### 3.2 表示ルール
- ステータスは視覚的に区別（色分け）
- 履歴は時系列順に表示
- 変更理由は必須

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_campaign_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id),
    status TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- トリガー関数
CREATE OR REPLACE FUNCTION update_campaign_status()
RETURNS TRIGGER AS $$
BEGIN
    -- ステータス変更履歴を記録
    INSERT INTO crowdfunding_campaign_status_history (
        campaign_id,
        status,
        reason
    ) VALUES (
        NEW.id,
        NEW.status,
        CASE
            WHEN NEW.status = 'completed' AND OLD.status != 'completed' THEN 'Campaign completed'
            WHEN NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN 'Campaign cancelled'
            ELSE NULL
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER campaign_status_change_trigger
AFTER UPDATE ON crowdfunding_campaigns
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_campaign_status();
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_campaign_status_history_campaign ON crowdfunding_campaign_status_history(campaign_id);
```

## 5. API設計
### 5.1 エンドポイント
```
PATCH /api/crowdfunding/campaigns/:campaignId/status
```

### 5.2 リクエスト形式
```typescript
interface UpdateCampaignStatusRequest {
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  reason?: string;
}
```

### 5.3 レスポンス形式
```typescript
interface UpdateCampaignStatusResponse {
  id: string;
  status: string;
  updatedAt: string;
  history: Array<{
    status: string;
    reason?: string;
    createdAt: string;
  }>;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー
- ステータス遷移エラー
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
- 権限チェック
- ステータス遷移の制御
- ログ出力
- 監査証跡の保持

## 8. テストケース
### 8.1 正常系
1. ステータスが正しく更新される
2. ステータス履歴が正しく記録される
3. 自動ステータス更新が正しく機能する

### 8.2 異常系
1. 不正なステータス遷移を試みた場合
2. 権限のないユーザーが更新を試みた場合
3. データベースエラーが発生した場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バッチ処理の最適化
- トランザクションの適切な使用
- 履歴テーブルの管理

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- ステータス変更通知
- エラー通知
- 運用マニュアル 