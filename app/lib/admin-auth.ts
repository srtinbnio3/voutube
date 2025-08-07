import { createClient } from "@/utils/supabase/server";

// 管理者権限のタイプ定義
export type AdminRole = 'super_admin' | 'content_moderator' | 'support';

// 管理者権限チェック結果の型
export interface AdminCheckResult {
  isAdmin: boolean;
  roles: AdminRole[];
  userId?: string;
}

/**
 * 現在のユーザーが管理者権限を持っているかチェックする
 * @returns Promise<AdminCheckResult>
 */
export async function checkAdminPermission(): Promise<AdminCheckResult> {
  try {
    const supabase = await createClient();
    
    // ユーザー情報を安全に取得（Supabase認証サーバーで検証）
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { isAdmin: false, roles: [] };
    }
    
    const userId = user.id;
    
    // プロファイルから基本的な管理者フラグをチェック
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();
    
    if (profileError || !profile || !profile.is_admin) {
      return { isAdmin: false, roles: [], userId };
    }
    
    // 詳細な権限情報を取得
    const { data: adminRoles, error: rolesError } = await supabase
      .from("admin_roles")
      .select("role_type")
      .eq("user_id", userId)
      .eq("is_active", true);
    
    if (rolesError) {
      console.error("管理者権限取得エラー:", rolesError);
      return { isAdmin: false, roles: [], userId };
    }
    
    const roles = adminRoles?.map(role => role.role_type as AdminRole) || [];
    
    return {
      isAdmin: true,
      roles,
      userId
    };
    
  } catch (error) {
    console.error("管理者権限チェックエラー:", error);
    return { isAdmin: false, roles: [] };
  }
}

/**
 * 特定の管理者権限を持っているかチェックする
 * @param requiredRole - 必要な権限
 * @returns Promise<boolean>
 */
export async function hasAdminRole(requiredRole: AdminRole): Promise<boolean> {
  const result = await checkAdminPermission();
  // super_adminは全ての権限を持つものとして扱う
  return result.isAdmin && (result.roles.includes(requiredRole) || result.roles.includes('super_admin'));
}

/**
 * super_admin権限を持っているかチェックする
 * @returns Promise<boolean>
 */
export async function isSuperAdmin(): Promise<boolean> {
  return await hasAdminRole('super_admin');
}

/**
 * コンテンツ管理権限を持っているかチェックする（content_moderator または super_admin）
 * @returns Promise<boolean>
 */
export async function canModerateContent(): Promise<boolean> {
  const result = await checkAdminPermission();
  return result.isAdmin && (
    result.roles.includes('content_moderator') || 
    result.roles.includes('super_admin')
  );
}

/**
 * 管理者権限エラーレスポンスを生成する
 * @param message - エラーメッセージ
 * @returns Response
 */
export function createAdminErrorResponse(message: string = "管理者権限が必要です") {
  return Response.json(
    { error: message }, 
    { status: 403 }
  );
}

/**
 * APIエンドポイント用の管理者権限チェックミドルウェア
 * @param requiredRole - 必要な権限（省略可能）
 * @returns Promise<AdminCheckResult | Response>
 */
export async function requireAdminAuth(requiredRole?: AdminRole): Promise<AdminCheckResult | Response> {
  try {
    const result = await checkAdminPermission();
    
    if (!result.isAdmin) {
      return createAdminErrorResponse("管理者権限が必要です");
    }
    
    // super_adminは全ての権限を持つものとして扱う
    const hasSuperAdmin = result.roles.includes('super_admin');
    const hasRequiredRole = !requiredRole || result.roles.includes(requiredRole) || hasSuperAdmin;
    
    if (!hasRequiredRole) {
      return createAdminErrorResponse(`${requiredRole}権限が必要です`);
    }
    
    return result;
  } catch (error) {
    console.error('[requireAdminAuth] 認証エラー:', error);
    return createAdminErrorResponse("認証処理でエラーが発生しました");
  }
}