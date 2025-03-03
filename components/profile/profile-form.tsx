"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "./avatar-upload";
import { Toaster } from "sonner";

interface ProfileFormProps {
  initialData: {
    username: string;
    avatar_url: string | null;
  } | null;
  message?: Message;
}

export function ProfileForm({ initialData, message }: ProfileFormProps) {
  // プロフィールデータの初期値
  const defaultUsername = initialData?.username || "";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar_url || null);

  // アバター画像URLが変更されたときの処理
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>プロフィール編集</CardTitle>
        <CardDescription>
          あなたのプロフィール情報を更新します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" action={updateProfileAction}>
          {/* アバターアップロード */}
          <div className="flex justify-center">
            <AvatarUpload
              initialAvatarUrl={avatarUrl}
              username={defaultUsername || "ユーザー"}
              onAvatarChange={handleAvatarChange}
            />
          </div>

          {/* 非表示のアバターURL入力欄 */}
          <input type="hidden" name="avatar_url" value={avatarUrl || ""} />

          {/* ユーザー名入力欄 */}
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              name="username"
              defaultValue={defaultUsername}
              placeholder="ユーザー名を入力（3文字以上）"
              minLength={3}
              required
            />
          </div>

          {/* 送信ボタン */}
          <SubmitButton pendingText="更新中...">
            プロフィールを更新
          </SubmitButton>

          {/* エラーメッセージ */}
          {message && <FormMessage message={message} />}
        </form>
      </CardContent>
      <Toaster position="top-center" />
    </Card>
  );
} 