'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ProjectSettingsFormProps {
  campaign: any
}

export function ProjectSettingsForm({ campaign }: ProjectSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    target_amount: campaign.target_amount || 10000,
    start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : "",
    end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : ""
  })

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
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setFormData({ ...formData, target_amount: value })
                  // カスタムバリデーションメッセージを設定
                  const element = e.target as HTMLInputElement
                  if (value < 10000) {
                    element.setCustomValidity('目標金額は10,000円以上で入力してください')
                  } else if (value % 1000 !== 0) {
                    element.setCustomValidity('目標金額は1,000円単位で入力してください')
                  } else {
                    element.setCustomValidity('')
                  }
                }}
                placeholder="50000"
                min="10000"
                step="1000"
                required
              />
              <p className="text-xs text-muted-foreground">
                最低10,000円から設定可能です
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  開始日 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  終了日 <span className="text-destructive">*</span>
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