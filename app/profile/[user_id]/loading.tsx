import { LoadingContainer, BrandBackground } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      <BrandBackground intensity="normal" />
      <div className="relative container max-w-6xl py-6">
        <LoadingContainer 
          variant="detailed"
          message="プロフィール情報を読み込み中..." 
          submessage="ユーザーデータとコンテンツを取得しています"
          className="min-h-[60vh]"
          showBackground={false}
        />
      </div>
    </div>
  );
} 