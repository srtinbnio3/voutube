// Supabase使用量監視スクリプト
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// 設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// 無料枠の上限設定（Supabase Free Tier）
const FREE_TIER_LIMITS = {
  DATABASE_SIZE: 500 * 1024 * 1024, // 500MB
  STORAGE_SIZE: 1 * 1024 * 1024 * 1024, // 1GB
  BANDWIDTH: 2 * 1024 * 1024 * 1024, // 2GB/月
  AUTH_USERS: 50000, // 50,000ユーザー
  MAX_ROWS: 100000, // 10万行（テーブルごと）
  MAX_CONNECTIONS: 100 // 同時接続数
};

// 警告閾値（%）
const WARNING_THRESHOLD = 80; // 80%を超えると警告

/**
 * Supabaseの使用量を監視する
 */
async function monitorSupabaseUsage() {
  // Supabaseクライアント初期化
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // 1. データベースサイズの取得
    const { data: dbSizeData, error: dbError } = await supabase
      .rpc('get_db_size');
    
    if (dbError) {
      console.error('データベースサイズの取得に失敗:', dbError);
      // エラーが発生しても続行
    }
    
    const dbSize = dbSizeData || 0;
    
    // 2. テーブルごとの行数を取得
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_table_row_counts');
    
    if (tablesError) {
      console.error('テーブル行数の取得に失敗:', tablesError);
      // エラーが発生しても続行
    }
    
    const tables = tablesData || [];
    
    // 3. ストレージ使用量の取得
    let storageSize = 0;
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) throw bucketsError;
      
      // 各バケットのサイズを合計（APIの制限によりダミー値を使用）
      // 実際の環境では、サイズを取得するカスタム関数が必要
      storageSize = estimateStorageSize(buckets);
      
    } catch (storageError) {
      console.error('ストレージ情報の取得に失敗:', storageError);
      // エラーが発生しても続行
    }
    
    // 4. ユーザー数の取得
    let userCount = 0;
    try {
      // この部分はサービスロールが必要
      const { count, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      userCount = count || 0;
      
    } catch (userError) {
      console.error('ユーザー数の取得に失敗:', userError);
      // エラーが発生しても続行
    }
    
    // 使用率の計算
    const usageData = {
      database: {
        usage: dbSize,
        limit: FREE_TIER_LIMITS.DATABASE_SIZE,
        percentage: (dbSize / FREE_TIER_LIMITS.DATABASE_SIZE) * 100
      },
      storage: {
        usage: storageSize,
        limit: FREE_TIER_LIMITS.STORAGE_SIZE,
        percentage: (storageSize / FREE_TIER_LIMITS.STORAGE_SIZE) * 100
      },
      users: {
        usage: userCount,
        limit: FREE_TIER_LIMITS.AUTH_USERS,
        percentage: (userCount / FREE_TIER_LIMITS.AUTH_USERS) * 100
      },
      tables: tables.map(table => ({
        name: table.table_name,
        usage: table.row_count,
        limit: FREE_TIER_LIMITS.MAX_ROWS,
        percentage: (table.row_count / FREE_TIER_LIMITS.MAX_ROWS) * 100
      }))
    };

    // 使用量情報を表示
    console.log('\n=== Supabase使用量レポート ===');
    console.log(`データベースサイズ: ${formatBytes(usageData.database.usage)} / ${formatBytes(usageData.database.limit)} (${usageData.database.percentage.toFixed(1)}%)`);
    console.log(`ストレージ使用量: ${formatBytes(usageData.storage.usage)} / ${formatBytes(usageData.storage.limit)} (${usageData.storage.percentage.toFixed(1)}%)`);
    console.log(`ユーザー数: ${usageData.users.usage} / ${usageData.users.limit} (${usageData.users.percentage.toFixed(1)}%)`);
    console.log('\nテーブル行数:');
    usageData.tables.forEach(table => {
      console.log(`- ${table.name}: ${table.usage} / ${table.limit} (${table.percentage.toFixed(1)}%)`);
    });
    console.log('===========================\n');
    
    // 警告が必要なリソースを検出
    const warnings = [];
    
    if (usageData.database.percentage > WARNING_THRESHOLD) {
      warnings.push({
        resource: 'データベースサイズ',
        usage: formatBytes(usageData.database.usage),
        limit: formatBytes(usageData.database.limit),
        percentage: usageData.database.percentage.toFixed(1)
      });
    }
    
    if (usageData.storage.percentage > WARNING_THRESHOLD) {
      warnings.push({
        resource: 'ストレージ使用量',
        usage: formatBytes(usageData.storage.usage),
        limit: formatBytes(usageData.storage.limit),
        percentage: usageData.storage.percentage.toFixed(1)
      });
    }
    
    if (usageData.users.percentage > WARNING_THRESHOLD) {
      warnings.push({
        resource: 'ユーザー数',
        usage: usageData.users.usage.toLocaleString(),
        limit: usageData.users.limit.toLocaleString(),
        percentage: usageData.users.percentage.toFixed(1)
      });
    }
    
    if (usageData.tables.length > 0) {
      usageData.tables.forEach(table => {
        warnings.push({
          resource: `テーブル(${table.name})の行数`,
          usage: table.usage.toLocaleString(),
          limit: table.limit.toLocaleString(),
          percentage: table.percentage.toFixed(1)
        });
      });
    }
    
    // 警告があれば通知
    if (warnings.length > 0) {
      if (SLACK_WEBHOOK_URL) {
        await sendSlackAlert('Supabase無料枠の使用量警告', warnings, usageData);
        console.log('Slackに警告を送信しました');
      } else {
        console.log('警告：');
        console.table(warnings);
        console.log('SLACK_WEBHOOK_URL が設定されていないため、通知は送信されていません');
      }
    } else {
      console.log('すべてのリソースは無料枠の警告閾値内です');
      if (SLACK_WEBHOOK_URL) {
        await sendSlackAlert('Supabase使用量 正常', [], usageData);
        console.log('Slackに正常状態を通知しました');
      }
    }
    
    console.log('監視完了！');
    return warnings;
    
  } catch (error) {
    console.error('監視中にエラーが発生:', error);
    
    if (SLACK_WEBHOOK_URL) {
      await sendSlackAlert('Supabase監視エラー', [{
        resource: 'モニタリングシステム',
        usage: 'エラー発生',
        limit: '正常動作',
        percentage: '100'
      }]);
    }
    
    throw error;
  }
}

