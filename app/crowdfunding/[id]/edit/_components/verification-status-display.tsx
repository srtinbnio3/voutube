'use client'

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Shield,
  Eye,
  Loader2
} from "lucide-react"

interface VerificationStatusDisplayProps {
  campaignId: string
  showDetails?: boolean
  onVerificationUpdate?: (status: string) => void
}

interface VerificationData {
  id: string
  verification_session: {
    id: string
    status: string
    url: string
  }
  verification_type: string
  verified_data?: any
  verified_at?: string
  created_at: string
}

export function VerificationStatusDisplay({ 
  campaignId, 
  showDetails = false,
  onVerificationUpdate 
}: VerificationStatusDisplayProps) {
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 本人確認情報を取得
  const fetchVerification = async () => {
    try {
      const response = await fetch(`/api/identity/verification?campaign_id=${campaignId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.verifications && data.verifications.length > 0) {
          const latestVerification = data.verifications[0]
          
          // セッション詳細を取得
          const sessionResponse = await fetch(`/api/identity/verification/${latestVerification.stripe_verification_session_id}`)
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            setVerification(sessionData)
            
            // 親コンポーネントに状況通知
            if (onVerificationUpdate) {
              onVerificationUpdate(sessionData.verification_session.status)
            }
          } else {
            setVerification(latestVerification)
            if (onVerificationUpdate) {
              onVerificationUpdate(latestVerification.verification_status)
            }
          }
        } else {
          setVerification(null)
          if (onVerificationUpdate) {
            onVerificationUpdate('not_started')
          }
        }
      }
    } catch (error) {
      console.error("本人確認情報の取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  // 状況確認（手動更新）
  const refreshStatus = async () => {
    setRefreshing(true)
    await fetchVerification()
    setRefreshing(false)
  }

  // コンポーネントマウント時に取得
  useEffect(() => {
    fetchVerification()
  }, [campaignId])

  // ステータスに応じたバッジを表示
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            確認済み
          </Badge>
        )
      case 'pending':
      case 'requires_input':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            確認中
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            処理中
          </Badge>
        )
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            キャンセル
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            未実施
          </Badge>
        )
    }
  }

  // ローディング中
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">本人確認状況を確認中...</span>
      </div>
    )
  }

  // シンプル表示モード
  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">本人確認:</span>
        {verification ? 
          getStatusBadge(verification.verification_session.status) : 
          getStatusBadge('not_started')
        }
      </div>
    )
  }

  // 詳細表示モード
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">本人確認状況</CardTitle>
          </div>
          {verification ? 
            getStatusBadge(verification.verification_session.status) : 
            getStatusBadge('not_started')
          }
        </div>
        <CardDescription>
          Stripe Identityによる本人確認の進行状況
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {verification ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">確認タイプ</p>
                <p className="text-sm text-muted-foreground">
                  {verification.verification_type === 'individual' ? '個人' : '法人'}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshStatus}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                状況確認
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium">作成日時</p>
              <p className="text-sm text-muted-foreground">
                {new Date(verification.created_at).toLocaleString('ja-JP')}
              </p>
            </div>

            {verification.verified_at && (
              <div>
                <p className="text-sm font-medium">確認完了日時</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(verification.verified_at).toLocaleString('ja-JP')}
                </p>
              </div>
            )}

            {verification.verification_session.status === 'verified' && verification.verified_data && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">確認完了</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  本人確認が正常に完了しました。クラウドファンディングの開始が可能です。
                </p>
              </div>
            )}

            {verification.verification_session.status === 'canceled' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">確認キャンセル</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  本人確認がキャンセルされました。再度実施してください。
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">未実施</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              本人確認がまだ実施されていません。クラウドファンディングを開始するには本人確認が必要です。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 