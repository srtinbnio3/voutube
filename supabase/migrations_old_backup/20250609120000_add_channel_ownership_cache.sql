-- チャンネル所有権のキャッシュ機能を追加するマイグレーション
-- YouTube Data APIの呼び出し頻度を削減し、ユーザビリティを向上させます

-- channelsテーブルに所有権関連のカラムを追加
ALTER TABLE public.channels
ADD COLUMN owner_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN ownership_verified_at timestamp with time zone,
ADD COLUMN ownership_verification_expires_at timestamp with time zone,
ADD COLUMN ownership_verification_method text DEFAULT 'youtube_api' CHECK (ownership_verification_method IN ('youtube_api', 'manual')),
ADD COLUMN last_ownership_check_at timestamp with time zone;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX idx_channels_owner_user_id ON public.channels(owner_user_id);
CREATE INDEX idx_channels_ownership_expires ON public.channels(ownership_verification_expires_at);

-- コメントを追加
COMMENT ON COLUMN public.channels.owner_user_id IS 'チャンネルの所有者のユーザーID（確認済み）';
COMMENT ON COLUMN public.channels.ownership_verified_at IS '所有権が最後に確認された日時';
COMMENT ON COLUMN public.channels.ownership_verification_expires_at IS '所有権確認の有効期限（通常は30日後）';
COMMENT ON COLUMN public.channels.ownership_verification_method IS '所有権確認の方法（youtube_api, manual）';
COMMENT ON COLUMN public.channels.last_ownership_check_at IS '最後に所有権チェックを実行した日時';

-- RLS（Row Level Security）ポリシーの更新
-- 所有者のみが自分のチャンネル情報を更新できるポリシーを追加
CREATE POLICY "チャンネル所有者のみ所有権情報を更新可能" ON public.channels
FOR UPDATE USING (auth.uid() = owner_user_id); 