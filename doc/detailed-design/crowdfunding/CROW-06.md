# CROW-06: 支援状況表示機能

## 1. 機能概要
現在の支援金額と目標金額の達成率を表示する機能

## 2. 処理フロー
1. ユーザーが支援状況表示画面にアクセス
2. システムがキャンペーン情報を取得
3. 支援状況を計算
4. 支援状況を表示

## 3. 画面設計
### 3.1 表示項目
- 目標金額
- 現在の支援金額
- 達成率（パーセンテージ）
- 残り日数
- 支援者数
- プログレスバー

### 3.2 表示ルール
- 金額は3桁区切りのカンマ表示
- 達成率は小数点以下1桁まで表示
- 残り日数は「あとX日」の形式で表示
- プログレスバーは達成率に応じて色が変化

## 4. データベース設計
### 4.1 取得クエリ
```sql
SELECT 
    c.id,
    c.title,
    c.target_amount,
    c.current_amount,
    c.start_date,
    c.end_date,
    COUNT(DISTINCT s.id) as supporter_count
FROM crowdfunding_campaigns c
LEFT JOIN crowdfunding_supporters s ON c.id = s.campaign_id
WHERE c.id = :campaign_id
GROUP BY c.id;
```

### 4.2 インデックス
既存のインデックスを使用

## 5. API設計
### 5.1 エンドポイント
```
GET /api/crowdfunding/campaigns/:campaignId/status
```

### 5.2 レスポンス形式
```typescript
interface CampaignStatusResponse {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  achievementRate: number;
  remainingDays: number;
  supporterCount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}
```

## 6. エラーハンドリング
### 6.1 想定されるエラー
- キャンペーンが存在しない場合
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
- 公開情報のみを表示
- レート制限の実装
- キャッシュ制御

## 8. テストケース
### 8.1 正常系
1. 支援状況が正しく表示される
2. 達成率が正しく計算される
3. 残り日数が正しく計算される
4. 支援者数が正しく表示される

### 8.2 異常系
1. 存在しないキャンペーンIDの場合
2. データベースエラーが発生した場合

## 9. パフォーマンス考慮事項
- インデックスの適切な使用
- キャッシュの活用
- クエリの最適化
- リアルタイム更新の制御

## 10. 運用考慮事項
- ログ出力
- 監視項目
- バックアップ方針
- キャッシュ更新戦略 