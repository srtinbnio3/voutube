import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { CampaignList } from "./_components/campaign-list";
import { CampaignListSkeleton } from "./_components/campaign-list-skeleton";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "クラウドファンディング一覧 | IdeaTube",
  description: "YouTuber企画のクラウドファンディング一覧ページです。お気に入りのYouTuberの企画を支援しましょう。",
};

export default function CrowdfundingPage() {
  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">クラウドファンディング</h1>
          <p className="text-muted-foreground">YouTuber企画の実現をサポートしましょう</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/crowdfunding/new">
            新規企画作成
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Suspense fallback={<CampaignListSkeleton />}>
          <CampaignList />
        </Suspense>
      </div>
    </div>
  );
} 