import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CampaignDetail } from "./_components/campaign-detail";
import { CampaignDetailSkeleton } from "./_components/campaign-detail-skeleton";

interface CampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const supabase = await createClient();
  
  const { data: campaign, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      title,
      description,
      channel:channels(name)
    `)
    .eq("id", id)
    .single();
  
  if (error || !campaign) {
    return {
      title: "プロジェクトが見つかりません | IdeaTube",
      description: "クラウドファンディングプロジェクトが見つかりませんでした。",
    };
  }
  
  return {
    title: `${campaign.title} | IdeaTube`,
    description: campaign.description.substring(0, 160),
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // キャンペーンの存在確認
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crowdfunding_campaigns")
    .select("id")
    .eq("id", id)
    .single();
  
  if (error || !data) {
    notFound();
  }
  
  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements - Same as landing page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="container py-6 md:py-10 relative">
      <Suspense fallback={<CampaignDetailSkeleton />}>
        <CampaignDetail id={id} />
      </Suspense>
    </div>
    </main>
  );
} 