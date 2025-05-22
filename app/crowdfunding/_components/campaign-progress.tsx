interface CampaignProgressProps {
  progress: number;
}

// キャンペーンの進捗バーコンポーネント
export function CampaignProgress({ progress }: CampaignProgressProps) {
  return (
    <div className="w-full">
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary" 
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`${progress}%達成`}
        />
      </div>
      <div className="mt-1 text-xs text-muted-foreground text-right">
        {progress}% 達成
      </div>
    </div>
  );
} 