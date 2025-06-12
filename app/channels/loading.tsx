import { LoadingContainer, BrandBackground } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      <BrandBackground intensity="normal" />
      <div className="relative container max-w-4xl py-6">
        <LoadingContainer 
          variant="detailed"
          message="チャンネル一覧を読み込み中..." 
          submessage="最新のチャンネル情報を取得しています"
          className="min-h-[60vh]"
          showBackground={false}
        />
      </div>
    </div>
  );
} 