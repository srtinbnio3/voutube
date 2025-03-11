import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { PlayCircle, Sparkles, Users, Video } from "lucide-react"

/**
 * ランディングページコンポーネント
 * 
 * アプリケーションの最初のページを表示します。
 * ユーザーに対してアプリケーションの目的を説明し、
 * チャンネル一覧ページへのナビゲーションを提供します。
 * 
 * 主な機能：
 * - キャッチコピーの表示（レスポンシブ対応）
 * - チャンネル一覧へのナビゲーションボタン
 * - ビジュアル要素（グラデーションテキストなど）
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        {/* ヒーローセクション - メインのキャッチフレーズとCTAボタンを表示 */}
        <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6 sm:gap-8 py-12 sm:py-20 px-4">
          {/* キャッチコピーとサブテキスト */}
          <div className="text-center space-y-4 sm:space-y-6 max-w-4xl">
            {/* 
              メインキャッチコピー
              - モバイル表示: 2行に分割
              - デスクトップ表示: 1行（whitespace-nowrapで折り返しを防止）
              - レスポンシブなテキストサイズ調整
              - グラデーションテキスト効果
            */}
            <h1 className="text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] via-[#FF4444] to-[#FF6666]">
              <span className="sm:hidden">あなたのアイデアが、<br />次の動画を創る。</span>
              <span className="hidden sm:inline whitespace-nowrap">あなたのアイデアが、次の動画を創る。</span>
            </h1>
            {/* サブテキスト - モバイルでは改行あり */}
            <p className="text-lg sm:text-xl text-muted-foreground">
              企画提案と投票で、視聴者とYouTuberをつなぐ。<br className="sm:hidden" />みんなのアイデアから生まれる、次のバズる動画
            </p>
          </div>
          {/* CTAボタンセクション */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto pt-4">
            {/* 
              チャンネル一覧へのボタン
              - モバイル: 幅100%
              - デスクトップ: 自動幅
              - アイコン付き
              - ホバー時のアニメーション効果
            */}
            <Button asChild size="lg" className="w-full sm:w-auto group">
              <Link href="/channels" className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 group-hover:animate-pulse" />
                チャンネル一覧へ
              </Link>
            </Button>
          </div>    
        </div>  
      </div>
    </main>
  )
}
