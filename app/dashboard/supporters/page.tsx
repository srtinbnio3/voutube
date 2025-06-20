import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "../_components/dashboard-layout";
import { SupportersManagement } from "./_components/supporters-management";

export const metadata: Metadata = {
  title: "支援申し込み管理 | IdeaTube",
  description: "支援者の管理と一覧表示、CSVダウンロード機能があります。",
};

// 支援申し込み管理ページ
export default async function SupportersPage() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout currentPage="supporters">
      <SupportersManagement userId={user.id} />
    </DashboardLayout>
  );
} 