# CROW-08: Stripe決済連携機能

## 1. 機能概要
Stripeを使用した安全な決済処理機能

## 2. 処理フロー
1. 支援者が支援金額と特典を選択
2. システムがStripeの決済セッションを作成
3. 支援者がStripeの決済フォームで支払い情報を入力
4. Stripeが決済を処理
5. システムが決済結果を確認
6. 支援情報をデータベースに保存

## 3. 画面設計
### 3.1 表示項目
- 支援金額
- 選択した特典
- Stripe決済フォーム
- エラーメッセージ

### 3.2 表示ルール
- 金額は3桁区切りのカンマ表示
- 特典は選択したもののみ表示
- エラーはユーザーフレンドリーなメッセージで表示

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_supporters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id),
    user_id UUID REFERENCES profiles(id),
    reward_id UUID REFERENCES crowdfunding_rewards(id),
    amount INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    stripe_payment_id TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_supporters_stripe_payment ON crowdfunding_supporters(stripe_payment_id);
CREATE INDEX idx_crowdfunding_supporters_stripe_session ON crowdfunding_supporters(stripe_session_id);
```

## 5. API設計
### 5.1 エンドポイント
```
POST /api/crowdfunding/campaigns/:campaignId/support
```

### 5.2 リクエスト形式
```typescript
interface CreateSupportRequest {
  rewardId: string;
  amount: number;
  isAnonymous: boolean;
}
```

### 5.3 レスポンス形式
```typescript
interface CreateSupportResponse {
  sessionId: string;
  publicKey: string;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 決済エラー
- 特典在庫切れ
- キャンペーン終了
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
- Stripeのセキュアな決済システムの利用
- 決済情報の暗号化
- CSRFトークンの検証
- レート制限の実装
- 不正アクセス防止

## 8. テストケース
### 8.1 正常系
1. 正常な決済が完了する
2. 特典在庫が正しく更新される
3. 支援情報が正しく保存される

### 8.2 異常系
1. カード情報が不正な場合
2. 決済が拒否された場合
3. 特典在庫切れの場合
4. キャンペーン終了後の場合
5. 同時決済による競合が発生した場合

## 9. パフォーマンス考慮事項
- 決済処理の非同期化
- トランザクションの適切な使用
- 同時決済の制御
- エラーリトライの制御

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- 決済履歴の管理
- 不正検知
- サポート対応 