import { CampaignReward, CampaignStatus } from "@/app/types/crowdfunding";
import { formatAmountForDisplay } from "@/app/lib/stripe";

interface CampaignRewardListProps {
  rewards: CampaignReward[];
  campaignId: string;
  campaignStatus: CampaignStatus;
}

// キャンペーンの特典（リワード）一覧を表示するコンポーネント
export function CampaignRewardList({ rewards, campaignId, campaignStatus }: CampaignRewardListProps) {
  return (
    <div className="space-y-4">
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          campaignId={campaignId}
          campaignStatus={campaignStatus}
        />
      ))}
    </div>
  );
}

interface RewardCardProps {
  reward: CampaignReward;
  campaignId: string;
  campaignStatus: CampaignStatus;
}

// 個別の特典（リワード）カードコンポーネント
function RewardCard({ reward, campaignId, campaignStatus }: RewardCardProps) {
  const isSoldOut = reward.remaining_quantity <= 0;
  const isActive = campaignStatus === "active";
  
  return (
    <div className="border rounded-lg p-4 transition-colors hover:border-primary">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{reward.title}</h4>
        <div className="text-primary font-medium">
          {formatAmountForDisplay(reward.amount)}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {reward.description}
      </p>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
        <div>
          {isSoldOut ? (
            <span className="text-destructive">完売</span>
          ) : (
            <>残り: {reward.remaining_quantity}/{reward.quantity}</>
          )}
        </div>
      </div>
      
      {isActive && !isSoldOut ? (
        <a
          href={`/crowdfunding/${campaignId}/support?reward_id=${reward.id}`}
          className="block w-full text-center py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
        >
          この特典を選択する
        </a>
      ) : (
        <div className="block w-full text-center py-2 bg-muted text-muted-foreground rounded-md text-sm cursor-not-allowed">
          {isSoldOut ? "完売しました" : "プロジェクトは終了しました"}
        </div>
      )}
    </div>
  );
} 