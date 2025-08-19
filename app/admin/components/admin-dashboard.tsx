'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Edit,
  AlertCircle,
  CheckCircle2,
  Ban,
  MessageSquare
} from "lucide-react";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { AdminRole } from "@/app/lib/admin-auth";

// 承認待ちキャンペーンの型定義
interface AdminCampaignItem {
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
  const [campaigns, setCampaigns] = useState<AdminCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('under_review');

  // ステータスに応じたバッジを生成する関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary" className="gap-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Edit className="h-3 w-3" />
            下書き
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="default" className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
            <Clock className="h-3 w-3" />
            承認待ち
          </Badge>
        );
      case 'needs_revision':
        return (
          <Badge variant="default" className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <AlertCircle className="h-3 w-3" />
            要修正
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 className="h-3 w-3" />
            公開中
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            非承認
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            完了
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="gap-1 border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-950/20 dark:text-gray-400">
            <Ban className="h-3 w-3" />
            キャンセル
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            {status}
          </Badge>
        );
    }
  };
  
  // ステータス別にキャンペーンを取得
  const fetchCampaigns = async (nextStatus: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: nextStatus });
      const response = await fetch(`/api/admin/crowdfunding?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error("キャンペーン取得エラー:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCampaigns(status);
  }, [status]);
  
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
      
      {/* 統計情報 + ステータス切替 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            プロジェクト一覧
          </CardTitle>
          <CardDescription>
            ステータスで絞り込みできます。各プロジェクトの「詳細確認」から詳細審査へ。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="text-2xl font-bold text-orange-600">
              {campaigns.length} 件
            </div>
            <div className="w-60">
              <Label className="mb-1 block text-xs text-muted-foreground">ステータス</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="under_review">承認待ち</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="needs_revision">要修正</SelectItem>
                  <SelectItem value="active">公開中</SelectItem>
                  <SelectItem value="rejected">非承認</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* プロジェクト一覧 */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                該当するプロジェクトはありません
              </div>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              getStatusBadge={getStatusBadge}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 個別のキャンペーンカードコンポーネント
interface CampaignCardProps {
  campaign: AdminCampaignItem;
  getStatusBadge: (status: string) => React.ReactElement;
}

function CampaignCard({ campaign, getStatusBadge }: CampaignCardProps) {
  // ステータスに応じたボーダー色を取得
  const getBorderColor = (status: string) => {
    switch (status) {
      case 'draft': return 'border-gray-200 dark:border-gray-700';
      case 'under_review': return 'border-orange-200 dark:border-orange-800';
      case 'needs_revision': return 'border-yellow-200 dark:border-yellow-800';
      case 'active': return 'border-green-200 dark:border-green-800';
      case 'rejected': return 'border-red-200 dark:border-red-800';
      case 'completed': return 'border-green-200 dark:border-green-800';
      case 'cancelled': return 'border-gray-200 dark:border-gray-700';
      default: return 'border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Card className={getBorderColor(campaign.status)}>
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
          {getStatusBadge(campaign.status)}
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
            
            {/* 運営とのやりとりチャットボタン */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-1"
            >
              <a href={`/crowdfunding/${campaign.id}/feedback`} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-3 w-3" />
                やりとり
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}