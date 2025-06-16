import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SupportForm } from "./_components/support-form";

interface SupportPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    reward_id?: string;
  }>;
}

export async function generateMetadata({ params }: SupportPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const supabase = await createClient();
  
  const { data: campaign, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      title,
      channel:channels(name)
    `)
    .eq("id", id)
    .single();
  
  if (error || !campaign) {
    return {
      title: "プロジェクト支援 | IdeaTube",
      description: "クラウドファンディングプロジェクトを支援します。",
    };
  }
  
  return {
    title: `${campaign.title}の支援 | IdeaTube`,
    description: `${(campaign.channel as any).name}のプロジェクト「${campaign.title}」を支援します。`,
  };
}

export default async function SupportPage({ params, searchParams }: SupportPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { id } = resolvedParams;
  const { reward_id } = resolvedSearchParams;
  
  // キャンペーンの存在確認とステータスチェック
  const supabase = await createClient();
  const { data: campaign, error } = await supabase
    .from("crowdfunding_campaigns")
    .select("id, title, status")
    .eq("id", id)
    .single();
  
  if (error || !campaign) {
    notFound();
  }
  
  // アクティブなキャンペーンのみ支援可能
  if (campaign.status !== "active") {
    return (
      <div className="container py-6 md:py-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">このプロジェクトは現在支援できません</h1>
          <p className="mb-6">
            このプロジェクトは{campaign.status === "completed" ? "終了しました" : "まだ開始していません"}。
          </p>
          <Link
            href={`/crowdfunding/${id}`}
            className="text-primary hover:underline"
          >
            プロジェクト詳細に戻る
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <Link 
          href={`/crowdfunding/${id}`}
          className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
        >
          ← プロジェクト詳細に戻る
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">{campaign.title}を支援する</h1>
        <p className="text-muted-foreground">
          支援金額と特典を選択して、プロジェクトを応援しましょう。
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <SupportForm campaignId={id} selectedRewardId={reward_id} />
      </div>
    </div>
  );
} 