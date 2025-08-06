import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  try {
    // profilesテーブルの確認
    console.log('🔍 profilesテーブルの構造を確認...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ profilesテーブルエラー:', profilesError);
    } else {
      console.log('✅ profilesテーブル確認済み');
      if (profiles.length > 0) {
        console.log('カラム:', Object.keys(profiles[0]));
      }
    }

    // admin_rolesテーブルの確認
    console.log('🔍 admin_rolesテーブルの確認...');
    const { data: adminRoles, error: adminRolesError } = await supabase
      .from('admin_roles')
      .select('*')
      .limit(1);
    
    if (adminRolesError) {
      console.error('❌ admin_rolesテーブルエラー:', adminRolesError);
    } else {
      console.log('✅ admin_rolesテーブル確認済み');
    }

    // 既存のユーザーを確認
    console.log('🔍 既存のプロファイルを確認...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, username, is_admin')
      .limit(10);
    
    if (allProfilesError) {
      console.error('❌ プロファイル取得エラー:', allProfilesError);
    } else {
      console.log('📋 現在のプロファイル:');
      allProfiles.forEach(profile => {
        console.log(`- ${profile.username} (ID: ${profile.id}) [管理者: ${profile.is_admin || false}]`);
      });
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkTables();