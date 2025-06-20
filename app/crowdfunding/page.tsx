import { Suspense } from "react";
import { Metadata } from "next";
import { CampaignList } from "./_components/campaign-list";
import { CampaignListSkeleton } from "./_components/campaign-list-skeleton";

export const metadata: Metadata = {
  title: "クラウドファンディング一覧 | IdeaTube",
  description: "YouTuber企画のクラウドファンディング一覧ページです。お気に入りのYouTuberの企画を支援しましょう。",
};

export default function CrowdfundingPage() {
  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements - Same as landing page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="container py-6 md:py-10 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            クラウドファンディング
          </h1>
          <p className="text-muted-foreground">
            YouTuber企画の実現をサポートしましょう<br />
            <span className="text-sm text-purple-600 dark:text-purple-400">
              ※ 新規プロジェクトは、各チャンネルの投稿詳細ページから開始できます
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Suspense fallback={<CampaignListSkeleton />}>
            <CampaignList />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 