import { LoadingContainer } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <h1 className="text-3xl font-bold">プロフィール編集</h1>
      <LoadingContainer 
        message="プロフィール情報を読み込み中..." 
        className="min-h-[300px]"
      />
    </div>
  );
} 