import { Skeleton } from "@/components/ui/skeleton";

// キャンペーン詳細のローディングスケルトン
export function CampaignDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* メインコンテンツ（左側2/3）のスケルトン */}
      <div className="lg:col-span-2">
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          
          <Skeleton className="h-10 w-3/4 mb-4" />
          
          {/* チャンネル情報のスケルトン */}
          <div className="flex items-center space-x-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          {/* プロジェクト画像のスケルトン */}
          <Skeleton className="w-full aspect-video mb-6" />
          
          {/* 投稿内容リンクのスケルトン */}
          <Skeleton className="w-full h-20 mb-6" />
          
          {/* プロジェクト説明のスケルトン */}
          <div className="mb-10">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
        </div>
      </div>
      
      {/* サイドバー（右側1/3）のスケルトン */}
      <div className="lg:col-span-1">
        <div className="border rounded-lg p-6 shadow-sm">
          {/* 進捗バーのスケルトン */}
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-16 mb-4 ml-auto" />
          
          {/* 金額のスケルトン */}
          <div className="mt-4 mb-6">
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-5 w-40" />
          </div>
          
          {/* 統計情報のスケルトン */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            <div>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          {/* ボタンのスケルトン */}
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* リワード一覧のスケルトン */}
        <div className="mt-8">
          <Skeleton className="h-7 w-32 mb-4" />
          
          {/* リワードカードのスケルトン（3つ表示） */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 mb-4">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 