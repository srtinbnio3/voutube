-- Add user_handle column and replace username unique constraint
-- Supabase 宣言型スキーマの変更に基づいてuser_handleを追加し、usernameのUNIQUE制約を削除

-- Step 1: Add user_handle column to profiles table (nullable first)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_handle text;

-- Step 2: Generate user_handle for existing users (if any)
UPDATE public.profiles 
SET user_handle = 'user_' || lower(substring(md5(random()::text || id::text), 1, 8))
WHERE user_handle IS NULL;

-- Step 3: Make user_handle NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN user_handle SET NOT NULL;

-- Step 4: Add unique constraint to user_handle
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_handle_key UNIQUE (user_handle);

-- Step 5: Add check constraint for user_handle length
ALTER TABLE public.profiles 
ADD CONSTRAINT user_handle_length CHECK (char_length(user_handle) >= 1);

-- Step 6: Remove unique constraint from username
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Step 7: Update the create_profile_for_new_user function to support user_handle
CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  base_username text;
  generated_handle text;
  counter integer := 1;
begin
  -- 基本となるusernameを取得
  base_username := coalesce(
    (new.raw_user_meta_data->>'name')::text,
    split_part(new.email, '@', 1)
  );
  
  -- 基本usernameが空の場合は'user'を使用
  if base_username is null or trim(base_username) = '' then
    base_username := 'user';
  end if;
  
  -- user_handleを自動生成（user_ + ランダムな8桁の英数字）
  generated_handle := 'user_' || lower(substring(md5(random()::text), 1, 8));
  
  -- user_handleがユニークになるまでループ（念のため）
  while exists (select 1 from public.profiles where user_handle = generated_handle) loop
    generated_handle := 'user_' || lower(substring(md5(random()::text), 1, 8));
    counter := counter + 1;
    
    -- 無限ループ防止（最大100回試行）
    if counter > 100 then
      generated_handle := 'user_' || extract(epoch from now())::bigint;
      exit;
    end if;
  end loop;
  
  insert into public.profiles (id, user_handle, username, avatar_url)
  values (
    new.id,
    generated_handle,
    base_username,
    (new.raw_user_meta_data->>'avatar_url')::text
  );
  return new;
end;
$$; 