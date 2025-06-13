import { LoadingContainer, BrandBackground } from "@/components/ui/loading-spinner";

// ページのデータ読み込み中に表示されるローディング画面
export default function Loading() {
  return (
    <div className="relative min-h-screen">
      <BrandBackground intensity="normal" />
      <div className="relative container max-w-4xl py-6">
        <LoadingContainer 
          variant="detailed"
          message="チャンネルの投稿を読み込み中..." 
          submessage="最新のコンテンツを取得しています"
          className="min-h-[60vh]"
          showBackground={false}
        />
      </div>
    </div>
  );
} 