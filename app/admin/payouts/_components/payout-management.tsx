"use client";

import { useState } from "react";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CheckCircle, Clock, AlertCircle, DollarSign, Users } from "lucide-react";
import { ProjectPayoutTable } from "./project-payout-table";
import { CreatorRewardTable } from "./creator-reward-table";

interface Campaign {
  id: string;
  title: string;
  current_amount: number;
  channel: {
    name: string;
    icon_url?: string;
  };
  post: {
    id?: string;
    title: string;
    profiles?: {
      id: string;
      username: string;
    };
  };
}

interface ProjectPayout {
  id: string;
  campaign_id: string;
  gross_amount: number;
  platform_fee: number;
  stripe_fee: number;
  net_amount: number;
  payout_status: string;
  payout_method: string;
  payout_date?: string;
  processing_notes?: string;
  bank_transfer_id?: string;
  created_at: string;
  updated_at: string;
  campaign: Campaign;
  processed_by_profile?: {
    username: string;
  };
}

interface CreatorReward {
  id: string;
  campaign_id: string;
  amount: number;
  payment_status: string;
  payment_date?: string;
  processing_notes?: string;
  bank_transfer_id?: string;
  created_at: string;
  updated_at: string;
  campaign: Campaign;
  processed_by_profile?: {
    username: string;
  };
}

interface PayoutManagementProps {
  projectPayouts: ProjectPayout[];
  creatorRewards: CreatorReward[];
  adminUserId: string;
}

export function PayoutManagement({ 
  projectPayouts, 
  creatorRewards, 
  adminUserId 
}: PayoutManagementProps) {
  const [activeTab, setActiveTab] = useState("projects");

  // 統計計算
  const projectStats = {
    pending: projectPayouts.filter(p => p.payout_status === 'pending').length,
    processing: projectPayouts.filter(p => p.payout_status === 'processing').length,
    completed: projectPayouts.filter(p => p.payout_status === 'completed').length,
    totalAmount: projectPayouts.reduce((sum, p) => sum + p.net_amount, 0),
  };

  const rewardStats = {
    pending: creatorRewards.filter(r => r.payment_status === 'pending').length,
    processing: creatorRewards.filter(r => r.payment_status === 'processing').length,
    completed: creatorRewards.filter(r => r.payment_status === 'paid').length,
    totalAmount: creatorRewards.reduce((sum, r) => sum + r.amount, 0),
  };

  // CSV出力機能
  const exportProjectPayoutsCSV = () => {
    const headers = [
      "プロジェクトID",
      "プロジェクト名",
      "チャンネル名", 
      "総支援額",
      "運営手数料",
      "Stripe手数料",
      "振込額",
      "ステータス",
      "作成日"
    ];

    const csvData = projectPayouts.map(payout => [
      payout.campaign_id,
      payout.campaign.title,
      payout.campaign.channel.name,
      payout.gross_amount,
      payout.platform_fee,
      payout.stripe_fee,
      payout.net_amount,
      payout.payout_status,
      new Date(payout.created_at).toLocaleDateString('ja-JP')
    ]);

    downloadCSV([headers, ...csvData], "project_payouts.csv");
  };

  const exportCreatorRewardsCSV = () => {
    const headers = [
      "報酬ID",
      "プロジェクト名",
      "企画者名",
      "報酬額",
      "ステータス", 
      "作成日"
    ];

    const csvData = creatorRewards.map(reward => [
      reward.id,
      reward.campaign.title,
      reward.campaign.post.profiles?.username || "不明",
      reward.amount,
      reward.payment_status,
      new Date(reward.created_at).toLocaleDateString('ja-JP')
    ]);

    downloadCSV([headers, ...csvData], "creator_rewards.csv");
  };

  const downloadCSV = (data: any[][], filename: string) => {
    const csvContent = data.map(row => 
      row.map(field => `"${field}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">プロジェクト振込待ち</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.pending}件</div>
            <p className="text-xs text-muted-foreground">
              処理中: {projectStats.processing}件
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">企画者報酬待ち</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardStats.pending}件</div>
            <p className="text-xs text-muted-foreground">
              処理中: {rewardStats.processing}件
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">プロジェクト振込総額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmountForDisplay(projectStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              完了: {projectStats.completed}件
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">企画者報酬総額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmountForDisplay(rewardStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              完了: {rewardStats.completed}件
            </p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>振り込み管理</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={activeTab === "projects" ? exportProjectPayoutsCSV : exportCreatorRewardsCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV出力
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects">
                プロジェクト実施者 ({projectPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="creators">
                企画者報酬 ({creatorRewards.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="mt-6">
              <ProjectPayoutTable 
                payouts={projectPayouts}
                adminUserId={adminUserId}
              />
            </TabsContent>
            
            <TabsContent value="creators" className="mt-6">
              <CreatorRewardTable 
                rewards={creatorRewards}
                adminUserId={adminUserId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
