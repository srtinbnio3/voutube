import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { checkAdminPermission } from "@/app/lib/admin-auth";
import { PayoutManagement } from "./_components/payout-management";

export const metadata: Metadata = {
  title: "振り込み管理 | IdeaTube Admin",
  description: "プロジェクト実施者と企画者への振り込み管理",
};

export default async function PayoutsAdminPage() {
  const supabase = await createClient();
  
  // 管理者認証チェック
  const adminCheck = await checkAdminPermission();
  if (!adminCheck.isAdmin) {
    notFound();
  }

  // プロジェクト実施者への振り込み一覧を取得
  const { data: projectPayouts, error: projectPayoutsError } = await supabase
    .from("project_payouts")
    .select(`
      *,
      campaign:crowdfunding_campaigns(
        id,
        title,
        current_amount,
        channel:channels(name, icon_url),
        post:posts(title)
      ),
      processed_by_profile:profiles!project_payouts_processed_by_fkey(username)
    `)
    .order("created_at", { ascending: false });

  // 企画者への報酬一覧を取得
  const { data: creatorRewards, error: creatorRewardsError } = await supabase
    .from("creator_rewards")
    .select(`
      *,
      campaign:crowdfunding_campaigns(
        id,
        title,
        current_amount,
        channel:channels(name, icon_url),
        post:posts(id, title, profiles!posts_user_id_fkey(id, username))
      ),
      processed_by_profile:profiles!creator_rewards_processed_by_fkey(username)
    `)
    .order("created_at", { ascending: false });

  if (projectPayoutsError) {
    console.error("プロジェクト振り込みデータ取得エラー:", projectPayoutsError);
  }

  if (creatorRewardsError) {
    console.error("企画者報酬データ取得エラー:", creatorRewardsError);
  }

  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container py-6 md:py-10 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">振り込み管理</h1>
          <p className="text-muted-foreground">
            プロジェクト実施者と企画者への振り込みを管理します。
          </p>
        </div>

        <PayoutManagement 
          projectPayouts={projectPayouts || []}
          creatorRewards={creatorRewards || []}
          adminUserId={adminCheck.userId || ""}
        />
      </div>
    </main>
  );
}
