'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Calendar,
  Target,
  Users,
  Loader2,
  Settings,
  MessageSquare
} from "lucide-react";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { AdminRole } from "@/app/lib/admin-auth";

// 承認待ちキャンペーンの型定義
interface PendingCampaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  channel: {
    id: string;
    name: string;
    youtube_channel_id: string;
  };
  post: {
    id: string;
    title: string;
  };
}

// 管理画面のメインコンポーネント
interface AdminDashboardProps {
  adminRoles: AdminRole[];
}

export function AdminDashboard({ adminRoles }: AdminDashboardProps) {
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // 承認待ちキャンペーンを取得
  const fetchPendingCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/crowdfunding/pending");
      
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error("承認待ちキャンペーン取得エラー:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };
  
  // 承認処理
  const handleApproval = async (campaignId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setActionLoading(campaignId);
      
      const response = await fetch("/api/admin/crowdfunding/approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          action,
          reason
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "処理に失敗しました");
      }
      
      await fetchPendingCampaigns();
      
    } catch (err) {
      console.error("承認処理エラー:", err);
      setError(err instanceof Error ? err.message : "処理中にエラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  };
  
  useEffect(() => {
    fetchPendingCampaigns();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">承認待ちプロジェクトを読み込み中...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">IdeaTube 運営管理画面</h1>
        </div>
        <div className="flex gap-2">
          {adminRoles.map((role) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {role === 'super_admin' && '最高管理者'}
              {role === 'content_moderator' && 'コンテンツ管理者'}
              {role === 'support' && 'サポート管理者'}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* エラー表示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 統計情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            承認待ちプロジェクト
          </CardTitle>
          <CardDescription>
            運営チームによる確認が必要なプロジェクト一覧です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {campaigns.length} 件
          </div>
        </CardContent>
      </Card>
      
      {/* プロジェクト一覧 */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                承認待ちのプロジェクトはありません
              </div>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              onApproval={handleApproval}
              isLoading={actionLoading === campaign.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 個別のキャンペーンカードコンポーネント
interface CampaignCardProps {
  campaign: PendingCampaign;
  onApproval: (campaignId: string, action: 'approve' | 'reject', reason?: string) => void;
  isLoading: boolean;
}

function CampaignCard({ campaign, onApproval, isLoading }: CampaignCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [promptOpen, setPromptOpen] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [promptError, setPromptError] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")

  const handleGeneratePrompt = async () => {
    try {
      setPromptLoading(true)
      setPromptError(null)
      const res = await fetch('/api/admin/crowdfunding/review/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || '審査プロンプトの生成に失敗しました')
      }
      const data = await res.json()
      setPromptText(data.prompt || '')
      setPromptOpen(true)
    } catch (e) {
      setPromptError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText)
    } catch {}
  }
  
  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{campaign.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {campaign.channel.name}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                目標額: {formatAmountForDisplay(campaign.target_amount)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            承認待ち
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* プロジェクト説明 */}
          <div>
            <Label className="text-sm font-medium">プロジェクト説明</Label>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
              {campaign.description}
            </p>
          </div>
          
          {/* 関連投稿 */}
          <div>
            <Label className="text-sm font-medium">関連投稿</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              {campaign.post.title}
            </p>
          </div>
          
          {/* アクションボタン */}
          <div className="flex gap-2 pt-2">
            {/* 詳細確認ボタン */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-1"
            >
              <a href={`/crowdfunding/${campaign.id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3 w-3" />
                詳細確認
              </a>
            </Button>

            {/* 審査プロンプト生成 */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGeneratePrompt}
              disabled={promptLoading || isLoading}
              className="flex items-center gap-1"
            >
              {promptLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MessageSquare className="h-3 w-3" />
              )}
              審査プロンプト
            </Button>
            
            {/* 承認ボタン */}
            <Button
              variant="default"
              size="sm"
              onClick={() => onApproval(campaign.id, 'approve')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              承認
            </Button>
            
            {/* 却下ボタン */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  却下
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>プロジェクトを却下しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作により、プロジェクトは却下状態になります。却下理由を入力してください。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reject-reason">却下理由</Label>
                  <Textarea
                    id="reject-reason"
                    placeholder="却下の理由を入力してください..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onApproval(campaign.id, 'reject', rejectReason);
                      setRejectReason("");
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    却下する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* 審査プロンプトダイアログ */}
          <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI審査用プロンプト</DialogTitle>
                <DialogDescription>任意のAIに貼り付けてお使いください（個人情報に注意）。</DialogDescription>
              </DialogHeader>
              {promptError && (
                <div className="text-sm text-red-600">{promptError}</div>
              )}
              <div className="space-y-2">
                <Label>プロンプト</Label>
                <Textarea rows={12} value={promptText} readOnly />
              </div>
              <DialogFooter>
                <Button onClick={handleCopy}>コピー</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}