'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Gift, 
  MessageSquare, 
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  Plus,
  TrendingUp
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  description: string
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    id: "projects",
    label: "プロジェクト",
    icon: LayoutDashboard,
    href: "/dashboard",
    description: "プロジェクトの概要と管理"
  },
  {
    id: "supporters",
    label: "支援申し込み",
    icon: Users,
    href: "/dashboard/supporters",
    description: "支援者の管理と一覧"
  },
  {
    id: "rewards",
    label: "リターン",
    icon: Gift,
    href: "/dashboard/rewards",
    description: "特典とリターンの管理"
  },
  {
    id: "analytics",
    label: "分析・統計",
    icon: TrendingUp,
    href: "/dashboard/analytics",
    description: "プロジェクトの分析データ"
  },
  {
    id: "messages",
    label: "メッセージ",
    icon: MessageSquare,
    href: "/dashboard/messages",
    description: "支援者とのコミュニケーション"
  },
  {
    id: "help",
    label: "ヘルプ",
    icon: HelpCircle,
    href: "/dashboard/help",
    description: "よくある質問とサポート"
  }
]

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const currentItem = sidebarItems.find(item => item.id === currentPage)

  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements - Same as landing page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* モバイル用のヘッダー */}
      <div className="lg:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">ホームに戻る</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {currentItem?.label || "ダッシュボード"}
            </h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* モバイル用の現在のページ説明 */}
        {currentItem && (
          <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <currentItem.icon className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">{currentItem.description}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* サイドバー */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm lg:border-r lg:border-gray-200 lg:dark:border-gray-700
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'shadow-xl' : ''}
        `}>
          <div className="h-full overflow-y-auto">
            {/* デスクトップ用のヘッダー */}
            <div className="hidden lg:block p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm">ホームに戻る</span>
                </Link>
              </div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                実行者管理画面
              </h1>
              <p className="text-sm text-muted-foreground">
                プロジェクトを管理し、支援者とつながりましょう
              </p>
            </div>

            {/* ナビゲーション項目 */}
            <div className="p-4 lg:p-6">
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = currentPage === item.id
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)} // モバイルでリンクをクリックしたらサイドバーを閉じる
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group block ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? "bg-primary-foreground/20" 
                            : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isActive ? "text-primary-foreground" : "text-gray-600 dark:text-gray-300"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${
                            isActive ? "text-primary-foreground" : "text-gray-900 dark:text-gray-100"
                          }`}>
                            {item.label}
                            {item.badge && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                isActive 
                                  ? "bg-primary-foreground/20 text-primary-foreground" 
                                  : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isActive ? "text-primary-foreground/80" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* オーバーレイ（モバイル用） */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* メインコンテンツエリア */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
} 