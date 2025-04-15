import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { PlayCircle, Sparkles, Users, Video, Lightbulb, Vote, ArrowRight, Coins } from "lucide-react"

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
 * - 特徴セクション
 * - CTAセクション
 */
export default function LandingPage() {
  return (
    <main className="flex flex-col items-center">
      <div className="w-full flex flex-col items-center">
        {/* ヒーローセクション - メインのキャッチフレーズとCTAボタンを表示 */}
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 sm:gap-8 px-4">
          <div className="w-full max-w-6xl flex flex-col items-center justify-center">
            {/* キャッチコピーとサブテキスト */}
            <div className="text-center space-y-4 sm:space-y-6 max-w-4xl">
              <h1 className="text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] via-[#FF4444] to-[#FF6666]">
                <span className="sm:hidden">あなたのアイデアが、<br />次の動画を創る。</span>
                <span className="hidden sm:inline whitespace-nowrap">あなたのアイデアが、次の動画を創る。</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                企画提案と投票で、視聴者とYouTuberをつなぐ。<br className="sm:hidden" />みんなのアイデアから生まれる、次のバズる動画
              </p>
            </div>
            {/* CTAボタンセクション */}
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

        {/* Features Section */}
        <section className="w-full min-h-screen flex items-center bg-background border-t border-border">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              IdeaTubeの特徴
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="p-8 text-center group hover:shadow-lg transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FF0000]/10 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-[#FF0000] relative" />
                </div>
                <h3 className="text-xl font-semibold mb-4">アイデアを共有</h3>
                <p className="text-muted-foreground">
                  あなたの企画アイデアを簡単に投稿。YouTuberに直接届けることができます。
                </p>
              </Card>
              <Card className="p-8 text-center group hover:shadow-lg transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FF0000]/10 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  <Vote className="w-12 h-12 mx-auto mb-4 text-[#FF0000] relative" />
                </div>
                <h3 className="text-xl font-semibold mb-4">投票システム</h3>
                <p className="text-muted-foreground">
                  良いアイデアに投票して、実現に向けて後押しすることができます。
                </p>
              </Card>
              <Card className="p-8 text-center group hover:shadow-lg transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FF0000]/10 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  <Users className="w-12 h-12 mx-auto mb-4 text-[#FF0000] relative" />
                </div>
                <h3 className="text-xl font-semibold mb-4">コミュニティ</h3>
                <p className="text-muted-foreground">
                  同じチャンネルのファン同士でアイデアを磨き上げることができます。
                </p>
              </Card>
              <Card className="p-8 text-center group hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute -right-16 top-6 rotate-45 bg-[#FF0000] text-white px-16 py-1 text-sm font-semibold shadow-lg">
                  Coming Soon
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FF0000]/10 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  <Coins className="w-12 h-12 mx-auto mb-4 text-[#FF0000] relative" />
                </div>
                <h3 className="text-xl font-semibold mb-4">クラウドファンディング</h3>
                <p className="text-muted-foreground">
                  良いアイデアに資金を提供し、企画実現を直接サポートすることができます。
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full min-h-screen flex items-center bg-background border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              あなたのアイデアで、<br className="md:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] via-[#FF4444] to-[#FF6666]">次のバズる動画</span>を創ろう
            </h2>
            <p className="text-xl mb-12 text-muted-foreground">
              今すぐ、推しYoutuberに企画を提案しましょう！
            </p>
            <Button asChild size="lg" className="text-lg group">
              <Link href="/channels" className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 group-hover:animate-pulse" />
                チャンネル一覧へ
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
