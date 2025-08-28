"use client";

import { useState } from "react";
import { formatAmountForDisplay } from "@/app/lib/stripe";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, AlertCircle, Edit, User } from "lucide-react";

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
  campaign: {
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
  };
  processed_by_profile?: {
    username: string;
  };
}

interface CreatorRewardTableProps {
  rewards: CreatorReward[];
  adminUserId: string;
}

export function CreatorRewardTable({ rewards, adminUserId }: CreatorRewardTableProps) {
  const [selectedReward, setSelectedReward] = useState<CreatorReward | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    bankTransferId: "",
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />待機中</Badge>;
      case "processing":
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" />処理中</Badge>;
      case "paid":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />支払済</Badge>;
      case "failed":
        return <Badge variant="destructive">失敗</Badge>;
      case "cancelled":
        return <Badge variant="secondary">キャンセル</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEdit = (reward: CreatorReward) => {
    setSelectedReward(reward);
    setFormData({
      status: reward.payment_status,
      notes: reward.processing_notes || "",
      bankTransferId: reward.bank_transfer_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedReward) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/payouts/creator/${selectedReward.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status: formData.status,
          processing_notes: formData.notes,
          bank_transfer_id: formData.bankTransferId,
          processed_by: adminUserId,
          payment_date: formData.status === "paid" ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("更新に失敗しました");
      }

      // ページをリロードして最新データを取得
      window.location.reload();
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const calculatePercentage = (reward: CreatorReward) => {
    const percentage = (reward.amount / reward.campaign.current_amount) * 100;
    return percentage.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>プロジェクト</TableHead>
              <TableHead>企画者</TableHead>
              <TableHead>チャンネル</TableHead>
              <TableHead className="text-right">総支援額</TableHead>
              <TableHead className="text-right">報酬額 (3%)</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{reward.campaign.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {reward.campaign.post.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {reward.campaign.post.profiles?.username || "不明"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {reward.campaign.channel.icon_url && (
                      <img 
                        src={reward.campaign.channel.icon_url} 
                        alt="" 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm">{reward.campaign.channel.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatAmountForDisplay(reward.campaign.current_amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">
                      {formatAmountForDisplay(reward.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({calculatePercentage(reward)}%)
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(reward.payment_status)}
                </TableCell>
                <TableCell>
                  {new Date(reward.created_at).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(reward)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    編集
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>報酬支払い状況を更新</DialogTitle>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedReward.campaign.title}</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>企画者: {selectedReward.campaign.post.profiles?.username || "不明"}</p>
                  <p>報酬額: {formatAmountForDisplay(selectedReward.amount)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待機中</SelectItem>
                    <SelectItem value="processing">処理中</SelectItem>
                    <SelectItem value="paid">支払済</SelectItem>
                    <SelectItem value="failed">失敗</SelectItem>
                    <SelectItem value="cancelled">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankTransferId">銀行振込ID</Label>
                <Input
                  id="bankTransferId"
                  value={formData.bankTransferId}
                  onChange={(e) => setFormData({...formData, bankTransferId: e.target.value})}
                  placeholder="銀行での振込ID（任意）"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">処理メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="支払い処理に関するメモ..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "更新中..." : "更新"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
