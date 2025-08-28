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
import { CheckCircle, Clock, AlertCircle, Edit, DollarSign } from "lucide-react";

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
  campaign: {
    id: string;
    title: string;
    current_amount: number;
    channel: {
      name: string;
      icon_url?: string;
    };
    post: {
      title: string;
    };
  };
  processed_by_profile?: {
    username: string;
  };
}

interface ProjectPayoutTableProps {
  payouts: ProjectPayout[];
  adminUserId: string;
}

export function ProjectPayoutTable({ payouts, adminUserId }: ProjectPayoutTableProps) {
  const [selectedPayout, setSelectedPayout] = useState<ProjectPayout | null>(null);
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
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />完了</Badge>;
      case "failed":
        return <Badge variant="destructive">失敗</Badge>;
      case "cancelled":
        return <Badge variant="secondary">キャンセル</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEdit = (payout: ProjectPayout) => {
    setSelectedPayout(payout);
    setFormData({
      status: payout.payout_status,
      notes: payout.processing_notes || "",
      bankTransferId: payout.bank_transfer_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPayout) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/payouts/project/${selectedPayout.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payout_status: formData.status,
          processing_notes: formData.notes,
          bank_transfer_id: formData.bankTransferId,
          processed_by: adminUserId,
          payout_date: formData.status === "completed" ? new Date().toISOString() : null,
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>プロジェクト</TableHead>
              <TableHead>チャンネル</TableHead>
              <TableHead className="text-right">総支援額</TableHead>
              <TableHead className="text-right">運営手数料</TableHead>
              <TableHead className="text-right">振込額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{payout.campaign.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {payout.campaign.post.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {payout.campaign.channel.icon_url && (
                      <img 
                        src={payout.campaign.channel.icon_url} 
                        alt="" 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm">{payout.campaign.channel.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatAmountForDisplay(payout.gross_amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    <div>運営: {formatAmountForDisplay(payout.platform_fee)}</div>
                    <div className="text-muted-foreground text-xs">
                      (Stripe手数料含む)
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatAmountForDisplay(payout.net_amount)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(payout.payout_status)}
                </TableCell>
                <TableCell>
                  {new Date(payout.created_at).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(payout)}
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
            <DialogTitle>振り込み状況を更新</DialogTitle>
          </DialogHeader>
          
          {selectedPayout && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedPayout.campaign.title}</h4>
                <p className="text-sm text-muted-foreground">
                  振込額: {formatAmountForDisplay(selectedPayout.net_amount)}
                </p>
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
                    <SelectItem value="completed">完了</SelectItem>
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
                  placeholder="振り込み処理に関するメモ..."
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
