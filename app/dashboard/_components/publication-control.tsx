"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  PlayCircle, 
  Clock, 
  X,
  Calendar,
  Zap
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  status: string;
  scheduled_publish_at?: string;
  published_at?: string;
}

interface PublicationControlProps {
  campaign: Campaign;
}

export function PublicationControl({ campaign }: PublicationControlProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // 状態に応じた表示制御
  const canPublish = campaign.status === 'approved';
  const isScheduled = campaign.status === 'scheduled';
  const isPublished = campaign.status === 'active';

  // 即座公開
  const handlePublishNow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_now' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '公開に失敗しました');
      }

      const result = await response.json();
      toast({ title: result.message });
      router.refresh();
    } catch (error) {
      console.error('公開エラー:', error);
      toast({ 
        title: error instanceof Error ? error.message : '公開に失敗しました',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 公開予約
  const handleSchedulePublish = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast({ 
        title: '公開日時を入力してください',
        variant: "destructive"
      });
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast({ 
        title: '公開日時は現在時刻より後である必要があります',
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_publish',
          scheduledPublishAt: scheduledDateTime.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '公開予約に失敗しました');
      }

      const result = await response.json();
      toast({ title: result.message });
      setShowScheduleDialog(false);
      setScheduledDate("");
      setScheduledTime("");
      router.refresh();
    } catch (error) {
      console.error('公開予約エラー:', error);
      toast({ 
        title: error instanceof Error ? error.message : '公開予約に失敗しました',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 公開予約キャンセル
  const handleCancelSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_schedule' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '予約キャンセルに失敗しました');
      }

      const result = await response.json();
      toast({ title: result.message });
      router.refresh();
    } catch (error) {
      console.error('予約キャンセルエラー:', error);
      toast({ 
        title: error instanceof Error ? error.message : '予約キャンセルに失敗しました',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 日時の初期値設定（現在時刻から1時間後）
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  // 公開済みの場合は表示なし
  if (isPublished) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          公開中
        </Badge>
        {campaign.published_at && (
          <span className="text-xs text-muted-foreground">
            {new Date(campaign.published_at).toLocaleString('ja-JP')}より
          </span>
        )}
      </div>
    );
  }

  // 承認待ち・審査中等の場合は表示なし
  if (!canPublish && !isScheduled) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* 承認済み：公開制御ボタン */}
      {canPublish && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={handlePublishNow}
            disabled={isLoading}
          >
            <Zap className="h-4 w-4 mr-1" />
            即座に公開
          </Button>
          
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-1" />
                公開予約
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>公開予約設定</DialogTitle>
                <DialogDescription>
                  指定した日時に自動的にプロジェクトを公開します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-date">公開日</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">公開時刻</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowScheduleDialog(false)}
                >
                  キャンセル
                </Button>
                <Button 
                  onClick={handleSchedulePublish}
                  disabled={isLoading}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  予約設定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* 公開予約中：予約情報と操作ボタン */}
      {isScheduled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <Clock className="h-3 w-3 mr-1" />
              公開予約中
            </Badge>
            {campaign.scheduled_publish_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(campaign.scheduled_publish_at).toLocaleString('ja-JP')}に公開
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePublishNow}
              disabled={isLoading}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              今すぐ公開
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelSchedule}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              予約キャンセル
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
