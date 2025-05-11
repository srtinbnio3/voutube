# CROW-12: 支援者への通知機能

## 1. 機能概要
プロジェクトの更新情報を支援者に通知する機能

## 2. 処理フロー
1. プロジェクト更新時に通知対象を特定
2. 通知内容を生成
3. 通知を送信
4. 通知履歴を記録

## 3. 画面設計
### 3.1 表示項目
- 通知一覧
- 通知タイプ
- 通知内容
- 通知日時
- 既読状態

### 3.2 表示ルール
- 通知は時系列順に表示
- 未読通知は強調表示
- ページネーション（20件ごと）
- 通知タイプに応じたアイコン表示

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crowdfunding_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id),
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_notifications_user ON crowdfunding_notifications(user_id, created_at DESC);
CREATE INDEX idx_crowdfunding_notifications_campaign ON crowdfunding_notifications(campaign_id);
CREATE INDEX idx_crowdfunding_notification_settings_user ON crowdfunding_notification_settings(user_id);
```

## 5. API設計
### 5.1 エンドポイント
```
GET /api/crowdfunding/notifications
POST /api/crowdfunding/notifications/:notificationId/read
PATCH /api/crowdfunding/notification-settings
```

### 5.2 リクエスト形式
```typescript
interface UpdateNotificationSettingsRequest {
  emailEnabled: boolean;
  pushEnabled: boolean;
}
```

### 5.3 レスポンス形式
```typescript
interface NotificationsResponse {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
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
- 権限エラー
- 通知送信エラー
- データベースエラー
- メール送信エラー

### 6.2 エラーレスポンス
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## 7. セキュリティ考慮事項
- 通知設定の保護
- 個人情報の保護
- メール送信の制限
- アクセス制御

## 8. テストケース
### 8.1 正常系
1. 通知が正しく送信される
2. 通知設定が正しく更新される
3. 既読状態が正しく更新される
4. 通知一覧が正しく表示される

### 8.2 異常系
1. 権限のないユーザーが設定を変更しようとした場合
2. 通知送信に失敗した場合
3. メール送信に失敗した場合
4. データベースエラーが発生した場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バッチ処理の最適化
- メール送信の非同期処理
- 通知の一括送信

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- メール送信の管理
- 通知配信の管理
- 運用マニュアル 