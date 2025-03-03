import { LoadingContainer } from "@/components/ui/loading-spinner";

// ページのデータ読み込み中に表示されるローディング画面
export default function Loading() {
  return (
    <div className="container max-w-4xl py-6">
      <LoadingContainer 
        message="チャンネルの投稿を読み込み中..." 
        className="min-h-[400px]"
      />
    </div>
  );
} 