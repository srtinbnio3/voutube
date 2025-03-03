"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/app/actions";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { LoadingSpinner } from "./ui/loading-spinner";

interface GoogleSignInButtonProps {
  className?: string;
}

// Googleログインボタンコンポーネント
export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Googleログイン処理
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
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