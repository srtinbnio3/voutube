-- requires_shipping を requires_note にリネーム（備考欄設定に名前を変更）
-- 作成日時: 2025-08-13 18:41:32 JST
-- 概要: requires_shippingフィールドが実際には備考欄の必須設定として使われているため、適切な名前に変更

-- crowdfunding_rewards テーブルでカラム名を変更
ALTER TABLE "public"."crowdfunding_rewards" 
    RENAME COLUMN "requires_shipping" TO "requires_note";

-- shipping_info カラムも note_info にリネーム（一貫性のため）
ALTER TABLE "public"."crowdfunding_rewards" 
    RENAME COLUMN "shipping_info" TO "note_info";

-- コメントを更新
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_note" IS '備考欄への入力が必須かどうか';
COMMENT ON COLUMN "public"."crowdfunding_rewards"."note_info" IS '備考欄に関する説明・注意事項';
