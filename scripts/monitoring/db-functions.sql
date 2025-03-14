-- Supabase監視用のストアド関数

-- データベースサイズを取得する関数
CREATE OR REPLACE FUNCTION public.get_db_size()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_size bigint;
BEGIN
  SELECT pg_database_size(current_database()) INTO db_size;
  RETURN db_size;
END;
$$;

-- テーブル行数を取得する関数
CREATE OR REPLACE FUNCTION public.get_table_row_counts()
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    relname::text, 
    CASE 
      WHEN reltuples < 1000 THEN (SELECT count(*) FROM pg_catalog.pg_class c WHERE c.relname = relname)::bigint
      ELSE reltuples::bigint
    END as row_count
  FROM pg_class
  WHERE relkind = 'r' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND relname NOT LIKE 'pg_%'
    AND relname NOT LIKE '_%;'
  ORDER BY row_count DESC;
END;
$$;

-- スロークエリを取得する関数
CREATE OR REPLACE FUNCTION public.get_slow_queries()
RETURNS TABLE(
  query text,
  calls bigint,
  avg_time double precision,
  max_time double precision,
  avg_rows bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- pg_stat_statementsが存在するか確認
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RETURN QUERY
    SELECT 
      pg_stat_statements.query,
      pg_stat_statements.calls,
      pg_stat_statements.total_time / pg_stat_statements.calls as avg_time,
      pg_stat_statements.max_time,
      pg_stat_statements.rows / pg_stat_statements.calls as avg_rows
    FROM pg_stat_statements
    WHERE pg_stat_statements.calls > 10  -- 10回以上実行されたクエリに限定
    AND pg_stat_statements.total_time / pg_stat_statements.calls > 1000  -- 平均1秒以上かかるクエリ
    ORDER BY avg_time DESC
    LIMIT 10;
  ELSE
    -- pg_stat_statementsがない場合は空の結果を返す
    RETURN QUERY
    SELECT 
      'pg_stat_statements extension is not installed'::text,
      0::bigint,
      0::double precision,
      0::double precision,
      0::bigint
    LIMIT 0;
  END IF;
END;
$$;

-- 現在のアクティブな接続数を取得する関数
CREATE OR REPLACE FUNCTION public.get_connection_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  connection_count integer;
BEGIN
  SELECT count(*) INTO connection_count
  FROM pg_stat_activity
  WHERE state = 'active';
  
  RETURN connection_count;
END;
$$;

-- セキュリティ上の注意：
-- これらの関数はSECURITY DEFINERとして作成されています。
-- 実運用環境では適切なアクセス制御を行ってください。
-- 特に、これらの関数へのアクセスを制限するRLSポリシーを実装することをお勧めします。

-- 例：
-- CREATE POLICY "Only authenticated users can access monitoring functions"
--  ON public.get_db_size
--  FOR ALL
--  TO authenticated
--  USING (true);

COMMENT ON FUNCTION public.get_db_size IS 'データベースの合計サイズをバイト単位で返します';
COMMENT ON FUNCTION public.get_table_row_counts IS '各テーブルの行数を返します';
COMMENT ON FUNCTION public.get_slow_queries IS '遅いクエリのリストを返します（pg_stat_statements拡張が必要です）';
COMMENT ON FUNCTION public.get_connection_count IS '現在のアクティブな接続数を返します'; 