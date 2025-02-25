import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 py-8 sm:py-12 px-4">
      <div className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          あなたのアイデアが、<br className="sm:hidden" />次の動画を創る。
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          YouTuberと視聴者を繋ぐ、<br className="sm:hidden" />新しい企画プラットフォーム
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/channels">
            チャンネル一覧へ
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/sign-in">
            ログイン
          </Link>
        </Button>
      </div>
    </div>
  )
}
