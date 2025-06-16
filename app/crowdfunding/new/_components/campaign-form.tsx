"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CampaignFormData } from "@/app/types/crowdfunding";
import { createClient } from "@/utils/supabase/client";

interface CampaignFormProps {
  searchParams: {
    post_id?: string;
    channel_id?: string;
    title?: string;
  };
}

// キャンペーン作成フォームコンポーネント
export function CampaignForm({ searchParams }: CampaignFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postInfo, setPostInfo] = useState<{
    title: string;
    description: string;
    post_id: string;
    channel_id: string;
  } | null>(null);
  
  // URLパラメータから投稿情報を取得
  useEffect(() => {
    const postId = searchParams.post_id;
    const channelId = searchParams.channel_id;
    const title = searchParams.title;
    
    if (postId && channelId) {
      // 投稿IDとチャンネルIDがある場合は投稿の詳細情報を取得
      const fetchPostDetails = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("posts")
            .select("title, description")
            .eq("id", postId)
            .single();
            
          if (error) throw error;
          
          setPostInfo({
            title: title || data.title,
            description: data.description,
            post_id: postId,
            channel_id: channelId
          });
        } catch (err) {
          console.error("投稿情報の取得エラー:", err);
          // エラーが発生しても続行できるようにする
          if (title) {
            setPostInfo({
              title: title,
              description: "",
              post_id: postId,
              channel_id: channelId
            });
          }
        }
      };
      
      fetchPostDetails();
    }
  }, [searchParams]);
  
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
        post_id: postInfo?.post_id || "",
        channel_id: postInfo?.channel_id || ""
      };
      
      // 必須項目の検証
      if (!campaignData.title || !campaignData.description || !campaignData.target_amount || !campaignData.start_date || !campaignData.end_date) {
        setError("必須項目をすべて入力してください。");
        setIsLoading(false);
        return;
      }
      
      // APIリクエストを実装
      const response = await fetch("/api/crowdfunding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "キャンペーンの作成に失敗しました");
      }
      
      // 成功したら詳細ページに遷移
      router.push(`/crowdfunding/${data.campaign.id}`);
    } catch (err: any) {
      console.error("キャンペーン作成エラー:", err);
      setError(err.message || "キャンペーンの作成中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  }
  
  // 今日の日付をYYYY-MM-DD形式で取得
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  
  // 一ヶ月後の日付をYYYY-MM-DD形式で取得
  const getOneMonthLaterString = () => {
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    return oneMonthLater.toISOString().split("T")[0];
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* 投稿からの情報があれば表示 */}
      {postInfo && (
        <div className="bg-muted/50 p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">投稿情報から作成</h3>
          <p className="text-sm text-muted-foreground">
            投稿「{postInfo.title}」の情報を元に作成します。
          </p>
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
          defaultValue={postInfo?.title || ""}
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
          defaultValue={postInfo?.description || ""}
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
          最低1,000円から設定可能です。All in型：目標金額の達成に関わらず、集まった支援金を受け取れます。
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
            defaultValue={getTodayString()}
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
            defaultValue={getOneMonthLaterString()}
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