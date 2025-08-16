import { createClient } from "@/utils/supabase/server";
import { AlertCircle } from "lucide-react";
import { checkAdminPermission } from "@/app/lib/admin-auth";
import { CampaignDetailClient } from "./campaign-detail-client";

interface CampaignDetailProps {
  id: string;
}

// キャンペーン詳細（サーバーコンポーネント）
export async function CampaignDetail({ id }: CampaignDetailProps) {
  const supabase = await createClient();

  // 管理者権限をチェック
  const adminCheck = await checkAdminPermission();

  // キャンペーン詳細を取得
  const { data: campaign, error } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
      *,
      channel:channels(*),
      post:posts(id, title)
    `)
    .eq("id", id)
    .single();

  if (error || !campaign) {
    return <div>キャンペーンの取得中にエラーが発生しました。</div>;
  }

  // アクティブでないキャンペーンの場合は表示を制限（管理者は除く）
  const isPubliclyVisible = campaign.status === "active" || campaign.status === "completed";
  const canViewAsAdmin = adminCheck.isAdmin && (campaign.status === "under_review" || campaign.status === "draft");

  if (!isPubliclyVisible && !canViewAsAdmin) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">このプロジェクトは現在公開されていません</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {campaign.status === "draft" && "プロジェクトは編集中です"}
            {campaign.status === "under_review" && "プロジェクトは運営チームによる確認中です"}
            {campaign.status === "rejected" && "プロジェクトは修正が必要な状態です"}
            {campaign.status === "cancelled" && "プロジェクトはキャンセルされました"}
          </p>
        </div>
      </div>
    );
  }

  // 関連する特典を取得
  const { data: rewards } = await supabase
    .from("crowdfunding_rewards")
    .select("*")
    .eq("campaign_id", id)
    .order("amount", { ascending: true });

  // 管理者向け: チャンネルオーナー情報を取得
  let ownerProfile: { id: string; username: string; user_handle: string; avatar_url: string | null } | null = null;
  try {
    if (adminCheck.isAdmin && campaign?.channel?.owner_user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, user_handle, avatar_url")
        .eq("id", campaign.channel.owner_user_id)
        .single();
      ownerProfile = profile ?? null;
    }
  } catch (_) {
    ownerProfile = null;
  }

  // 支援者数を取得
  const { count: supportersCount } = await supabase
    .from("crowdfunding_supporters")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id);

  // 残り日数を計算
  const endDate = new Date(campaign.end_date);
  const today = new Date();
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // 進捗率を計算（最大100%）
  const progress = Math.min(100, Math.round((campaign.current_amount / campaign.target_amount) * 100));

  // チャンネルアイコンのURLまたはデフォルト
  const iconUrl = campaign.channel.icon_url || "https://placehold.co/64x64?text=Ch";

  return (
    <CampaignDetailClient
      campaign={campaign}
      rewards={rewards || []}
      ownerProfile={ownerProfile}
      supportersCount={supportersCount || 0}
      remainingDays={remainingDays}
      progress={progress}
      iconUrl={iconUrl}
      adminCheck={adminCheck}
    />
  );
} 