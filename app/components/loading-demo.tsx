"use client";

import { useState, useEffect } from "react";
import { 
  LoadingSpinner, 
  LoadingContainer, 
  ProgressBar, 
  FullPageLoading,
  BrandBackground
} from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

export function LoadingDemo() {
  const [showFullPage, setShowFullPage] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      <BrandBackground intensity="subtle" />
      <div className="relative container max-w-6xl py-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            改善されたローディングUI
          </h1>
          <p className="text-muted-foreground text-lg">
            美しい背景とアニメーションを特徴とするローディング体験
          </p>
        </div>

        {/* スピナーのバリエーション */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">ローディングスピナー</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 bg-card/70 backdrop-blur-sm rounded-lg p-8 border-0 shadow-lg">
            <div className="text-center space-y-3">
              <LoadingSpinner variant="default" size="lg" />
              <p className="text-sm">Default</p>
            </div>
            <div className="text-center space-y-3">
              <LoadingSpinner variant="dots" size="lg" />
              <p className="text-sm">Dots</p>
            </div>
            <div className="text-center space-y-3">
              <LoadingSpinner variant="pulse" size="lg" />
              <p className="text-sm">Pulse</p>
            </div>
            <div className="text-center space-y-3">
              <LoadingSpinner variant="wave" size="lg" />
              <p className="text-sm">Wave</p>
            </div>
            <div className="text-center space-y-3">
              <LoadingSpinner variant="circle" size="lg" />
              <p className="text-sm">Circle</p>
            </div>
          </div>
        </section>

        {/* プログレスバー */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">プログレスバー</h2>
          <div className="space-y-4 bg-card/70 backdrop-blur-sm rounded-lg p-6 border-0 shadow-lg">
            <ProgressBar progress={progress} animated />
            <p className="text-sm text-muted-foreground">
              進行状況: {Math.round(progress)}%
            </p>
          </div>
        </section>

        {/* ローディングコンテナ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">ローディングコンテナ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-medium mb-4">Minimal</h3>
              <LoadingContainer 
                variant="minimal" 
                message="読み込み中..." 
                showBackground={false}
              />
            </div>
            <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-medium mb-4">Default</h3>
              <LoadingContainer 
                variant="default" 
                message="データを読み込んでいます..." 
                submessage="しばらくお待ちください"
                showBackground={false}
              />
            </div>
            <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-medium mb-4">Detailed</h3>
              <LoadingContainer 
                variant="detailed" 
                message="ファイルをアップロード中..." 
                submessage="大きなファイルのため時間がかかります"
                showProgress 
                progress={progress}
                showBackground={false}
              />
            </div>
          </div>
        </section>

        {/* フルページローディング */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">フルページローディング</h2>
          <div className="text-center bg-card/70 backdrop-blur-sm rounded-lg p-6 border-0 shadow-lg">
            <Button 
              onClick={() => {
                setShowFullPage(true);
                setTimeout(() => setShowFullPage(false), 3000);
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              フルページローディングを表示 (3秒間)
            </Button>
          </div>
        </section>

        {/* ブランド背景の説明 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">ブランド統一背景</h2>
          <div className="bg-card/70 backdrop-blur-sm rounded-lg p-6 border-0 shadow-lg space-y-4">
            <p className="text-muted-foreground">
              すべてのローディング画面で、トップページと同じ美しいPurple & Blueグラデーション背景を使用し、
              一貫したブランド体験を提供します。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="h-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded border"></div>
                <p className="text-sm">Base Gradient</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-purple-300/30 rounded-full blur-sm animate-pulse"></div>
                <p className="text-sm">Animated Orbs</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-sm animate-spin-slow"></div>
                <p className="text-sm">Rotating Gradient</p>
              </div>
            </div>
          </div>
        </section>

        {showFullPage && (
          <FullPageLoading message="ページを読み込み中..." />
        )}
      </div>
    </div>
  );
} 