/**
 * バケット情報からストレージサイズを推定
 * 注：実際の環境では正確なサイズを取得する方法が必要
 */
function estimateStorageSize(buckets) {
  // このサンプルでは推定値を使用
  // 実際の実装では、バケット内のファイルサイズを集計する必要があります
  return buckets.length * 10 * 1024 * 1024; // バケットごとに平均10MBと仮定
}

/**
 * バイト数を人間が読みやすい形式に変換
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Slack通知を送信
 */
async function sendSlackAlert(title, warnings, usageData) {
  if (!SLACK_WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL が設定されていません');
    return;
  }
  
  try {
    const warningsText = warnings.map(w => 
      `• *${w.resource}*: ${w.usage}/${w.limit} (${w.percentage}%)`
    ).join('\n');

    // 使用量の詳細情報を追加
    const usageDetails = [
      `*データベースサイズ*: ${formatBytes(usageData.database.usage)} / ${formatBytes(usageData.database.limit)} (${usageData.database.percentage.toFixed(1)}%)`,
      `*ストレージ使用量*: ${formatBytes(usageData.storage.usage)} / ${formatBytes(usageData.storage.limit)} (${usageData.storage.percentage.toFixed(1)}%)`,
      `*ユーザー数*: ${usageData.users.usage} / ${usageData.users.limit} (${usageData.users.percentage.toFixed(1)}%)`,
      '\n*テーブル行数:*',
      ...usageData.tables.map(table => 
        `• ${table.name}: ${table.usage} / ${table.limit} (${table.percentage.toFixed(1)}%)`
      )
    ].join('\n');
    
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 ${title}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*現在の使用量:*\n' + usageDetails
          }
        }
      ]
    };

    // 警告がある場合は警告セクションを追加
    if (warnings.length > 0) {
      payload.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*警告:*\n' + warningsText
        }
      });
    }
    
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Slack通知の送信に失敗: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('Slack通知の送信中にエラーが発生:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorSupabaseUsage()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('エラー:', error);
      process.exit(1);
    });
}

export { monitorSupabaseUsage }; 