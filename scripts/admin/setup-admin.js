/**
 * 管理者権限設定スクリプト
 * 
 * 使用方法:
 * node scripts/admin/setup-admin.js <email> [role]
 * 
 * 例:
 * node scripts/admin/setup-admin.js admin@example.com super_admin
 * node scripts/admin/setup-admin.js moderator@example.com content_moderator
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin(email, roleType = 'super_admin') {
  try {
    console.log(`🔧 管理者権限設定を開始: ${email} (${roleType})`);
    
    // 有効なロールタイプかチェック
    const validRoles = ['super_admin', 'content_moderator', 'support'];
    if (!validRoles.includes(roleType)) {
      throw new Error(`無効なロールタイプ: ${roleType}. 有効なロール: ${validRoles.join(', ')}`);
    }
    
    // ユーザーを検索
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      throw new Error(`ユーザー取得エラー: ${authError.message}`);
    }
    
    const user = authUsers.users.find(u => u.email === email);
    if (!user) {
      throw new Error(`ユーザーが見つかりません: ${email}`);
    }
    
    console.log(`✅ ユーザーを発見: ${user.email} (ID: ${user.id})`);
    
    // プロファイルに管理者フラグを設定
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (profileError) {
      throw new Error(`プロファイル更新エラー: ${profileError.message}`);
    }
    
    console.log('✅ プロファイルの管理者フラグを更新しました');
    
    // 管理者ロールを追加
    const { error: roleError } = await supabase
      .from('admin_roles')
      .upsert({
        user_id: user.id,
        role_type: roleType,
        granted_by: user.id, // 自分で設定
        is_active: true,
        notes: 'スクリプトによる初期設定',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,role_type'
      });
    
    if (roleError) {
      throw new Error(`ロール設定エラー: ${roleError.message}`);
    }
    
    console.log(`✅ ${roleType} 権限を付与しました`);
    console.log('🎉 管理者権限の設定が完了しました！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

async function listAdmins() {
  try {
    console.log('📋 現在の管理者一覧:');
    
    const { data: admins, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        is_admin,
        admin_roles:admin_roles!inner(
          role_type,
          is_active,
          granted_at
        )
      `)
      .eq('is_admin', true);
    
    if (error) {
      throw new Error(`管理者一覧取得エラー: ${error.message}`);
    }
    
    if (admins.length === 0) {
      console.log('管理者は設定されていません');
      return;
    }
    
    admins.forEach(admin => {
      console.log(`- ${admin.username} (ID: ${admin.id})`);
      admin.admin_roles.forEach(role => {
        if (role.is_active) {
          console.log(`  └ ${role.role_type} (付与日: ${new Date(role.granted_at).toLocaleDateString()})`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔧 IdeaTube 管理者権限設定ツール');
  console.log('');
  console.log('使用方法:');
  console.log('  node scripts/admin/setup-admin.js <email> [role]');
  console.log('  node scripts/admin/setup-admin.js --list');
  console.log('');
  console.log('ロールタイプ:');
  console.log('  super_admin       - 最高管理者（全権限）');
  console.log('  content_moderator - コンテンツ管理者（承認・却下権限）');
  console.log('  support          - サポート管理者（閲覧権限）');
  console.log('');
  console.log('例:');
  console.log('  node scripts/admin/setup-admin.js admin@example.com super_admin');
  console.log('  node scripts/admin/setup-admin.js moderator@example.com content_moderator');
  console.log('  node scripts/admin/setup-admin.js --list');
  process.exit(0);
}

if (args[0] === '--list') {
  listAdmins();
} else {
  const email = args[0];
  const roleType = args[1] || 'super_admin';
  setupAdmin(email, roleType);
}