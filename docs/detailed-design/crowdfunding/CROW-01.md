# CROW-01: クラウドファンディング開始機能

## 1. 機能概要
チャンネルオーナーが企画に対してクラウドファンディングを開始する機能（All in型）

## 2. 処理フロー
1. チャンネルオーナーがクラウドファンディング開始画面にアクセス
2. システムがチャンネルオーナー権限を確認
3. クラウドファンディング情報を入力
4. 入力内容のバリデーション
5. クラウドファンディング情報をデータベースに保存
6. 初期ステータスを「draft」に設定

## 3. 画面設計
### 3.1 入力項目
- キャンペーンタイトル（必須、最大100文字）
- キャンペーン説明（必須、最大2000文字）
- 目標金額（必須、最小1000円、最大1000万円）
- 開始日（必須、現在日以降）
- 終了日（必須、開始日から30日以上90日以内）
- 特典情報（任意、最大10個）

### 3.2 バリデーションルール
- タイトル：必須、100文字以内
- 説明：必須、2000文字以内
- 目標金額：必須、1000円以上1000万円以下
- 期間：開始日は現在日以降、終了日は開始日から30日以上90日以内

## 4. データベース設計
### 4.1 テーブル定義
```sql
CREATE TABLE crowdfunding_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id),
    channel_id UUID REFERENCES channels(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    reward_enabled BOOLEAN DEFAULT false,
    bank_account_info JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 インデックス
```sql
CREATE INDEX idx_crowdfunding_campaigns_channel_id ON crowdfunding_campaigns(channel_id);
CREATE INDEX idx_crowdfunding_campaigns_status ON crowdfunding_campaigns(status);
```

## 5. API設計
### 5.1 エンドポイント
```
POST /api/crowdfunding/campaigns
```

### 5.2 リクエスト形式
```typescript
interface CreateCampaignRequest {
  title: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  rewards?: Array<{
    title: string;
    description: string;
    amount: number;
    quantity: number;
  }>;
}
```

### 5.3 レスポンス形式
```typescript
interface CreateCampaignResponse {
  id: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- 権限エラー（チャンネルオーナーでない場合）
- バリデーションエラー（入力値が不正な場合）
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
1. チャンネルオーナーが正常にクラウドファンディングを作成できる
2. 特典情報を含めてクラウドファンディングを作成できる

### 8.2 異常系
1. チャンネルオーナー以外が作成を試みた場合
2. 必須項目が未入力の場合
3. 入力値が制限を超える場合
4. 期間設定が不正な場合

## 9. パフォーマンス考慮事項
- インデックスの適切な設定
- バリデーションの最適化
- トランザクションの適切な使用

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針 