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
    target_amount: campaign.target_amount || 0,
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
        <h2 className="text-2xl font-bold mb-2">募集設定をする</h2>
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
                onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                placeholder="100000"
                min="1000"
                step="1000"
                required
              />
              <p className="text-xs text-muted-foreground">
                最低1,000円から設定可能です
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
                  required
                />
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