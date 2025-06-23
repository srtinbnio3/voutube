'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Upload, X, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CampaignReward, RewardFormData } from "@/app/types/crowdfunding"
import { formatAmountForDisplay } from "@/app/lib/stripe"

interface ProjectRewardsFormProps {
  campaign: any
}

interface RewardFormState extends RewardFormData {
  deliveryDate?: string
  isUnlimited?: boolean
  requiresShipping?: boolean
  shippingInfo?: string
  images?: string[]
  template?: string
}

export function ProjectRewardsForm({ campaign }: ProjectRewardsFormProps) {
  const [rewards, setRewards] = useState<CampaignReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingReward, setEditingReward] = useState<CampaignReward | null>(null)
  const [formData, setFormData] = useState<RewardFormState>({
    title: '',
    description: '',
    amount: 500,
    quantity: 1,
    deliveryDate: '',
    isUnlimited: true,
    requiresShipping: false,
    shippingInfo: '',
    images: [],
    template: ''
  })

  // リターン一覧を取得
  useEffect(() => {
    fetchRewards()
  }, [campaign.id])

  const fetchRewards = async () => {
    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}/rewards`)
      if (!response.ok) throw new Error('リターンの取得に失敗しました')
      
      const data = await response.json()
      setRewards(data.rewards || [])
    } catch (error) {
      console.error('リターン取得エラー:', error)
      toast.error('リターンの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // フォームデータをリセット
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: 500,
      quantity: 1,
      deliveryDate: '',
      isUnlimited: true,
      requiresShipping: false,
      shippingInfo: '',
      images: [],
      template: ''
    })
    setEditingReward(null)
  }

  // リターンを保存
  const handleSaveReward = async () => {
    try {
      // バリデーション
      if (!formData.title.trim()) {
        toast.error('リターンのタイトルを入力してください')
        return
      }
      if (!formData.description.trim()) {
        toast.error('リターンの内容を入力してください')
        return
      }
      if (!formData.deliveryDate) {
        toast.error('提供時期を選択してください')
        return
      }
      if (formData.amount < 500 || formData.amount > 2900000) {
        toast.error('価格は500円〜290万円の間で入力してください')
        return
      }
      if (!formData.isUnlimited && formData.quantity < 1) {
        toast.error('個数は1個以上で入力してください')
        return
      }

      const requestData = {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        quantity: formData.isUnlimited ? 999999 : formData.quantity
      }

      let response
      if (editingReward) {
        // 編集の場合
        response = await fetch(`/api/crowdfunding/${campaign.id}/rewards/${editingReward.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
      } else {
        // 新規作成の場合
        response = await fetch(`/api/crowdfunding/${campaign.id}/rewards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'リターンの保存に失敗しました')
      }

      toast.success(editingReward ? 'リターンを更新しました' : 'リターンを追加しました')
      setShowAddDialog(false)
      resetForm()
      fetchRewards()
    } catch (error) {
      console.error('リターン保存エラー:', error)
      toast.error(error instanceof Error ? error.message : 'リターンの保存に失敗しました')
    }
  }

  // リターンを削除
  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('このリターンを削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}/rewards/${rewardId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'リターンの削除に失敗しました')
      }

      toast.success('リターンを削除しました')
      fetchRewards()
    } catch (error) {
      console.error('リターン削除エラー:', error)
      toast.error(error instanceof Error ? error.message : 'リターンの削除に失敗しました')
    }
  }

  // 編集モードを開始
  const startEdit = (reward: CampaignReward) => {
    setEditingReward(reward)
    setFormData({
      title: reward.title,
      description: reward.description,
      amount: reward.amount,
      quantity: reward.quantity,
      deliveryDate: '',
      isUnlimited: reward.quantity >= 999999,
      requiresShipping: false,
      shippingInfo: '',
      images: [],
      template: 'その他'
    })
    setShowAddDialog(true)
  }

  // テンプレート選択時の処理
  const handleTemplateChange = (template: string) => {
    const templates = {
      'お礼のメッセージ': {
        title: '感謝のお礼メッセージ',
        description: 'この度はご支援いただき、誠にありがとうございます。感謝の気持ちを込めて、お礼のメッセージをお送りします。'
      },
      'お名前掲載': {
        title: '制作する動画のエンドロールにお名前を掲載',
        description: 'ご支援いただいた感謝を込めて、本プロジェクトで制作する動画のエンドロールにご希望のお名前（ニックネーム可）を掲載させていただきます。\n\n・掲載方法：動画のエンドロールにテキスト形式で掲載します。\n\n※支援時、必ず備考欄に掲載をご希望されるお名前をご記入ください。ご記入がない場合は、支援いただいたユーザー名を使用させていただきます。'
      },
      'グッズ': {
        title: 'オリジナルデザインのグッズ',
        description: 'オリジナルグッズをお届けします。\n\n・内容：[ここに具体的なグッズ名を入力]\n・数量：1個\n・サイズ：約[サイズを記入]cm'
      },
      'グッズ（衣類）': {
        title: 'オリジナルデザインTシャツ',
        description: 'オリジナルデザインTシャツをお届けします。\n\n・サイズ展開：S, M, L\n・カラー展開：[カラーを記入]\n\n※支援時、備考欄にご希望のサイズとカラーをご記入ください。'
      },
      'イベント招待': {
        title: 'イベントへのご招待',
        description: '〇〇イベントにご招待いたします。\n\n・日程：202X年X月X日 XX時〜XX時（予定）\n・場所：〇〇県〇〇市（詳細は後日ご案内します）\n・ご注意：会場までの交通費や滞在費は、恐れ入りますが各自でご負担をお願いいたします。\n\n※詳細はクラウドファンディング終了後にメールにてご案内いたします。'
      },
      'その他': {
        title: '',
        description: '■ 提供内容：\n\n■ 詳細：\n\n■ 提供方法：\n\n■ 注意事項：'
      }
    }

    const selectedTemplate = templates[template as keyof typeof templates]
    if (selectedTemplate) {
      setFormData({
        ...formData,
        template,
        title: template === 'その他' ? formData.title : selectedTemplate.title,
        description: template === 'その他' ? formData.description : selectedTemplate.description
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">支援のお返し（リターン）</h2>
        <p className="text-muted-foreground">
          支援者への感謝の気持ちとして、リターンを設定しましょう。魅力的なリターンがプロジェクトの成功につながります。
        </p>
      </div>

      {/* 既存リターン一覧 */}
      {rewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">設定済みリターン</h3>
          {rewards.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{reward.title}</h4>
                    <p className="text-primary font-bold text-xl mt-1">
                      {formatAmountForDisplay(reward.amount)}
                    </p>
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                      {reward.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>個数: {reward.quantity >= 999999 ? '無制限' : `${reward.quantity}個`}</span>
                      {reward.quantity < 999999 && (
                        <span>残り: {reward.remaining_quantity}個</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(reward)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* リターン追加セクション */}
      <Card>
        <CardHeader>
          <CardTitle>リターン設定</CardTitle>
          <CardDescription>
            支援金額に応じたお返しを設定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : rewards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              まだリターンが設定されていません
            </p>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    リターンを追加
                  </Button>
                </DialogTrigger>
                <RewardFormDialog 
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSaveReward}
                  onTemplateChange={handleTemplateChange}
                  isEditing={!!editingReward}
                />
              </Dialog>
            </div>
          ) : (
            <div className="text-center py-6">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              リターンを追加
            </Button>
                </DialogTrigger>
                <RewardFormDialog 
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSaveReward}
                  onTemplateChange={handleTemplateChange}
                  isEditing={!!editingReward}
                />
              </Dialog>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// リターンフォームダイアログコンポーネント
function RewardFormDialog({ 
  formData, 
  setFormData, 
  onSave, 
  onTemplateChange,
  isEditing 
}: {
  formData: RewardFormState
  setFormData: (data: RewardFormState) => void
  onSave: () => void
  onTemplateChange: (template: string) => void
  isEditing: boolean
}) {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'リターンを編集' : 'リターンを追加'}
        </DialogTitle>
        <DialogDescription>
          支援者に提供するリターンの詳細を設定してください
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* テンプレート選択 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            リターンテンプレート
          </Label>
          <Select value={formData.template} onValueChange={onTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="テンプレートを選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="お礼のメッセージ">お礼のメッセージ</SelectItem>
              <SelectItem value="お名前掲載">お名前掲載</SelectItem>
              <SelectItem value="グッズ">グッズ</SelectItem>
              <SelectItem value="グッズ（衣類）">グッズ（衣類）</SelectItem>
              <SelectItem value="イベント招待">イベント招待</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            テンプレートを選択すると、内容とタイトルが自動入力されます
          </p>
        </div>
        
        {/* リターンのタイトル */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            リターンのタイトル <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例：感謝のメッセージプラン"
          />
          <p className="text-xs text-muted-foreground">
            支援者にわかりやすい魅力的なタイトルをつけましょう。
          </p>
        </div>

        {/* リターンの内容 */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            リターンの内容 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="支援いただいた方へのお返しとなるサービスや商品などについて詳しく書きましょう"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {formData.template && formData.template !== 'その他'
              ? 'テンプレートの内容が入力されています。内容は自由に編集できます。'
              : 'リターンの詳細な内容を記載してください'
            }
          </p>
        </div>

        {/* 価格設定 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              価格 <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                min="500"
                max="2900000"
                step="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 500 })}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                円
              </span>
            </div>
          </div>

          {/* 提供時期 */}
          <div className="space-y-2">
            <Label htmlFor="deliveryDate" className="text-sm font-medium">
              提供時期 <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.deliveryDate} onValueChange={(value) => setFormData({ ...formData, deliveryDate: value })}>
              <SelectTrigger>
                <SelectValue placeholder="提供時期を選択" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  const now = new Date()
                  const currentYear = now.getFullYear()
                  const currentMonth = now.getMonth() + 1 // 0ベースなので+1
                  const options = []
                  
                  // 現在の月から5年後まで（60ヶ月分）の選択肢を生成
                  for (let i = 0; i < 60; i++) {
                    const targetDate = new Date(currentYear, now.getMonth() + i, 1)
                    const year = targetDate.getFullYear()
                    const month = targetDate.getMonth() + 1
                    const value = `${year}-${month.toString().padStart(2, '0')}`
                    const label = `${year}年 ${month}月`
                    
                    options.push(
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  }
                  
                  return options
                })()}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 画像設定 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">画像設定</Label>
          <p className="text-xs text-muted-foreground mb-3">
            最大5個まで画像を設定することができます。同じサイズの画像をお使いいただけます。
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-primary cursor-pointer">画像を追加</p>
              </div>
            ))}
          </div>
        </div>

        {/* リターンの個数制限 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">リターンの個数制限</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-limit"
                checked={!formData.isUnlimited}
                onCheckedChange={(checked) => setFormData({ ...formData, isUnlimited: !checked })}
              />
              <Label htmlFor="set-limit" className="text-sm">
                リターンに限定数を設定する
              </Label>
            </div>
            
            {!formData.isUnlimited && (
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm">
                  個数
                </Label>
                <div className="relative max-w-xs">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    個
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 発送情報の設定 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">発送情報の設定</Label>
          <p className="text-xs text-muted-foreground">
            支援者に関連情報の回答が求められる情報です。リターンの内容に応じて選択し調整してください。
            メールアドレス・氏名・住所・電話番号・リターンのサイズなど支援者の情報が必要な場合があります。
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresInfo"
                checked={formData.requiresShipping}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresShipping: !!checked })}
              />
              <Label htmlFor="requiresInfo" className="text-sm">
                入力を必須にする
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noInfo"
                checked={!formData.requiresShipping}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresShipping: !checked })}
              />
              <Label htmlFor="noInfo" className="text-sm">
                入力を必須にしない
              </Label>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            必要に応じて詳細な個人情報「リターンの詳細」の入力欄に記載してください。
          </p>
        </div>

        {/* 注意事項 */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">注意事項:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>リターンとは支援のお返しとして支援者に提供するモノやサービスです。お礼の手紙なども設定できます。</li>
            <li>リターンの価格について500円〜290万円の間で設定できます。</li>
            <li>提供予定については5年後までを設定できます。</li>
            <li>リターンの内容に酒類を含めることはできません。</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-2 pt-4">
          <DialogTrigger asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogTrigger>
          <Button onClick={onSave}>
            {isEditing ? '更新する' : '追加する'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
} 