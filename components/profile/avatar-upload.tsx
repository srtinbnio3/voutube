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

  // 画像選択ダイアログを開く - 一時的に無効化
  const handleButtonClick = () => {
    // 一時的に無効化
    return;
  };

  // 画像がアップロードされたときの処理 - 一時的に無効化
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 一時的に無効化
    return;
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
          className="absolute bottom-0 right-0 rounded-full w-8 h-8 opacity-50 cursor-not-allowed"
          disabled={true}
          title="画像アップロード機能は現在使用できません"
        >
          <FaCamera className="h-4 w-4" />
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled
      />
    </div>
  );
} 