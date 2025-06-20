import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "./_components/dashboard-layout";
import { ProjectOverview } from "./_components/project-overview";

export const metadata: Metadata = {
  title: "ダッシュボード | IdeaTube",
  description: "クラウドファンディングプロジェクトを管理するダッシュボードです。",
};

// ダッシュボード - プロジェクト実行者向け管理画面
export default async function DashboardPage() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout currentPage="projects">
      <ProjectOverview userId={user.id} />
    </DashboardLayout>
  );
} 