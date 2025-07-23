'use client'

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Autocomplete } from "@/components/ui/autocomplete"
import { PostalCodeInput } from "@/components/ui/postal-code-input"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"
import { IdentityVerification } from "./identity-verification"
import { createClient } from "@/utils/supabase/client"

interface ProjectOwnerFormProps {
  campaign: any
}

export function ProjectOwnerForm({ campaign }: ProjectOwnerFormProps) {
  // 現在のユーザーIDを取得
  const [userId, setUserId] = useState<string | null>(null)
  
  // ユーザーIDを取得する関数
  const fetchUserId = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      setUserId(session.user.id)
    }
  }
  
  // コンポーネントマウント時にユーザーIDを取得
  useEffect(() => {
    fetchUserId()
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [operatorType, setOperatorType] = useState<"individual" | "corporate">("individual")
  
  const [formData, setFormData] = useState({
    bank_name: "",
    bank_branch: "",
    bank_account_type: "普通",
    bank_account_number: "",
    bank_account_holder: ""
  })

  // 銀行・支店検索関連の状態
  const [selectedBankCode, setSelectedBankCode] = useState("")
  const [bankOptions, setBankOptions] = useState<any[]>([])
  const [branchOptions, setBranchOptions] = useState<any[]>([])
  const [isBankLoading, setIsBankLoading] = useState(false)
  const [isBranchLoading, setIsBranchLoading] = useState(false)

  // デバウンス処理
  const debouncedBankName = useDebounce(formData.bank_name, 300)
  const debouncedBranchName = useDebounce(formData.bank_branch, 300)

  const [corporateFormData, setCorporateFormData] = useState({
    company_name: "",
    representative_name: "",
    company_postal_code: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    registration_number: "",
    establishment_date: ""
  })

  const [legalFormData, setLegalFormData] = useState({
    business_name: "",
    business_postal_code: "",
    business_address: "",
    phone_number: ""
  })

  // 特商法の表記方法（テンプレート使用 or 入力内容表示）
  const [legalDisplayMethod, setLegalDisplayMethod] = useState<"template" | "input">("template")

  // 銀行検索関数
  const searchBanks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBankOptions([])
      return
    }

    setIsBankLoading(true)
    try {
      const response = await fetch(`/api/banks/search?q=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setBankOptions(data.banks || [])
      } else {
        setBankOptions([])
      }
    } catch (error) {
      console.error("銀行検索エラー:", error)
      setBankOptions([])
    } finally {
      setIsBankLoading(false)
    }
  }, [])

  // 支店検索関数
  const searchBranches = useCallback(async (bankCode: string, query: string = "") => {
    if (!bankCode) {
      setBranchOptions([])
      return
    }

    setIsBranchLoading(true)
    try {
      const url = query 
        ? `/api/banks/${bankCode}/branches?q=${encodeURIComponent(query)}&limit=20`
        : `/api/banks/${bankCode}/branches?limit=20`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBranchOptions(data.branches || [])
      } else {
        setBranchOptions([])
      }
    } catch (error) {
      console.error("支店検索エラー:", error)
      setBranchOptions([])
    } finally {
      setIsBranchLoading(false)
    }
  }, [])

  // デバウンスされた銀行名での検索
  useEffect(() => {
    searchBanks(debouncedBankName)
  }, [debouncedBankName, searchBanks])

  // デバウンスされた支店名での検索（銀行が選択されている場合のみ）
  useEffect(() => {
    if (selectedBankCode) {
      searchBranches(selectedBankCode, debouncedBranchName)
    }
  }, [debouncedBranchName, selectedBankCode, searchBranches])

  // 銀行選択時の処理
  const handleBankSelect = (bank: any) => {
    setSelectedBankCode(bank.code)
    setFormData({ ...formData, bank_name: bank.name, bank_branch: "" })
    setBranchOptions([])
    // 支店データの初期ロード
    searchBranches(bank.code)
  }

  // 支店選択時の処理
  const handleBranchSelect = (branch: any) => {
    setFormData({ ...formData, bank_branch: branch.name })
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
          legal_info: {
            display_method: legalDisplayMethod,
            ...(legalDisplayMethod === "input" ? legalFormData : {})
          }
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

      {/* 本人確認に関する注意事項 */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">本人確認について</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• 本人確認情報は非公開です。プロジェクトページ等では表示されません。</p>
            <p>• 共同または団体でプロジェクトを実施する場合、プロジェクトの代表者（あなた）の情報をご入力ください。</p>
            <p>• 未成年の方は18歳以上の保護者（もしくは代理人）の同意を得て、その方の情報を入力してください。※審査の際に改めて確認する場合があります。</p>
          </div>
        </CardContent>
      </Card>

      {/* 本人確認セクション */}
      {userId && (
        <IdentityVerification 
          campaign={campaign} 
          userId={userId} 
        />
      )}

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
                <Autocomplete
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(value) => setFormData({ ...formData, bank_name: value })}
                  onSelect={handleBankSelect}
                  options={bankOptions}
                  placeholder="例: みずほ銀行"
                  loading={isBankLoading}
                  noOptionsMessage="銀行が見つかりません"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_branch">
                  支店名 <span className="text-destructive">*</span>
                </Label>
                <Autocomplete
                  id="bank_branch"
                  value={formData.bank_branch}
                  onChange={(value) => setFormData({ ...formData, bank_branch: value })}
                  onSelect={handleBranchSelect}
                  options={branchOptions}
                  placeholder={selectedBankCode ? "例: 渋谷支店" : "まず銀行を選択してください"}
                  loading={isBranchLoading}
                  disabled={!selectedBankCode}
                  noOptionsMessage="支店が見つかりません"
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
                  <option value="貯蓄">貯蓄</option>
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

              {/* 郵便番号と住所（法人情報） */}
              <PostalCodeInput
                postalCode={corporateFormData.company_postal_code}
                address={corporateFormData.company_address}
                onPostalCodeChange={(value) => setCorporateFormData({ ...corporateFormData, company_postal_code: value })}
                onAddressChange={(value) => setCorporateFormData({ ...corporateFormData, company_address: value })}
                postalCodeLabel="郵便番号"
                addressLabel="本店所在地"
                postalCodePlaceholder="例: 150-0002"
                addressPlaceholder="例: 東京都渋谷区渋谷1-1-1 〇〇ビル 10F 1001号室"
                required
              />

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
            {/* 特商法の表記方法選択 */}
            <div className="space-y-4">
              <Label>特商法の表記方法</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="legal_display_method"
                    value="template"
                    checked={legalDisplayMethod === "template"}
                    onChange={(e) => setLegalDisplayMethod(e.target.value as "template" | "input")}
                    className="w-4 h-4"
                  />
                  <span>テンプレートを使用する</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">おすすめ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="legal_display_method"
                    value="input"
                    checked={legalDisplayMethod === "input"}
                    onChange={(e) => setLegalDisplayMethod(e.target.value as "template" | "input")}
                    className="w-4 h-4"
                  />
                  <span>入力した内容を表示する</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_name">
                事業者名 <span className="text-destructive">*</span>
              </Label>
              {legalDisplayMethod === "template" ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  <p className="text-sm text-gray-700 dark:text-gray-300">請求があり次第提供します。メッセージ機能にてご連絡ください。</p>
                </div>
              ) : (
                <Input
                  id="business_name"
                  value={legalFormData.business_name}
                  onChange={(e) => setLegalFormData({ ...legalFormData, business_name: e.target.value })}
                  placeholder="例: 株式会社〇〇"
                  required
                />
              )}
            </div>

            {/* 郵便番号と住所（特商法表記） */}
            {legalDisplayMethod === "template" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>郵便番号</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    <p className="text-sm text-gray-700 dark:text-gray-300">請求があり次第提供します。メッセージ機能にてご連絡ください。</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>事業者の住所</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    <p className="text-sm text-gray-700 dark:text-gray-300">請求があり次第提供します。メッセージ機能にてご連絡ください。</p>
                  </div>
                </div>
              </div>
            ) : (
              <PostalCodeInput
                postalCode={legalFormData.business_postal_code}
                address={legalFormData.business_address}
                onPostalCodeChange={(value) => setLegalFormData({ ...legalFormData, business_postal_code: value })}
                onAddressChange={(value) => setLegalFormData({ ...legalFormData, business_address: value })}
                postalCodeLabel="郵便番号"
                addressLabel="事業者の住所"
                postalCodePlaceholder="例: 150-0002"
                addressPlaceholder="例: 東京都渋谷区渋谷1-1-1 〇〇ビル 10F 1001号室"
                required
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="phone_number">
                電話番号 <span className="text-destructive">*</span>
              </Label>
              {legalDisplayMethod === "template" ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  <p className="text-sm text-gray-700 dark:text-gray-300">請求があり次第提供します。メッセージ機能にてご連絡ください。</p>
                </div>
              ) : (
                <Input
                  id="phone_number"
                  value={legalFormData.phone_number}
                  onChange={(e) => setLegalFormData({ ...legalFormData, phone_number: e.target.value })}
                  placeholder="例: 03-1234-5678"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_costs">
                対価以外に必要な費用
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <p className="text-sm text-gray-700 dark:text-gray-300">無し</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notices">
                その他記載事項
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  プロジェクトページ、リターン記載欄、共通記載欄（
                  <a href="https://www.ideatube.net/specified-commercial-code" 
                     className="text-blue-600 hover:text-blue-800 underline" 
                     target="_blank" 
                     rel="noopener noreferrer">
                    https://www.ideatube.net/specified-commercial-code
                  </a>
                  ）をご確認ください。
                </p>
              </div>
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