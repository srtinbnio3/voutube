'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Edit, FileText, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface WorkflowStatusProps {
  campaign: {
    id: string
    status: string
    title: string
    created_at: string
    updated_at: string
  }
  onStatusChange?: () => void
}

type WorkflowStatus = 'draft' | 'under_review' | 'approved' | 'rejected'

interface WorkflowStep {
  id: WorkflowStatus
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'draft',
    title: 'プロジェクト編集',
    description: 'プロジェクトの詳細情報を入力・編集します',
    icon: Edit
  },
  {
    id: 'under_review',
    title: 'IdeaTube運営にて確認',
    description: '運営チームがプロジェクト内容を確認・アドバイスを行います',
    icon: Users
  },
  {
    id: 'approved',
    title: '承認・公開',
    description: 'プロジェクトが承認され、支援者に公開されます',
    icon: CheckCircle
  }
]

export function WorkflowStatus({ campaign, onStatusChange }: WorkflowStatusProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const currentStatus = campaign.status as WorkflowStatus
  const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStatus)
  
  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    try {
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
        throw new Error("提出に失敗しました")
      }

      toast.success("プロジェクトを運営に提出しました")
      onStatusChange?.()
    } catch (error) {
      toast.error("提出に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="gap-1 whitespace-nowrap"><Edit className="h-3 w-3 flex-shrink-0" />編集中</Badge>
      case 'under_review':
        return <Badge variant="default" className="gap-1 whitespace-nowrap"><Clock className="h-3 w-3 flex-shrink-0" />確認中</Badge>
      case 'approved':
        return <Badge variant="default" className="gap-1 whitespace-nowrap bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 flex-shrink-0" />承認済み</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1 whitespace-nowrap"><AlertCircle className="h-3 w-3 flex-shrink-0" />要修正</Badge>
      default:
        return <Badge variant="secondary" className="whitespace-nowrap">未設定</Badge>
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) return 'current'
    return 'pending'
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              プロジェクトの進行状況
            </CardTitle>
            <CardDescription>
              プロジェクトの承認プロセスをご確認ください
            </CardDescription>
          </div>
          {getStatusBadge(currentStatus)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ワークフロー進捗表示 */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(index)
              const Icon = step.icon
              
              return (
                <div key={step.id} className="flex-1">
                  <div className="flex items-start gap-3 lg:flex-col lg:items-center lg:text-center">
                    {/* アイコンとライン */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors
                        ${status === 'completed' 
                          ? 'bg-green-600 border-green-600 text-white' 
                          : status === 'current'
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                        }
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <div className={`
                          hidden lg:block w-0.5 h-8 mt-2 transition-colors
                          ${status === 'completed' ? 'bg-green-600' : 'bg-muted-foreground/30'}
                        `} />
                      )}
                    </div>
                    
                    {/* コンテンツ */}
                    <div className="flex-1 lg:mt-3">
                      <h3 className={`
                        font-medium text-sm
                        ${status === 'current' ? 'text-primary' : status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}
                      `}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 状態別の詳細情報とアクション */}
          {currentStatus === 'draft' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    プロジェクト編集中
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    プロジェクトの基本情報、リターン設定、募集設定などを入力してください。
                    すべての必須項目が完了したら、運営チームに提出できます。
                  </p>
                  <Button 
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "提出中..." : "運営に提出する"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'under_review' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                    運営チームで確認中
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                    IdeaTube運営チームがプロジェクト内容を確認しています。
                    内容に応じてアドバイスや修正依頼をお送りする場合があります。
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    通常、確認には1-3営業日程度お時間をいただいております。
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'approved' && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    プロジェクト承認済み
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                    おめでとうございます！プロジェクトが承認され、支援者に公開されています。
                    プロジェクトページで支援状況を確認できます。
                  </p>
                  <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                    <a href={`/crowdfunding/${campaign.id}`} target="_blank" rel="noopener noreferrer">
                      プロジェクトページを見る
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    修正が必要です
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    運営チームからのフィードバックをご確認いただき、内容を修正してください。
                    修正完了後、再度提出していただけます。
                  </p>
                  <Button 
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {isSubmitting ? "再提出中..." : "再提出する"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 