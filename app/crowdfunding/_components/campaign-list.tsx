import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { CampaignCard } from "./campaign-card";
import { CampaignFilter } from "./campaign-filter";
import { CampaignStatus } from "@/app/types/crowdfunding";

// クラウドファンディングキャンペーン一覧を取得して表示するコンポーネント
export async function CampaignList({ 
  status = "active",
  limit = 10 
}: { 
  status?: CampaignStatus;
  limit?: number;
}) {
  const supabase = await createClient();
  
  // キャンペーン一覧を取得
  const { data: campaigns, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      *,
      channel:channels(id, name, icon_url, youtube_channel_id),
      post:posts(id, title)
    `)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching campaigns:", error);
    return <div>キャンペーンの取得中にエラーが発生しました。</div>;
  }
  
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">キャンペーンがありません</h3>
        <p className="text-muted-foreground mb-6">
          現在、{status === "active" ? "進行中の" : status === "completed" ? "完了した" : ""}キャンペーンはありません。
        </p>
        {status !== "active" && (
          <Link 
            href="/crowdfunding?status=active" 
            className="text-primary hover:underline"
          >
            進行中のキャンペーンを見る
          </Link>
        )}
      </div>
    );
  }
  
  return (
    <div>
      <CampaignFilter currentStatus={status} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
} 