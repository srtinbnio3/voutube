'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Gift,
  Settings,
  Image as ImageIcon,
  User,
  ChevronRight,
  Loader2,
  RotateCcw
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface ValidationItem {
  id: string
  title: string
  description: string
  section: string
  icon: React.ComponentType<{ className?: string }>
  status: 'completed' | 'incomplete' | 'warning'
  details?: string
}

interface ProjectValidationProps {
  campaign: any
  onValidationComplete: (isValid: boolean, errors: ValidationItem[]) => void
  isVisible?: boolean
}

export function ProjectValidation({ campaign, onValidationComplete, isVisible = false }: ProjectValidationProps) {
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [completionRate, setCompletionRate] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const supabase = createClient()

  // バリデーションチェックを実行
  const runValidation = async () => {
    setIsLoading(true)
    try {
      const items: ValidationItem[] = [
        // 基本情報のバリデーション
        {
          id: 'basic-title',
          title: 'プロジェクトタイトル',
          description: 'わかりやすく魅力的なタイトル',
          section: 'basic',
          icon: FileText,
          status: (campaign.title && campaign.title.length >= 5 && campaign.title.length <= 100) 
            ? 'completed' 
            : 'incomplete',
          details: !campaign.title 
            ? 'タイトルが入力されていません' 
            : campaign.title.length < 5 
            ? 'タイトルは5文字以上で入力してください'
            : campaign.title.length > 100
            ? 'タイトルは100文字以内で入力してください'
            : undefined
        },
        {
          id: 'basic-description',
          title: 'プロジェクト概要',
          description: 'プロジェクトの簡潔な説明',
          section: 'basic',
          icon: FileText,
          status: (campaign.description && campaign.description.length >= 10 && campaign.description.length <= 500) 
            ? 'completed' 
            : 'incomplete',
          details: !campaign.description 
            ? '概要が入力されていません' 
            : campaign.description.length < 10 
            ? '概要は10文字以上で入力してください'
            : campaign.description.length > 500
            ? '概要は500文字以内で入力してください'
            : undefined
        },
        {
          id: 'basic-story',
          title: 'プロジェクトストーリー',
          description: '詳細な背景やビジョン',
          section: 'basic',
          icon: FileText,
          status: (campaign.story && campaign.story.length >= 100) 
            ? 'completed' 
            : campaign.story && campaign.story.length >= 50
            ? 'warning'
            : 'incomplete',
          details: !campaign.story 
            ? 'ストーリーが入力されていません' 
            : campaign.story.length < 50 
            ? 'より詳細なストーリーの入力をお勧めします（50文字以上）'
            : campaign.story.length < 100
            ? 'より詳細なストーリーがあると支援者に伝わりやすくなります（100文字以上推奨）'
            : undefined
        },
        // 募集設定のバリデーション
        {
          id: 'settings-target-amount',
          title: '目標金額',
          description: '現実的な目標設定',
          section: 'settings',
          icon: Settings,
          status: (campaign.target_amount && campaign.target_amount >= 10000 && campaign.target_amount <= 10000000) 
            ? 'completed' 
            : 'incomplete',
          details: !campaign.target_amount 
            ? '目標金額が設定されていません' 
            : campaign.target_amount < 10000 
            ? '目標金額は10,000円以上で設定してください'
            : campaign.target_amount > 10000000
            ? '目標金額は10,000,000円以内で設定してください'
            : undefined
        },
        {
          id: 'settings-dates',
          title: '募集期間',
          description: '開始日と終了日の設定',
          section: 'settings',
          icon: Settings,
          status: (campaign.start_date && campaign.end_date && 
                   new Date(campaign.start_date) < new Date(campaign.end_date) &&
                   new Date(campaign.end_date) > new Date()) 
            ? 'completed' 
            : 'incomplete',
          details: !campaign.start_date || !campaign.end_date
            ? '募集期間が設定されていません'
            : new Date(campaign.start_date) >= new Date(campaign.end_date)
            ? '終了日は開始日より後に設定してください'
            : new Date(campaign.end_date) <= new Date()
            ? '終了日は未来の日付で設定してください'
            : undefined
        },
        // メイン画像のバリデーション
        {
          id: 'image-main',
          title: 'メイン画像',
          description: 'プロジェクトの顔となる画像',
          section: 'image',
          icon: ImageIcon,
          status: campaign.main_image ? 'completed' : 'incomplete',
          details: !campaign.main_image ? 'メイン画像が設定されていません' : undefined
        },
        // オーナー情報のバリデーション
        {
          id: 'owner-identity-verification',
          title: '本人確認',
          description: '身分証明書による本人確認',
          section: 'owner',
          icon: User,
          status: (campaign.identity_verification_required === false) 
            ? 'completed'  // 本人確認が不要な場合は完了扱い
            : (campaign.identity_verification_status === 'verified' || 
               campaign.identity_verification_status === 'succeeded') 
            ? 'completed' 
            : 'incomplete',
          details: (campaign.identity_verification_required !== false &&
                   campaign.identity_verification_status !== 'verified' && 
                   campaign.identity_verification_status !== 'succeeded')
            ? '本人確認が完了していません'
            : undefined
        },
        {
          id: 'owner-bank-info',
          title: '振込先口座情報',
          description: '支援金受け取り用の口座',
          section: 'owner',
          icon: User,
          status: (campaign.bank_account_info && 
                   campaign.bank_account_info.bank_name && 
                   campaign.bank_account_info.bank_account_number) 
            ? 'completed' 
            : 'incomplete',
          details: !campaign.bank_account_info || 
                   !campaign.bank_account_info.bank_name || 
                   !campaign.bank_account_info.bank_account_number
            ? '振込先口座情報が入力されていません'
            : undefined
        }
      ]

      // リターン設定のバリデーション（データベースから取得）
      const { data: rewards, error: rewardsError } = await supabase
        .from("crowdfunding_rewards")
        .select("*")
        .eq("campaign_id", campaign.id)

      if (rewardsError) {
        console.error("リターン取得エラー:", rewardsError)
      }

      const rewardValidation: ValidationItem = {
        id: 'rewards-list',
        title: 'リターン設定',
        description: '支援者への特典・報酬',
        section: 'rewards',
        icon: Gift,
        status: (rewards && rewards.length > 0) 
          ? 'completed' 
          : 'incomplete',
        details: (!rewards || rewards.length === 0) 
          ? '最低1つのリターンを設定してください' 
          : undefined
      }

      items.push(rewardValidation)

      setValidationItems(items)
      
      // 完了率を計算
      const completedItems = items.filter(item => item.status === 'completed').length
      const rate = Math.round((completedItems / items.length) * 100)
      setCompletionRate(rate)

      // 不完全な項目を取得
      const incompleteItems = items.filter(item => item.status === 'incomplete')
      const isValid = incompleteItems.length === 0

      onValidationComplete(isValid, incompleteItems)

    } catch (error) {
      console.error("バリデーションエラー:", error)
    } finally {
      setIsLoading(false)
      setLastUpdated(new Date())
    }
  }

  // コンポーネントマウント時とcampaign変更時にバリデーション実行
  useEffect(() => {
    if (campaign?.id) {
      runValidation()
    }
  }, [campaign?.id, campaign?.title, campaign?.description, campaign?.story, 
      campaign?.target_amount, campaign?.start_date, campaign?.end_date, campaign?.main_image,
      campaign?.identity_verification_status, campaign?.identity_verification_required,
      campaign?.bank_account_info])

  if (!isVisible) {
    return null
  }

  const getSectionLink = (section: string) => {
    const sectionMap: { [key: string]: string } = {
      'basic': 'basic',
      'rewards': 'rewards', 
      'settings': 'settings',
      'image': 'image',
      'owner': 'owner'
    }
    return sectionMap[section] || 'basic'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'incomplete':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">完了</Badge>
      case 'warning':
        return <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">注意</Badge>
      case 'incomplete':
        return <Badge variant="secondary" className="text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300">未完了</Badge>
      default:
        return <Badge variant="secondary">確認中</Badge>
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            提出前チェック
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runValidation}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "チェック中" : "状態を更新"}
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">完了率</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          {lastUpdated && (
            <div className="text-xs text-muted-foreground text-center">
              最終更新: {lastUpdated.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">チェック中...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {validationItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.description}
                      </p>
                      {item.details && (
                        <p className={`text-xs ${
                          item.status === 'incomplete' 
                            ? 'text-red-600 dark:text-red-400' 
                            : item.status === 'warning'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground'
                        }`}>
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.status !== 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="flex-shrink-0"
                    >
                      <a href={`?section=${getSectionLink(item.section)}`}>
                        修正
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {completionRate === 100 && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">すべての項目が完了しました！</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  運営チームに提出する準備が整いました。
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}