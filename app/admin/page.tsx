import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./components/admin-dashboard";
import { checkAdminPermission } from "@/app/lib/admin-auth";

export default async function AdminPage() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/sign-in");
  }

  // 管理者権限チェック
  const adminResult = await checkAdminPermission();
  
  if (!adminResult.isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <div className="max-w-md mx-auto bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 14.5c-.77.833-.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              アクセス権限がありません
            </h2>
            <p className="text-red-700 dark:text-red-300 text-sm">
              この管理画面にアクセスするには管理者権限が必要です。<br/>
              権限が必要な場合は運営チームにお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <AdminDashboard adminRoles={adminResult.roles} />
    </div>
  );
}