"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CampaignFormData } from "@/app/types/crowdfunding";

// キャンペーン作成フォームコンポーネント
export function CampaignForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // フォーム送信時の処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // フォームデータの取得
      const campaignData: CampaignFormData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        target_amount: Number(formData.get("target_amount")),
        start_date: new Date(formData.get("start_date") as string),
        end_date: new Date(formData.get("end_date") as string),
        reward_enabled: Boolean(formData.get("reward_enabled")),
      };
      
      // 必須項目の検証
      if (!campaignData.title || !campaignData.description || !campaignData.target_amount || !campaignData.start_date || !campaignData.end_date) {
        setError("必須項目をすべて入力してください。");
        setIsLoading(false);
        return;
      }
      
      // TODO: 実際のAPIリクエストを実装する
      console.log("送信するデータ:", campaignData);
      
      // 成功したら詳細ページに遷移
      router.push("/crowdfunding");
    } catch (err) {
      console.error("キャンペーン作成エラー:", err);
      setError("キャンペーンの作成中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* プロジェクトタイトル */}
      <div className="space-y-2">
        <Label htmlFor="title">
          プロジェクトタイトル <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="魅力的なタイトルを入力してください"
          required
        />
      </div>
      
      {/* プロジェクト説明 */}
      <div className="space-y-2">
        <Label htmlFor="description">
          プロジェクト説明 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="プロジェクトの詳細や目標を説明してください"
          rows={6}
          required
        />
      </div>
      
      {/* 目標金額 */}
      <div className="space-y-2">
        <Label htmlFor="target_amount">
          目標金額 (円) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="target_amount"
          name="target_amount"
          type="number"
          min="1000"
          step="1000"
          placeholder="10000"
          required
        />
        <p className="text-xs text-muted-foreground">
          最低1,000円から設定可能です。
        </p>
      </div>
      
      {/* 開始日と終了日 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">
            開始日 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end_date">
            終了日 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            required
          />
        </div>
      </div>
      
      {/* 報酬受け取りの選択 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            id="reward_enabled"
            name="reward_enabled"
            type="checkbox"
            className="h-4 w-4"
          />
          <Label htmlFor="reward_enabled">
            報酬を受け取る（集まった資金の5%）
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          報酬を受け取る場合は、銀行口座情報の登録が必要です。
        </p>
      </div>
      
      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/crowdfunding")}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "送信中..." : "プロジェクトを作成"}
        </Button>
      </div>
    </form>
  );
} 