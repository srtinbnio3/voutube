import { Skeleton } from "@/components/ui/skeleton";

// キャンペーン一覧のローディング状態を表示するスケルトンコンポーネント
export function CampaignListSkeleton() {
  return (
    <div>
      {/* フィルターのスケルトン */}
      <div className="flex items-center space-x-2 mb-6">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      
      {/* カードのスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// キャンペーンカードのスケルトン
function CampaignCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      {/* サムネイル画像のスケルトン */}
      <Skeleton className="w-full h-48" />
      
      <div className="p-4">
        {/* タイトルのスケルトン */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        
        {/* チャンネル情報のスケルトン */}
        <div className="flex items-center space-x-2 mb-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* 説明のスケルトン */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-1" />
        <Skeleton className="h-4 w-4/6 mb-4" />
        
        {/* 進捗バーのスケルトン */}
        <Skeleton className="h-2 w-full mb-2" />
        
        {/* 金額情報のスケルトン */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        {/* ボタンのスケルトン */}
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
} 