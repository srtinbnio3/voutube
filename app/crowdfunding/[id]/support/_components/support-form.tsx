"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { CampaignReward } from "@/app/types/crowdfunding";

interface SupportFormProps {
  campaignId: string;
  selectedRewardId?: string;
}

// 支援フォームコンポーネント
export function SupportForm({ campaignId, selectedRewardId }: SupportFormProps) {
  const router = useRouter();
  const [rewards, setRewards] = useState<CampaignReward[]>([]);
  const [selectedReward, setSelectedReward] = useState<CampaignReward | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 特典一覧の取得
  useEffect(() => {
    async function fetchRewards() {
      try {
        const response = await fetch(`/api/crowdfunding/${campaignId}/rewards`);
        if (!response.ok) throw new Error("特典の取得に失敗しました");
        
        const data = await response.json();
        setRewards(data.rewards);
        
        // 初期選択特典の設定
        if (selectedRewardId && data.rewards.length > 0) {
          const reward = data.rewards.find((r: CampaignReward) => r.id === selectedRewardId);
          if (reward) {
            setSelectedReward(reward);
            setAmount(reward.amount);
          }
        }
      } catch (err) {
        console.error("特典取得エラー:", err);
        setError("特典情報の取得中にエラーが発生しました。");
      }
    }
    
    fetchRewards();
  }, [campaignId, selectedRewardId]);
  
  // 特典選択時の処理
  function handleRewardSelect(reward: CampaignReward) {
    setSelectedReward(reward);
    setAmount(reward.amount);
  }
  
  // 金額変更時の処理
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(Number(e.target.value));
  }
  
  // フォーム送信時の処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!selectedReward) {
      setError("特典を選択してください");
      return;
    }
    
    if (amount < selectedReward.amount) {
      setError(`最低${formatAmountForDisplay(selectedReward.amount)}以上の支援が必要です`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: 実際の支援処理を実装する
      console.log("支援データ:", {
        campaignId,
        rewardId: selectedReward.id,
        amount
      });
      
      // 成功した場合は完了ページに遷移
      router.push(`/crowdfunding/${campaignId}/support/complete`);
    } catch (err) {
      console.error("支援エラー:", err);
      setError("支援処理中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* 特典選択 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">特典を選択</h2>
        
        {rewards.length === 0 ? (
          <p className="text-muted-foreground">特典が見つかりません</p>
        ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedReward?.id === reward.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleRewardSelect(reward)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{reward.title}</h4>
                  <div className="text-primary font-medium">
                    {formatAmountForDisplay(reward.amount)}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {reward.description}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  {reward.remaining_quantity <= 0 ? (
                    <span className="text-destructive">完売</span>
                  ) : (
                    <>残り: {reward.remaining_quantity}/{reward.quantity}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 支援金額 */}
      {selectedReward && (
        <div className="space-y-2">
          <Label htmlFor="amount">
            支援金額 (円) - 最低{formatAmountForDisplay(selectedReward.amount)}
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={selectedReward.amount}
            step="1000"
            value={amount}
            onChange={handleAmountChange}
            required
          />
          <p className="text-xs text-muted-foreground">
            特典に表示されている金額以上で支援できます。
          </p>
        </div>
      )}
      
      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/crowdfunding/${campaignId}`)}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isLoading || !selectedReward}>
          {isLoading ? "処理中..." : "支援する"}
        </Button>
      </div>
    </form>
  );
} 