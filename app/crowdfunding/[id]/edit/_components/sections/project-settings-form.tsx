'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"

interface ProjectSettingsFormProps {
  campaign: any
  /**
   * 未保存の変更状態を親コンポーネントに通知するコールバック関数
   */
  onUnsavedChangesUpdate?: (hasChanges: boolean) => void
  /**
   * キャンペーンデータ更新後に親コンポーネントに通知するコールバック関数
   */
  onCampaignDataUpdate?: () => Promise<void>
}

export function ProjectSettingsForm({ campaign, onUnsavedChangesUpdate, onCampaignDataUpdate }: ProjectSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    target_amount: campaign.target_amount || 10000,
    end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : ""
  })

  // 目標金額の表示用フォーマット
  const [targetAmountDisplay, setTargetAmountDisplay] = useState(
    formatAmountForDisplay(campaign.target_amount || 10000)
  )

  // 初期データ（変更検出のベースライン）を動的に計算
  const initialData = {
    target_amount: campaign.target_amount || 10000,
    end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : ""
  }

  // 未保存の変更を追跡
  const { hasUnsavedChanges, markAsSaved } = useUnsavedChanges(formData, initialData)

  // campaignプロパティが変更された場合にフォームの状態を更新
  useEffect(() => {
    const newFormData = {
      target_amount: campaign.target_amount || 10000,
      end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : ""
    }
    setFormData(newFormData)
    setTargetAmountDisplay(formatAmountForDisplay(campaign.target_amount || 10000))
  }, [campaign.target_amount, campaign.end_date])

  // 未保存の変更状態を親コンポーネントに通知
  useEffect(() => {
    onUnsavedChangesUpdate?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onUnsavedChangesUpdate])

  // 金額フォーマット関数
  function formatAmountForDisplay(amount: number): string {
    return amount.toLocaleString('ja-JP')
  }

  // 金額のパース関数
  function parseAmount(amountString: string): number {
    // カンマを除去して数値に変換
    const cleanAmount = amountString.replace(/,/g, '')
    const amount = parseInt(cleanAmount) || 0
    return amount
  }

  // 目標金額の変更処理
  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // 空文字列の場合は0として扱う
    if (inputValue === '') {
      setTargetAmountDisplay('')
      setFormData({ ...formData, target_amount: 0 })
      return
    }

    // 数字とカンマのみ許可
    const cleanValue = inputValue.replace(/[^\d,]/g, '')
    setTargetAmountDisplay(cleanValue)

    // 数値に変換
    const amount = parseAmount(cleanValue)
    setFormData({ ...formData, target_amount: amount })

    // バリデーション
    const element = e.target as HTMLInputElement
    if (amount < 10000) {
      element.setCustomValidity('目標金額は10,000円以上で入力してください')
    } else if (amount % 1000 !== 0) {
      element.setCustomValidity('目標金額は1,000円単位で入力してください')
    } else {
      element.setCustomValidity('')
    }
  }

  // フォーカスアウト時の処理
  const handleTargetAmountBlur = () => {
    const amount = formData.target_amount
    if (amount >= 10000 && amount % 1000 === 0) {
      // 有効な値の場合はフォーマット表示
      setTargetAmountDisplay(formatAmountForDisplay(amount))
    } else if (amount === 0) {
      // 0の場合は空文字列
      setTargetAmountDisplay('')
    }
  }

  // フォーカス時の処理
  const handleTargetAmountFocus = () => {
    // フォーカス時は数値のみ表示（カンマなし）
    setTargetAmountDisplay(formData.target_amount.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      // 保存成功時に未保存の変更状態をリセット
      markAsSaved()
      
      // キャンペーンデータを更新
      if (onCampaignDataUpdate) {
        await onCampaignDataUpdate()
      }
      
      toast.success("募集設定を更新しました")
    } catch (error) {
      toast.error("更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">募集設定をする</h2>
        <p className="text-muted-foreground">
          目標金額や募集期間などの基本的な設定を行います。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>募集設定</CardTitle>
          <CardDescription>
            目標金額やスケジュールを設定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target_amount">
                目標金額 (円) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="target_amount"
                  type="text"
                  value={targetAmountDisplay}
                  onChange={handleTargetAmountChange}
                  onBlur={handleTargetAmountBlur}
                  onFocus={handleTargetAmountFocus}
                  placeholder="50,000"
                  required
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                最低10,000円から設定可能です（1,000円単位）
              </p>
            </div>

            {/* 募集方式の説明 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">募集方式について</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                目標金額に到達しなくても、集まった支援金を受け取ることができます（All-In方式）。<br />
                <span className="font-medium">※支援されたリターンには、履行義務が発生します。</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                募集終了日 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                max={(() => {
                  const maxDate = new Date()
                  maxDate.setDate(maxDate.getDate() + 99)
                  return maxDate.toISOString().split('T')[0]
                })()}
                required
              />
              <p className="text-xs text-muted-foreground">
                本日から99日先まで設定可能です
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 