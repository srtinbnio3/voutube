"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/app/actions";
import { FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useSearchParams } from "next/navigation";

interface GoogleSignInButtonProps {
  className?: string;
}

// Googleログインボタンコンポーネント
export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect_to");

  // Googleログイン処理
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // URLにredirect_toパラメータを追加
      const url = new URL('/auth/callback', window.location.origin);
      if (redirectTo) {
        url.searchParams.set('redirect_to', redirectTo);
      }
      
      // Google認証URLにリダイレクト先を渡す
      await signInWithGoogleAction();
    } catch (error) {
      console.error("Google認証エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={handleSignInWithGoogle}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FaGoogle className="h-4 w-4" />
      )}
      Googleでログイン
    </Button>
  );
} 