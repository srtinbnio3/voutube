'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ProjectOwnerFormProps {
  campaign: any
}

export function ProjectOwnerForm({ campaign }: ProjectOwnerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [operatorType, setOperatorType] = useState<"individual" | "corporate">("individual")
  
  const [formData, setFormData] = useState({
    bank_name: "",
    bank_branch: "",
    bank_account_type: "普通",
    bank_account_number: "",
    bank_account_holder: ""
  })

  const [corporateFormData, setCorporateFormData] = useState({
    company_name: "",
    representative_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    registration_number: "",
    establishment_date: ""
  })

  const [legalFormData, setLegalFormData] = useState({
    business_name: "",
    representative_name: "",
    business_address: "",
    phone_number: "",
    email_address: "",
    delivery_timing: "",
    return_policy: "",
    other_terms: ""
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
          operator_type: operatorType,
          bank_account_info: formData,
          corporate_info: operatorType === "corporate" ? corporateFormData : null,
          legal_info: legalFormData
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

  const handleCorporateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          corporate_info: corporateFormData
        }),
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      toast.success("法人情報を更新しました")
    } catch (error) {
      toast.error("更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          legal_info: legalFormData
        }),
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      toast.success("特商法表記を更新しました")
    } catch (error) {
      toast.error("更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">オーナー情報を設定する</h2>
        <p className="text-muted-foreground">
          運営主体、振込先口座情報、法人情報、特定商取引法に基づく表記を設定します。
        </p>
      </div>

      {/* 運営主体の選択 */}
      <Card>
        <CardHeader>
          <CardTitle>運営主体</CardTitle>
          <CardDescription>
            プロジェクトの運営主体を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="operator_type"
                  value="individual"
                  checked={operatorType === "individual"}
                  onChange={(e) => setOperatorType(e.target.value as "individual" | "corporate")}
                  className="w-4 h-4"
                />
                <span>個人</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="operator_type"
                  value="corporate"
                  checked={operatorType === "corporate"}
                  onChange={(e) => setOperatorType(e.target.value as "individual" | "corporate")}
                  className="w-4 h-4"
                />
                <span>法人</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 振込先口座情報 */}
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* 法人情報（運営主体が法人の場合表示） */}
      {operatorType === "corporate" && (
        <Card>
          <CardHeader>
            <CardTitle>法人情報</CardTitle>
            <CardDescription>
              法人に関する必要な情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCorporateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">
                    法人名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    value={corporateFormData.company_name}
                    onChange={(e) => setCorporateFormData({ ...corporateFormData, company_name: e.target.value })}
                    placeholder="例: 株式会社〇〇"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representative_name">
                    代表者名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="representative_name"
                    value={corporateFormData.representative_name}
                    onChange={(e) => setCorporateFormData({ ...corporateFormData, representative_name: e.target.value })}
                    placeholder="例: 山田太郎"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">
                  本店所在地 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="company_address"
                  value={corporateFormData.company_address}
                  onChange={(e) => setCorporateFormData({ ...corporateFormData, company_address: e.target.value })}
                  placeholder="例: 〒150-0002 東京都渋谷区渋谷1-1-1"
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_phone">
                    電話番号 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company_phone"
                    value={corporateFormData.company_phone}
                    onChange={(e) => setCorporateFormData({ ...corporateFormData, company_phone: e.target.value })}
                    placeholder="例: 03-1234-5678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_email">
                    メールアドレス <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={corporateFormData.company_email}
                    onChange={(e) => setCorporateFormData({ ...corporateFormData, company_email: e.target.value })}
                    placeholder="例: info@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">
                    法人番号
                  </Label>
                  <Input
                    id="registration_number"
                    value={corporateFormData.registration_number}
                    onChange={(e) => setCorporateFormData({ ...corporateFormData, registration_number: e.target.value })}
                    placeholder="例: 1234567890123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishment_date">
                    設立年月日
                  </Label>
                  <Input
                    id="establishment_date"
                    type="date"
                    value={corporateFormData.establishment_date}
                    onChange={(e) => setCorporateFormData({ ...corporateFormData, establishment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "保存中..." : "法人情報を保存"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 特定商取引法に基づく表記 */}
      <Card>
        <CardHeader>
          <CardTitle>特定商取引法に基づく表記</CardTitle>
          <CardDescription>
            法的に必要な情報を設定します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLegalSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">
                  事業者名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="business_name"
                  value={legalFormData.business_name}
                  onChange={(e) => setLegalFormData({ ...legalFormData, business_name: e.target.value })}
                  placeholder="例: 株式会社〇〇"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_name">
                  代表者名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="representative_name"
                  value={legalFormData.representative_name}
                  onChange={(e) => setLegalFormData({ ...legalFormData, representative_name: e.target.value })}
                  placeholder="例: 山田太郎"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">
                事業者の住所 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="business_address"
                value={legalFormData.business_address}
                onChange={(e) => setLegalFormData({ ...legalFormData, business_address: e.target.value })}
                placeholder="例: 〒150-0002 東京都渋谷区渋谷1-1-1"
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  電話番号 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone_number"
                  value={legalFormData.phone_number}
                  onChange={(e) => setLegalFormData({ ...legalFormData, phone_number: e.target.value })}
                  placeholder="例: 03-1234-5678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_address">
                  メールアドレス <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email_address"
                  type="email"
                  value={legalFormData.email_address}
                  onChange={(e) => setLegalFormData({ ...legalFormData, email_address: e.target.value })}
                  placeholder="例: info@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_timing">
                商品の引渡し時期 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="delivery_timing"
                value={legalFormData.delivery_timing}
                onChange={(e) => setLegalFormData({ ...legalFormData, delivery_timing: e.target.value })}
                placeholder="例: プロジェクト終了後、○ヶ月以内に発送予定"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_policy">
                返品・交換について <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="return_policy"
                value={legalFormData.return_policy}
                onChange={(e) => setLegalFormData({ ...legalFormData, return_policy: e.target.value })}
                placeholder="例: クラウドファンディングの性質上、原則として返品・交換はお受けできません"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_terms">
                その他必要事項
              </Label>
              <Textarea
                id="other_terms"
                value={legalFormData.other_terms}
                onChange={(e) => setLegalFormData({ ...legalFormData, other_terms: e.target.value })}
                placeholder="その他法的に必要な事項があれば記載してください"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "保存中..." : "特商法表記を保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 