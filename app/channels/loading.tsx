import { LoadingContainer } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">チャンネル一覧</h1>
      <LoadingContainer 
        message="チャンネルを読み込み中..." 
        className="min-h-[300px]"
      />
    </div>
  );
} 