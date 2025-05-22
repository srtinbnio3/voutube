import Link from "next/link";
import Image from "next/image";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { CampaignWithChannel } from "@/app/types/crowdfunding";
import { CampaignProgress } from "./campaign-progress";

interface CampaignCardProps {
  campaign: CampaignWithChannel;
}

// キャンペーンカードコンポーネント
export function CampaignCard({ campaign }: CampaignCardProps) {
  // 残り日数を計算
  const endDate = new Date(campaign.end_date);
  const today = new Date();
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // 進捗率を計算（最大100%）
  const progress = Math.min(100, Math.round((campaign.current_amount / campaign.target_amount) * 100));
  
  // チャンネルアイコンのURLまたはデフォルト
  const iconUrl = campaign.channel.icon_url || "https://placehold.co/64x64?text=Ch";
  
  // 説明の切り詰め（長い場合は省略）
  const truncatedDescription = campaign.description.length > 120
    ? `${campaign.description.substring(0, 120)}...`
    : campaign.description;
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* カバー画像（プレースホルダー） */}
      <div className="relative bg-muted h-48">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          プロジェクト画像
        </div>
      </div>
      
      <div className="p-4">
        {/* タイトル */}
        <Link href={`/crowdfunding/${campaign.id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {campaign.title}
          </h3>
        </Link>
        
        {/* チャンネル情報 */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={iconUrl}
              alt={campaign.channel.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="text-sm font-medium">{campaign.channel.name}</span>
        </div>
        
        {/* 説明 */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {truncatedDescription}
        </p>
        
        {/* 進捗バー */}
        <CampaignProgress progress={progress} />
        
        {/* 金額と期間 */}
        <div className="flex justify-between items-center text-sm my-3">
          <div className="font-semibold">
            {formatAmountForDisplay(campaign.current_amount)}
            <span className="text-muted-foreground font-normal ml-1">
              / {formatAmountForDisplay(campaign.target_amount)}
            </span>
          </div>
          <div className="text-muted-foreground">
            {campaign.status === "active" 
              ? `残り${remainingDays}日` 
              : campaign.status === "completed" 
                ? "終了" 
                : "下書き"}
          </div>
        </div>
        
        {/* ボタン */}
        <Link 
          href={`/crowdfunding/${campaign.id}`}
          className="w-full block text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {campaign.status === "active" 
            ? "プロジェクトを見る" 
            : campaign.status === "completed" 
              ? "結果を見る" 
              : "編集する"}
        </Link>
      </div>
    </div>
  );
} 