import { getUserProfile } from "../actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormMessage, Message } from "@/components/form-message";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  // Supabaseクライアントを作成
  const supabase = await createClient();
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // ユーザーが認証されていない場合はログインページにリダイレクト
  if (userError || !user) {
    redirect("/sign-in");
  }
  
  // 認証済みユーザーをユーザーIDページへリダイレクト
  redirect(`/profile/${user.id}`);
} 