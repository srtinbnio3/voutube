import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SupportButtonProps {
  campaignId: string;
}

// プロジェクト支援ボタンコンポーネント
export function SupportButton({ campaignId }: SupportButtonProps) {
  return (
    <Button asChild className="w-full">
      <Link href={`/crowdfunding/${campaignId}/support`}>
        このプロジェクトを支援する
      </Link>
    </Button>
  );
} 