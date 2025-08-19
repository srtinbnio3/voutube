'use client'

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  SendHorizontal,
  ExternalLink,
  FileCheck
} from "lucide-react"
import { ProjectValidation } from "../project-validation"
import { toast } from "sonner"
import Link from "next/link"

interface ProjectSubmitFormProps {
  campaign: any
  onUnsavedChangesUpdate: (hasChanges: boolean) => void
  onCampaignDataUpdate: () => void
}

type WorkflowStatus = 'draft' | 'under_review' | 'approved' | 'rejected'

export function ProjectSubmitForm({ 
  campaign, 
  onUnsavedChangesUpdate, 
  onCampaignDataUpdate 
}: ProjectSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [isValidationComplete, setIsValidationComplete] = useState(false)
  
  const currentStatus = campaign.status as WorkflowStatus

  // バリデーション結果のコールバック
  const handleValidationComplete = useCallback((isValid: boolean, errors: any[]) => {
    setIsValidationComplete(isValid)
    setValidationErrors(errors)
    onUnsavedChangesUpdate(false) // このページでは変更を追跡しない
  }, [onUnsavedChangesUpdate])

  // 提出処理
  const handleSubmitForReview = async () => {
    // バリデーションチェック
    if (!isValidationComplete) {
      toast.error("提出前に必須項目の入力を完了してください", {
        duration: 6000
      })
      return
    }

    if (validationErrors.length > 0) {
      toast.error(`${validationErrors.length}件の未完了項目があります`, {
        duration: 6000
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log("🔄 プロジェクト提出開始:", campaign.id)
      
      const response = await fetch(`/api/crowdfunding/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "under_review"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("🚨 プロジェクト提出エラー:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        
        // データベース制約エラーの場合の特別な処理
        if (errorData?.error?.includes('crowdfunding_campaigns_status_check') || 
            errorData?.error?.includes('status') ||
            response.status === 500) {
          throw new Error("システムエラー：現在この機能は準備中です。開発チームにお問い合わせください。")
        }
        
        throw new Error(errorData?.error || "提出に失敗しました")
      }

      console.log("✅ プロジェクト提出成功:", campaign.id)
      toast.success("プロジェクトを運営に提出しました")
      onCampaignDataUpdate() // データを再取得
    } catch (error) {
      console.error("🚨 提出処理エラー:", error)
      const errorMessage = error instanceof Error ? error.message : "提出に失敗しました"
      toast.error(errorMessage, {
        duration: 8000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ステータスバッジ取得
  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="gap-1"><FileCheck className="h-3 w-3" />編集中</Badge>
      case 'under_review':
        return <Badge variant="default" className="gap-1"><Clock className="h-3 w-3" />確認中</Badge>
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3" />承認済み</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />要修正</Badge>
      default:
        return <Badge variant="secondary">未設定</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SendHorizontal className="h-5 w-5" />
                提出・やりとり
              </CardTitle>
              <CardDescription>
                プロジェクトの提出前チェックと運営チームとのやりとり
              </CardDescription>
            </div>
            {getStatusBadge(currentStatus)}
          </div>
        </CardHeader>
      </Card>

      {/* 提出前バリデーションチェック */}
      {(currentStatus === 'draft' || currentStatus === 'rejected') && (
        <ProjectValidation 
          campaign={campaign}
          onValidationComplete={handleValidationComplete}
          isVisible={true}
        />
      )}

      {/* 提出アクション（draft状態） */}
      {currentStatus === 'draft' && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <SendHorizontal className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  運営チームに提出する
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                  すべての必須項目を入力完了後、運営チームに提出してプロジェクトの審査を受けることができます。
                  提出後は運営チームが内容を確認し、必要に応じてアドバイスや修正依頼をお送りします。
                </p>
                <Button 
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || !isValidationComplete}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                >
                  {isSubmitting ? "提出中..." : "運営に提出する"}
                </Button>
                {!isValidationComplete && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                    ※ すべての必須項目の入力が完了すると提出できるようになります
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 確認中状態 */}
      {currentStatus === 'under_review' && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  運営チームで確認中
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                  IdeaTube運営チームがプロジェクト内容を確認しています。
                  内容に応じてアドバイスや修正依頼をお送りする場合があります。
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  通常、確認には1-3営業日程度お時間をいただいております。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 承認済み状態 */}
      {currentStatus === 'approved' && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  プロジェクト承認済み
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                  おめでとうございます！プロジェクトが承認され、支援者に公開されています。
                  プロジェクトページで支援状況を確認できます。
                </p>
                <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                  <Link href={`/crowdfunding/${campaign.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    プロジェクトページを見る
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 修正依頼状態 */}
      {currentStatus === 'rejected' && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  修正が必要です
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                  運営チームからのフィードバックをご確認いただき、内容を修正してください。
                  修正完了後、再度提出していただけます。
                </p>
                <Button 
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || !isValidationComplete}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:bg-gray-100"
                >
                  {isSubmitting ? "再提出中..." : "再提出する"}
                </Button>
                {!isValidationComplete && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-3">
                    ※ すべての必須項目の入力が完了すると再提出できるようになります
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* やりとりページへのリンク */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                運営チームとのやりとり
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                質問や相談、フィードバックの確認は専用のやりとりページで行えます。
                運営チームからの重要な連絡もこちらで確認できます。
              </p>
              <Button asChild variant="outline">
                <Link href={`/crowdfunding/${campaign.id}/feedback`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  やりとりページを開く
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}