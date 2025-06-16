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
    <div className="container py-6 md:py-10">
      <Suspense fallback={<CampaignDetailSkeleton />}>
        <CampaignDetail id={id} />
      </Suspense>
    </div>
  );
} 