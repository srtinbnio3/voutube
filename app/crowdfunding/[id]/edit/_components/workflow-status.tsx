'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Edit, FileText, Users } from "lucide-react"

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

type WorkflowStatus = 'draft' | 'under_review' | 'approved' | 'needs_revision' | 'rejected'

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

export function WorkflowStatus({ campaign }: WorkflowStatusProps) {
  const currentStatus = campaign.status as WorkflowStatus
  const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStatus)

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="gap-1 whitespace-nowrap"><Edit className="h-3 w-3 flex-shrink-0" />編集中</Badge>
      case 'under_review':
        return <Badge variant="default" className="gap-1 whitespace-nowrap"><Clock className="h-3 w-3 flex-shrink-0" />確認中</Badge>
      case 'approved':
        return <Badge variant="default" className="gap-1 whitespace-nowrap bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 flex-shrink-0" />承認済み</Badge>
      case 'needs_revision':
        return <Badge variant="outline" className="gap-1 whitespace-nowrap border-yellow-600 text-yellow-600"><AlertCircle className="h-3 w-3 flex-shrink-0" />要修正</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1 whitespace-nowrap"><AlertCircle className="h-3 w-3 flex-shrink-0" />却下</Badge>
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
          <div className="flex flex-col space-y-4 lg:space-y-0">
            {/* モバイル用の垂直レイアウト */}
            <div className="lg:hidden space-y-4">
              {workflowSteps.map((step, index) => {
                const status = getStepStatus(index)
                const Icon = step.icon
                
                return (
                  <div key={step.id} className="flex items-start gap-3">
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
                          w-0.5 h-8 mt-2 transition-colors
                          ${status === 'completed' ? 'bg-green-600' : 'bg-muted-foreground/30'}
                        `} />
                      )}
                    </div>
                    
                    {/* コンテンツ */}
                    <div className="flex-1">
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
                )
              })}
            </div>

            {/* デスクトップ用の水平レイアウト */}
            <div className="hidden lg:flex lg:items-center lg:justify-center">
              {workflowSteps.map((step, index) => {
                const status = getStepStatus(index)
                const Icon = step.icon
                
                return (
                  <div key={step.id} className="flex items-center">
                    {/* ステップコンテナ */}
                    <div className="flex flex-col items-center text-center">
                      {/* アイコン */}
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
                      
                      {/* コンテンツ */}
                      <div className="mt-3 min-w-[120px]">
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

                    {/* 水平線（アイコン間を繋ぐ） */}
                    {index < workflowSteps.length - 1 && (
                      <div className={`
                        w-16 h-0.5 mx-4 transition-colors
                        ${status === 'completed' ? 'bg-green-600' : 'bg-muted-foreground/30'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 簡潔な状態表示 */}
          <div className="text-center py-4">
            {currentStatus === 'draft' && (
              <p className="text-sm text-muted-foreground">
                「提出・やりとり」ページから運営チームに提出できます
              </p>
            )}
            {currentStatus === 'under_review' && (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                運営チームで確認中です（通常1-3営業日）
              </p>
            )}
            {currentStatus === 'approved' && (
              <p className="text-sm text-green-700 dark:text-green-300">
                プロジェクトが承認され、公開されています
              </p>
            )}
            {currentStatus === 'rejected' && (
              <p className="text-sm text-red-700 dark:text-red-300">
                修正が必要です。「提出・やりとり」ページをご確認ください
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}