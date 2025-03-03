"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadProfileImageAction } from "@/app/actions/profile";
import { FaCamera } from "react-icons/fa";
import { toast } from "sonner";

interface AvatarUploadProps {
  initialAvatarUrl: string | null;
  username: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({ initialAvatarUrl, username, onAvatarChange }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 画像選択ダイアログを開く
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 画像がアップロードされたときの処理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // FormDataを作成
      const formData = new FormData();
      formData.append("image", file);

      // 画像をアップロード
      const result = await uploadProfileImageAction(formData);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      // 画像URLを更新
      setAvatarUrl(result.url);
      onAvatarChange(result.url);
      toast.success("プロフィール画像をアップロードしました");
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      toast.error("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
      // 入力フィールドをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl || undefined} alt={username} />
          <AvatarFallback className="text-2xl">{getInitials(username)}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full w-8 h-8"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <FaCamera className="h-4 w-4" />
          )}
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
} 