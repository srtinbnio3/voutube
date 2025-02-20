import { Skeleton } from "@/components/ui/skeleton"

// ページの読み込み中に表示されるローディング画面
export default function Loading() {
  return (
    <div className="container max-w-4xl py-6">
      {/* チャンネル情報のローディング表示 */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      
      <Skeleton className="h-20 mt-4" />
      
      {/* 投稿一覧のローディング表示 */}
      <div className="mt-8">
        <Skeleton className="h-8 w-[150px] mb-4" />
        <div className="space-y-4">
          {/* 3つの投稿プレースホルダーを表示 */}
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[150px]" />
          ))}
        </div>
      </div>
    </div>
  )
} 