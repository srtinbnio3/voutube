-- profiles テーブルの初期データ
INSERT INTO profiles (id, username, created_at, updated_at)
VALUES
  ('5a275edc-1dbf-4b31-91b1-c887af5e5276', 'user1', now(), now()),
  ('0fcaed1e-4f71-4640-a096-3221ad5b8438', 'user2', now(), now()),
  ('d4c3ac82-20c2-451c-9b2f-ce0b229dc14e', 'user3', now(), now());

-- channels テーブルの初期データ
INSERT INTO channels (id, youtube_channel_id, name, description, subscriber_count, post_count, created_at, updated_at)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'UC1234567890', 'サンプルチャンネル1', 'テスト用チャンネル1の説明です', 10000, 0, now(), now()),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'UC0987654321', 'サンプルチャンネル2', 'テスト用チャンネル2の説明です', 20000, 0, now(), now()),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'UC1111111111', 'サンプルチャンネル3', 'テスト用チャンネル3の説明です', 30000, 0, now(), now());

-- posts テーブルの初期データ
INSERT INTO posts (id, user_id, channel_id, title, description, score, created_at, updated_at)
VALUES
  ('b47ac10b-58cc-4372-a567-0e02b2c3d482', '5a275edc-1dbf-4b31-91b1-c887af5e5276', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
   'チャンネル1への企画1', '企画1の詳細な説明をここに記載します。これは10文字以上必要です。', 0, now(), now()),
  ('b47ac10b-58cc-4372-a567-0e02b2c3d483', '0fcaed1e-4f71-4640-a096-3221ad5b8438', 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'チャンネル1への企画2', '企画2の詳細な説明をここに記載します。これは10文字以上必要です。', 0, now(), now()),
  ('b47ac10b-58cc-4372-a567-0e02b2c3d484', 'd4c3ac82-20c2-451c-9b2f-ce0b229dc14e', 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
   'チャンネル2への企画1', '企画3の詳細な説明をここに記載します。これは10文字以上必要です。', 0, now(), now());

-- votes テーブルの初期データ
INSERT INTO votes (id, user_id, post_id, is_upvote, created_at, updated_at)
VALUES
  ('c47ac10b-58cc-4372-a567-0e02b2c3d485', '5a275edc-1dbf-4b31-91b1-c887af5e5276', 'b47ac10b-58cc-4372-a567-0e02b2c3d483', true, now(), now()),
  ('c47ac10b-58cc-4372-a567-0e02b2c3d486', '0fcaed1e-4f71-4640-a096-3221ad5b8438', 'b47ac10b-58cc-4372-a567-0e02b2c3d482', true, now(), now()),
  ('c47ac10b-58cc-4372-a567-0e02b2c3d487', 'd4c3ac82-20c2-451c-9b2f-ce0b229dc14e', 'b47ac10b-58cc-4372-a567-0e02b2c3d482', false, now(), now()); 