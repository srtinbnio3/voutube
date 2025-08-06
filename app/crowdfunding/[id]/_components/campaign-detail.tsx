import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { CampaignProgress } from "../../_components/campaign-progress";
import { CampaignRewardList } from "./campaign-reward-list";
import { SupportButton } from "./support-button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Edit } from "lucide-react";

interface CampaignDetailProps {
  id: string;
}

// キャンペーン詳細コンポーネント
export async function CampaignDetail({ id }: CampaignDetailProps) {
  const supabase = await createClient();
  
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

  // アクティブでないキャンペーンの場合は表示を制限
  if (campaign.status !== 'active' && campaign.status !== 'completed') {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            このプロジェクトは現在公開されていません
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {campaign.status === 'draft' && 'プロジェクトは編集中です'}
            {campaign.status === 'under_review' && 'プロジェクトは運営チームによる確認中です'}
            {campaign.status === 'rejected' && 'プロジェクトは修正が必要な状態です'}
            {campaign.status === 'cancelled' && 'プロジェクトはキャンセルされました'}
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* メインコンテンツ（左側2/3） */}
      <div className="lg:col-span-2">
        <div>
          <Link 
            href="/crowdfunding"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
          >
            ← クラウドファンディング一覧に戻る
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            {campaign.status === 'active' && (
              <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-3 w-3" />
                公開中
              </Badge>
            )}
            {campaign.status === 'completed' && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                完了
              </Badge>
            )}
          </div>
          
          {/* チャンネル情報 */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={iconUrl}
                alt={campaign.channel.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <Link
                href={`/channels/${campaign.channel.id}`}
                className="font-medium hover:text-primary"
              >
                {campaign.channel.name}
              </Link>
              <div className="text-sm text-muted-foreground">
                チャンネル登録者: {campaign.channel.subscriber_count?.toLocaleString() || "非公開"}
              </div>
            </div>
          </div>
          
          {/* プロジェクト画像（プレースホルダー） */}
          <div className="relative bg-muted aspect-video mb-6">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              プロジェクト画像
            </div>
          </div>
          
          {/* 投稿内容リンク */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">元の投稿</h3>
            <Link
              href={`/channels/${campaign.channel.id}/posts/${campaign.post.id}`}
              className="text-primary hover:underline"
            >
              {campaign.post.title}
            </Link>
          </div>
          
          {/* プロジェクト説明 */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">プロジェクトについて</h2>
            <div className="prose max-w-none">
              {campaign.description.split("\n").map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* サイドバー（右側1/3） */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 border rounded-lg p-6 shadow-sm">
          {/* 進捗状況 */}
          <CampaignProgress progress={progress} />
          
          <div className="mt-4 mb-6">
            <div className="text-2xl font-bold">
              {formatAmountForDisplay(campaign.current_amount)}
            </div>
            <div className="text-muted-foreground">
              目標: {formatAmountForDisplay(campaign.target_amount)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <div className="font-semibold text-lg">{supportersCount}</div>
              <div className="text-muted-foreground">支援者</div>
            </div>
            
            <div>
              <div className="font-semibold text-lg">
                {campaign.status === "active" ? `${remainingDays}日` : "終了"}
              </div>
              <div className="text-muted-foreground">
                {campaign.status === "active" ? "残り" : "キャンペーン"}
              </div>
            </div>
          </div>
          
          {/* 支援ボタン */}
          {campaign.status === "active" && (
            <SupportButton campaignId={id} />
          )}
          
          {campaign.status !== "active" && (
            <div className="p-3 bg-muted text-center rounded-md">
              このプロジェクトは
              {campaign.status === "completed" ? "終了しました" : "まだ開始していません"}
            </div>
          )}
        </div>
        
        {/* リワード一覧 */}
        {rewards && rewards.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">特典一覧</h3>
            <CampaignRewardList 
              rewards={rewards}
              campaignId={id}
              campaignStatus={campaign.status}
            />
          </div>
        )}
      </div>
    </div>
  );
} 