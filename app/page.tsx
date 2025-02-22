import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Next.js Supabase Starter</h1>
        <p className="text-xl text-muted-foreground">
          投稿とコミュニケーションのためのプラットフォーム
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/channels">
            チャンネル一覧へ
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/sign-in">
            ログイン
          </Link>
        </Button>
      </div>
    </div>
  )
}
