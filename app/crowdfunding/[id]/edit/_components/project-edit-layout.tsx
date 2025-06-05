'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  FileText, 
  Gift, 
  Settings, 
  Image as ImageIcon, 
  User,
  Eye,
  Menu,
  X
} from "lucide-react"
import { ProjectBasicForm } from "./sections/project-basic-form"
import { ProjectRewardsForm } from "./sections/project-rewards-form"
import { ProjectSettingsForm } from "./sections/project-settings-form"
import { ProjectImageForm } from "./sections/project-image-form"
import { ProjectOwnerForm } from "./sections/project-owner-form"

interface ProjectEditLayoutProps {
  campaign: any
  currentSection: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  isRequired?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    id: "basic",
    label: "ページ作成",
    icon: FileText,
    description: "概要文 / タイトル / ストーリー"
  },
  {
    id: "rewards",
    label: "リターン設定",
    icon: Gift,
    description: "支援者への特典を設定"
  },
  {
    id: "settings",
    label: "募集設定",
    icon: Settings,
    description: "目標金額やカテゴリなど"
  },
  {
    id: "image",
    label: "メイン画像",
    icon: ImageIcon,
    description: "プロジェクト画像を設定",
    isRequired: true
  },
  {
    id: "owner",
    label: "オーナー情報",
    icon: User,
    description: "本人確認や振込先口座",
    isRequired: true
  }
]

export function ProjectEditLayout({ campaign, currentSection }: ProjectEditLayoutProps) {
  const [activeSection, setActiveSection] = useState(currentSection)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setActiveSection(currentSection)
  }, [currentSection])

  const renderContent = () => {
    switch (activeSection) {
      case "basic":
        return <ProjectBasicForm campaign={campaign} />
      case "rewards":
        return <ProjectRewardsForm campaign={campaign} />
      case "settings":
        return <ProjectSettingsForm campaign={campaign} />
      case "image":
        return <ProjectImageForm campaign={campaign} />
      case "owner":
        return <ProjectOwnerForm campaign={campaign} />
      default:
        return <ProjectBasicForm campaign={campaign} />
    }
  }

  const currentSectionItem = sidebarItems.find(item => item.id === activeSection)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* モバイル用のヘッダー */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/crowdfunding/${campaign.id}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{campaign.title || "プロジェクト編集"}</h1>
              <p className="text-xs text-muted-foreground">{campaign.channel.name}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* モバイル用の現在のセクション表示 */}
        {currentSectionItem && (
          <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <currentSectionItem.icon className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{currentSectionItem.label}</span>
              {currentSectionItem.isRequired && (
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded">必須</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currentSectionItem.description}</p>
          </div>
        )}
      </div>

      <div className="flex">
        {/* サイドバー */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'bg-white dark:bg-gray-800 shadow-xl' : 'bg-white dark:bg-gray-800'}
        `}>
          <div className="h-full overflow-y-auto">
            {/* デスクトップ用のヘッダー */}
            <div className="hidden lg:block p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/crowdfunding/${campaign.id}`}>
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-lg truncate text-gray-900 dark:text-gray-100">{campaign.title || "プロジェクトタイトル"}</h1>
                  <p className="text-sm text-muted-foreground truncate">{campaign.channel.name}</p>
                </div>
              </div>

              {/* プレビューボタン */}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/crowdfunding/${campaign.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  プレビュー
                </Link>
              </Button>
            </div>

            {/* ナビゲーション項目 */}
            <div className="p-4 lg:p-6">
              <div className="space-y-1">
                {sidebarItems.map((item, index) => {
                  const isActive = activeSection === item.id
                  const Icon = item.icon
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id)
                        setIsSidebarOpen(false) // モバイルでセクション選択時にサイドバーを閉じる
                      }}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
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
                          <div className="flex items-center gap-2">
                            <div className={`font-medium text-sm ${
                              isActive ? "text-primary-foreground" : "text-gray-900 dark:text-gray-100"
                            }`}>
                              {item.label}
                            </div>
                            {item.isRequired && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isActive 
                                  ? "bg-primary-foreground/20 text-primary-foreground" 
                                  : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
                              }`}>
                                必須
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isActive ? "text-primary-foreground/80" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          isActive ? "text-primary-foreground" : "text-gray-400 dark:text-gray-500"
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* オーバーレイ（モバイル用） */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* メインコンテンツエリア */}
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">
            {/* デスクトップ用の進捗インジケーター */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>進捗状況</span>
                <span>{sidebarItems.findIndex(item => item.id === activeSection) + 1} / {sidebarItems.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((sidebarItems.findIndex(item => item.id === activeSection) + 1) / sidebarItems.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* コンテンツ */}
            <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 