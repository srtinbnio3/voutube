import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { 
  PlayCircle, 
  Users, 
  Lightbulb, 
  Vote, 
  HandCoins, 
  TrendingUp,
  Zap,
  Target,
  Rocket,
  Star,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Heart
} from "lucide-react"

/**
 * IdeaTube ランディングページ
 * 
 * YouTuberと視聴者をつなぐ革新的なプラットフォームのメインページ
 * 
 * 主な機能：
 * - インパクトのあるヒーローセクション
 * - 統計情報による信頼性の演出
 * - プラットフォームの仕組み説明
 * - 特徴とメリットの詳細説明
 * - 強力なCTAセクション
 */
export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">次世代クリエイターエコノミー</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                アイデアが
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x delay-500">
                収益になる
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              あなたの企画アイデアがYouTuberの次のヒット動画になり、
              <br className="hidden md:block" />
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                報酬として還元される
              </span>
              革新的なプラットフォーム
               <br />
               <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                 ※ クラウドファンディング機能は近日公開予定
               </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              asChild 
              size="lg" 
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
            >
              <Link href="/channels" className="flex items-center gap-3">
                <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                今すぐ始める
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            {/* <Button 
              variant="outline" 
              size="lg" 
              className="group border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-6 text-lg"
            >
              <PlayCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              デモを見る
            </Button> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "アクティブユーザー", icon: Users },
              { number: "5M+", label: "投稿されたアイデア", icon: Lightbulb },
              { number: "1.2M+", label: "実現された企画", icon: CheckCircle },
              { number: "¥50M+", label: "総還元額", icon: DollarSign },
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* How It Works Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                シンプルな3ステップ
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              アイデアから収益まで、直感的で分かりやすい仕組み
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "アイデアを投稿",
                description: "あなたの企画アイデアを投稿して、推しYoutuberに提案",
                icon: Lightbulb,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "02", 
                title: "コミュニティ評価",
                description: "他のユーザーが投票で評価。人気のアイデアが上位に表示される",
                icon: Vote,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "03",
                title: "企画実現 & 報酬",
                description: "YouTuberが採用→クラウドファンディング→企画実現 & あなたに報酬",
                icon: HandCoins,
                color: "from-green-500 to-green-600"
              }
            ].map((item, index) => (
              <Card key={index} className="relative p-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`} />
                
                {/* Coming Soon badge for step 03 */}
                {item.step === "03" && (
                  <div className="absolute -right-16 top-6 rotate-45 bg-purple-600 text-white px-16 py-1 text-sm font-semibold shadow-lg">
                    Coming Soon
                  </div>
                )}
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              なぜ
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                IdeaTube
              </span>
              なのか？
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              従来のプラットフォームにはない、革新的な特徴
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "収益化可能なアイデア投稿",
                description: "あなたのアイデアが採用されれば、クラウドファンディング成功時に報酬を獲得",
                icon: TrendingUp,
                highlight: true
              },
              {
                title: "透明性のある評価システム",
                description: "コミュニティによる公正な投票システムで、本当に良いアイデアが浮上",
                icon: Target,
                highlight: false
              },
              {
                title: "直接的なクリエイター連携",
                description: "YouTuberが直接あなたのアイデアを確認し、採用を決定",
                icon: Users,
                highlight: false
              },
              {
                title: "資金調達サポート",
                description: "クラウドファンディング機能で企画実現に必要な資金を調達",
                icon: Rocket,
                highlight: false
              },
              {
                title: "継続的なエンゲージメント",
                description: "企画の進捗をリアルタイムで確認、コミュニティと一緒に成長",
                icon: Heart,
                highlight: false
              },
              {
                title: "インセンティブ設計",
                description: "良質なアイデアを投稿するほど、より多くの報酬獲得チャンス",
                icon: Star,
                highlight: true
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`p-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${
                  feature.highlight ? 'ring-2 ring-purple-200 dark:ring-purple-800' : ''
                } ${feature.title === '資金調達サポート' ? 'relative overflow-hidden' : ''}`}
              >
                {feature.highlight && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-full">
                    注目機能
                  </div>
                )}
                
                {/* Coming Soon badge for 資金調達サポート */}
                {feature.title === '資金調達サポート' && (
                  <div className="absolute -right-16 top-6 rotate-45 bg-purple-600 text-white px-16 py-1 text-sm font-semibold shadow-lg">
                    Coming Soon
                  </div>
                )}
                
                <div className="relative">
                  <feature.icon className="w-10 h-10 mb-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="block text-gray-900 dark:text-white">
                あなたのアイデアで
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                次のバズる動画
              </span>
              <span className="block text-gray-900 dark:text-white">
                を創ろう
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            今すぐ、推しYoutuberに企画を提案しましょう！
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                asChild 
                size="lg" 
                className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-6 text-xl"
              >
                <Link href="/channels" className="flex items-center gap-3">
                  <Zap className="w-6 h-6 group-hover:animate-pulse" />
                  無料で始める
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
          </div>
        </div>
      </section>
    </main>
  )
}
