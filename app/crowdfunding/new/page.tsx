import { Metadata } from "next";
import Link from "next/link";
import { CampaignForm } from "./_components/campaign-form";

export const metadata: Metadata = {
  title: "新規クラウドファンディング作成 | IdeaTube",
  description: "YouTuber企画のクラウドファンディングを作成します。",
};

interface PageProps {
  params: Promise<any>;
  searchParams: Promise<{
    post_id?: string;
    channel_id?: string;
    title?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function NewCampaignPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <Link 
          href="/crowdfunding"
          className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
        >
          ← クラウドファンディング一覧に戻る
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">新規クラウドファンディング作成</h1>
        <p className="text-muted-foreground">
          YouTubeの投稿に基づいてクラウドファンディングを開始できます。
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <CampaignForm searchParams={resolvedSearchParams} />
      </div>
    </div>
  );
} 