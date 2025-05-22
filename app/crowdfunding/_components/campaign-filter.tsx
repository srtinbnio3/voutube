import Link from "next/link";
import { CampaignStatus } from "@/app/types/crowdfunding";

interface CampaignFilterProps {
  currentStatus: CampaignStatus | string;
}

// ステータスフィルタータブを表示するコンポーネント
export function CampaignFilter({ currentStatus }: CampaignFilterProps) {
  // フィルタータブの定義
  const filterTabs = [
    { label: "進行中", value: "active" },
    { label: "完了", value: "completed" },
    { label: "下書き", value: "draft" }
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b mb-6">
      {filterTabs.map((tab) => {
        const isActive = currentStatus === tab.value;
        
        return (
          <Link
            key={tab.value}
            href={`/crowdfunding?status=${tab.value}`}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
} 