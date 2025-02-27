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
 */
export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* ヒーローセクション - メインのキャッチフレーズとCTAボタンを表示 */}
      <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6 sm:gap-8 py-12 sm:py-20 px-4">
        <div className="text-center space-y-4 sm:space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            あなたのアイデアが、<br className="sm:hidden" />次の動画を創る。
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            YouTuberと視聴者を繋ぐ、<br className="sm:hidden" />新しい企画プラットフォーム
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto group">
            <Link href="/channels" className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 group-hover:animate-pulse" />
              チャンネル一覧へ
            </Link>
          </Button>
        </div>    
      </div>  
    </div>
  )
}
