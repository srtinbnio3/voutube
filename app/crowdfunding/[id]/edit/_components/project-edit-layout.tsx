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
  X,
  Lock,
  CheckCircle
} from "lucide-react"
import { ProjectBasicForm } from "./sections/project-basic-form"
import { ProjectRewardsForm } from "./sections/project-rewards-form"
import { ProjectSettingsForm } from "./sections/project-settings-form"
import { ProjectImageForm } from "./sections/project-image-form"
import { ProjectOwnerForm } from "./sections/project-owner-form"
import { WorkflowStatus } from "./workflow-status"
import { AdminFeedback } from "./admin-feedback"

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
    description: "プロジェクト画像を設定"
  },
  {
    id: "owner",
    label: "オーナー情報",
    icon: User,
    description: "振込先口座/法人設定/特商法"
  }
]

export function ProjectEditLayout({ campaign, currentSection }: ProjectEditLayoutProps) {
  const [activeSection, setActiveSection] = useState(currentSection)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [campaignData, setCampaignData] = useState(campaign)

  useEffect(() => {
    setActiveSection(currentSection)
  }, [currentSection])

  // ステータスに基づく編集権限の確認
  const isEditingLocked = campaignData.status === 'under_review' || campaignData.status === 'approved'
  
  const handleStatusChange = () => {
    // ステータス変更後にキャンペーンデータを再取得
    // 実際の実装では、APIから最新データを取得
    setCampaignData({ ...campaignData, status: 'under_review' })
  }

  const renderContent = () => {
    if (isEditingLocked) {
      return (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            編集が制限されています
          </h3>
          <p className="text-muted-foreground mb-6">
            {campaignData.status === 'under_review' 
              ? 'プロジェクトは現在運営チームで確認中のため、編集できません。'
              : 'プロジェクトは承認済みのため、編集できません。'
            }
          </p>
          <p className="text-sm text-muted-foreground">
            修正が必要な場合は、運営チームからのフィードバックをお待ちください。
          </p>
        </div>
      )
    }

    switch (activeSection) {
      case "basic":
        return <ProjectBasicForm campaign={campaignData} />
      case "rewards":
        return <ProjectRewardsForm campaign={campaignData} />
      case "settings":
        return <ProjectSettingsForm campaign={campaignData} />
      case "image":
        return <ProjectImageForm campaign={campaignData} />
      case "owner":
        return <ProjectOwnerForm campaign={campaignData} />
      default:
        return <ProjectBasicForm campaign={campaignData} />
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
              <Link href={`/crowdfunding/${campaignData.id}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{campaignData.title || "プロジェクト編集"}</h1>
              <p className="text-xs text-muted-foreground truncate">{campaignData.channel.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* モバイル用プレビューボタン */}
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/crowdfunding/${campaignData.id}`}>
                <Eye className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* モバイル用の現在のセクション表示 */}
        {currentSectionItem && !isEditingLocked && (
          <div className="mt-3 space-y-3">
            {/* 現在のセクション表示 */}
            <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <currentSectionItem.icon className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{currentSectionItem.label}</span>
                {currentSectionItem.isRequired && (
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded">必須</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentSectionItem.description}</p>
            </div>

            {/* モバイル用進捗インジケーター */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>編集進捗</span>
                <span>{sidebarItems.findIndex(item => item.id === activeSection) + 1} / {sidebarItems.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((sidebarItems.findIndex(item => item.id === activeSection) + 1) / sidebarItems.length) * 100}%` 
                  }}
                />
              </div>
              
              {/* セクション一覧（水平スクロール） */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sidebarItems.map((item, index) => {
                  const isActive = activeSection === item.id
                  const isCompleted = index < sidebarItems.findIndex(i => i.id === activeSection)
                  const Icon = item.icon
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]"
                    >
                      <div className={`
                        flex h-8 w-8 items-center justify-center rounded-full border transition-colors text-xs
                        ${isActive 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : isCompleted
                          ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`
                        text-xs leading-tight text-center
                        ${isActive ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'}
                      `}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ナビゲーションボタン */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = sidebarItems.findIndex(item => item.id === activeSection)
                  if (currentIndex > 0) {
                    setActiveSection(sidebarItems[currentIndex - 1].id)
                  }
                }}
                disabled={sidebarItems.findIndex(item => item.id === activeSection) === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = sidebarItems.findIndex(item => item.id === activeSection)
                  if (currentIndex < sidebarItems.length - 1) {
                    setActiveSection(sidebarItems[currentIndex + 1].id)
                  }
                }}
                disabled={sidebarItems.findIndex(item => item.id === activeSection) === sidebarItems.length - 1}
                className="flex items-center gap-1"
              >
                次へ
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
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
                  <Link href={`/crowdfunding/${campaignData.id}`}>
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-lg truncate text-gray-900 dark:text-gray-100">{campaignData.title || "プロジェクトタイトル"}</h1>
                  <p className="text-sm text-muted-foreground truncate">{campaignData.channel.name}</p>
                </div>
              </div>

              {/* プレビューボタン */}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/crowdfunding/${campaignData.id}`}>
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
                  const isDisabled = isEditingLocked
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!isDisabled) {
                          setActiveSection(item.id)
                          setIsSidebarOpen(false) // モバイルでセクション選択時にサイドバーを閉じる
                        }
                      }}
                      disabled={isDisabled}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isDisabled
                            ? "bg-gray-100 dark:bg-gray-600"
                            : isActive 
                            ? "bg-primary-foreground/20" 
                            : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isDisabled
                              ? "text-gray-400 dark:text-gray-500"
                              : isActive ? "text-primary-foreground" : "text-gray-600 dark:text-gray-300"
                          }`} />
                          {isDisabled && <Lock className="h-3 w-3 absolute ml-1 mt-1 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`font-medium text-sm ${
                              isDisabled
                                ? "text-gray-400 dark:text-gray-500"
                                : isActive ? "text-primary-foreground" : "text-gray-900 dark:text-gray-100"
                            }`}>
                              {item.label}
                            </div>
                            {item.isRequired && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isDisabled
                                  ? "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500"
                                  : isActive 
                                  ? "bg-primary-foreground/20 text-primary-foreground" 
                                  : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
                              }`}>
                                必須
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isDisabled
                              ? "text-gray-400 dark:text-gray-500"
                              : isActive ? "text-primary-foreground/80" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          isDisabled
                            ? "text-gray-400 dark:text-gray-500"
                            : isActive ? "text-primary-foreground" : "text-gray-400 dark:text-gray-500"
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
            {/* ワークフロー状態表示 */}
            <WorkflowStatus campaign={campaignData} onStatusChange={handleStatusChange} />
            
            {/* 運営フィードバック表示（ステータスに応じて） */}
            {(campaignData.status === 'under_review' || campaignData.status === 'rejected') && (
              <AdminFeedback campaign={campaignData} />
            )}

            {/* デスクトップ用の進捗インジケーター（編集可能時のみ） */}
            {!isEditingLocked && (
              <div className="hidden lg:block mb-8">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>編集進捗</span>
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
            )}

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