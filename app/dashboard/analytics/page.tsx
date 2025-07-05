import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "../_components/dashboard-layout";
import { AnalyticsOverview } from "./_components/analytics-overview";

export const metadata: Metadata = {
  title: "分析・統計 | IdeaTube",
  description: "プロジェクトの分析データと統計情報を確認できます。",
};

// 分析・統計ページ
export default async function AnalyticsPage() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout currentPage="analytics">
      <AnalyticsOverview userId={user.id} />
    </DashboardLayout>
  );
} 