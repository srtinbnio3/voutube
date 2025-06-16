'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface AdminFeedbackProps {
  campaign: {
    id: string
    status: string
    updated_at: string
  }
  // 実際の実装では、feedbackテーブルからデータを取得することを想定
  feedback?: {
    id: string
    message: string
    feedback_type: 'advice' | 'request_change' | 'approved'
    created_at: string
    admin_name: string
    admin_avatar?: string
  }[]
}

// デモ用のフィードバックデータ（実際の実装では API から取得）
const sampleFeedback = [
  {
    id: '1',
    message: 'プロジェクトの企画内容は素晴らしいです！ただし、リターン設定でより具体的な内容をご記載いただけると、支援者にとってより魅力的になります。例えば、限定グッズの詳細な説明や、体験型リターンの具体的な流れなどを追加してください。',
    feedback_type: 'advice' as const,
    created_at: '2024-01-20T10:30:00Z',
    admin_name: 'IdeaTube運営チーム',
    admin_avatar: undefined
  },
  {
    id: '2',
    message: '目標金額の根拠について、もう少し詳しい説明が必要です。制作費用の内訳や、支援金の使用用途を明確にしていただけると、支援者の信頼度が向上します。',
    feedback_type: 'request_change' as const,
    created_at: '2024-01-20T10:35:00Z',
    admin_name: 'IdeaTube運営チーム',
    admin_avatar: undefined
  }
]

export function AdminFeedback({ campaign, feedback = sampleFeedback }: AdminFeedbackProps) {
  if (!feedback || feedback.length === 0) {
    return null
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'advice':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'request_change':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getFeedbackBadge = (type: string) => {
    switch (type) {
      case 'advice':
        return <Badge variant="secondary" className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">アドバイス</Badge>
      case 'request_change':
        return <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">修正依頼</Badge>
      case 'approved':
        return <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">承認</Badge>
      default:
        return <Badge variant="secondary">その他</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          運営からのフィードバック
        </CardTitle>
        <CardDescription>
          IdeaTube運営チームからのアドバイスや修正依頼をご確認ください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.admin_avatar} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      運営
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {item.admin_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getFeedbackIcon(item.feedback_type)}
                  {getFeedbackBadge(item.feedback_type)}
                </div>
              </div>

              {/* フィードバック内容 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))}

          {/* フィードバックがない場合の表示 */}
          {feedback.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>まだフィードバックはありません</p>
              <p className="text-xs mt-1">
                運営チームの確認完了後、こちらにフィードバックが表示されます
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 