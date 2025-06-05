'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ProjectOwnerFormProps {
  campaign: any
}

export function ProjectOwnerForm({ campaign }: ProjectOwnerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bank_name: "",
    bank_branch: "",
    bank_account_type: "普通",
    bank_account_number: "",
    bank_account_holder: ""
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
        body: JSON.stringify({
          bank_account_info: formData
        }),
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      toast.success("オーナー情報を更新しました")
    } catch (error) {
      toast.error("更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">オーナー情報を設定する</h2>
        <p className="text-muted-foreground">
          振込先口座情報や本人確認など、必要な情報を設定します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>本人確認</CardTitle>
          <CardDescription>
            プロジェクト実行者の本人確認を行います
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              本人確認はまだ完了していません
            </p>
            <Button variant="outline">
              本人確認を開始
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>振込先口座情報</CardTitle>
          <CardDescription>
            支援金を受け取るための口座情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">
                  銀行名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="例: みずほ銀行"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_branch">
                  支店名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bank_branch"
                  value={formData.bank_branch}
                  onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                  placeholder="例: 渋谷支店"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_type">
                  口座種別 <span className="text-destructive">*</span>
                </Label>
                <select
                  id="bank_account_type"
                  value={formData.bank_account_type}
                  onChange={(e) => setFormData({ ...formData, bank_account_type: e.target.value })}
                  className="w-full p-2 border border-border rounded-md"
                  required
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_number">
                  口座番号 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  placeholder="1234567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account_holder">
                口座名義 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank_account_holder"
                value={formData.bank_account_holder}
                onChange={(e) => setFormData({ ...formData, bank_account_holder: e.target.value })}
                placeholder="ヤマダ タロウ"
                required
              />
              <p className="text-xs text-muted-foreground">
                半角カタカナで入力してください
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

      <Card>
        <CardHeader>
          <CardTitle>特定商取引法に基づく表記</CardTitle>
          <CardDescription>
            法的に必要な情報を設定します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              特商法表記の設定はまだ完了していません
            </p>
            <Button variant="outline">
              特商法表記を設定
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 