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
  Eye
} from "lucide-react"

interface ProjectEditLayoutProps {
  campaign: any
  currentSection: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
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
    label: "支援のお返し（リターン）",
    icon: Gift,
    description: "リターンのアイデアを決めましょう"
  },
  {
    id: "settings",
    label: "募集設定をする",
    icon: Settings,
    description: "目標金額やカテゴリなど"
  },
  {
    id: "image",
    label: "メイン画像を設定する",
    icon: ImageIcon,
    description: "【必須】項目・ページやカードの画像を設定しましょう"
  },
  {
    id: "owner",
    label: "オーナー情報を設定する",
    icon: User,
    description: "【必須項目】本人確認/振込先口座/法人設定/特商法"
  }
]

export function ProjectEditLayout({ campaign, currentSection }: ProjectEditLayoutProps) {
  console.log("🚀 ProjectEditLayout: コンポーネント開始");
  console.log("🚀 campaign:", campaign);
  console.log("🚀 currentSection:", currentSection);
  
  const [activeSection, setActiveSection] = useState(currentSection)

  useEffect(() => {
    console.log("🎯 ProjectEditLayout useEffect実行:", { 
      campaignId: campaign?.id, 
      campaignTitle: campaign?.title,
      currentSection, 
      activeSection 
    })
  }, [campaign?.id, campaign?.title, currentSection, activeSection])

  const renderContent = () => {
    // 一時的に簡素化したコンテンツを表示
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">プロジェクト編集</h2>
          <p className="text-muted-foreground">
            現在のセクション: {activeSection}
          </p>
        </div>
        <div className="bg-muted p-8 rounded-lg">
          <p>セクション「{activeSection}」の編集フォームがここに表示されます。</p>
          <p className="mt-2 text-sm text-muted-foreground">
            プロジェクトID: {campaign.id}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* 左側のナビゲーション */}
      <div className="w-80 bg-white border-r border-border">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/crowdfunding/${campaign.id}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-bold">{campaign.title || "プロジェクトタイトル"}</h1>
              <p className="text-sm text-muted-foreground">{campaign.channel.name}</p>
            </div>
          </div>

          {/* プレビューボタン */}
          <Button variant="outline" className="w-full mb-6 justify-start" asChild>
            <Link href={`/crowdfunding/${campaign.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Link>
          </Button>

          {/* ナビゲーション項目 */}
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = activeSection === item.id
              const Icon = item.icon
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <div className={`font-medium ${isActive ? "text-primary" : ""}`}>
                        {item.label}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 右側のメインコンテンツエリア */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 