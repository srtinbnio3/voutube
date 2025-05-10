# CROW-04: 支援特典設定機能

## 1. 機能概要
支援金額に応じた特典を設定する機能

## 2. 処理フロー
1. チャンネルオーナーが支援特典設定画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. 特典情報を入力
4. 入力内容のバリデーション
5. 特典情報をデータベースに保存

## 3. 画面設計
### 3.1 入力項目
- 特典タイトル（必須、最大100文字）
- 特典説明（必須、最大500文字）
- 支援金額（必須、最小1000円）
- 特典数量（必須、最小1個）

### 3.2 バリデーションルール
- 特典タイトル：必須、100文字以内
- 特典説明：必須、500文字以内
- 支援金額：必須、1000円以上
- 特典数量：必須、1個以上
- 特典は最大10個まで設定可能

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    remaining_quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_rewards_campaign_id ON crowdfunding_rewards(campaign_id);
```

## 5. API設計
### 5.1 エンドポイント
```
POST /api/crowdfunding/campaigns/:campaignId/rewards
```

### 5.2 リクエスト形式
```typescript
interface CreateRewardRequest {
  title: string;
  description: string;
  amount: number;
  quantity: number;
}
```

### 5.3 レスポンス形式
```typescript
interface CreateRewardResponse {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  amount: number;
  quantity: number;
  remainingQuantity: number;
  createdAt: string;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー（チャンネルオーナーでない場合）
- バリデーションエラー（入力値が不正な場合）
- ステータスエラー（draft状態でない場合）
- データベースエラー
- 特典数上限エラー（10個を超える場合）

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
1. チャンネルオーナーが正常に特典を設定できる
2. 最小金額（1000円）で特典を設定できる
3. 最小数量（1個）で特典を設定できる
4. 最大10個の特典を設定できる

### 8.2 異常系
1. チャンネルオーナー以外が設定を試みた場合
2. 必須項目が未入力の場合
3. 入力値が制限を超える場合
4. 特典数が10個を超える場合
5. ステータスがdraft以外の場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- バリデーションの最適化
- トランザクションの適切な使用

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針 