'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  Shield,
  Eye,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface IdentityVerificationProps {
  campaign: any
  userId: string
}

interface VerificationData {
  id: string
  verification_session: {
    id: string
    status: string
    url: string
    created: number
    client_secret: string
  }
  verification_type: string
  verified_data?: any
  verified_at?: string
  created_at: string
  updated_at: string
}

export function IdentityVerification({ campaign, userId }: IdentityVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // 本人確認情報を取得
  const fetchVerification = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/identity/verification?campaign_id=${campaign.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.verifications && data.verifications.length > 0) {
          // 最新の本人確認情報を使用
          const latestVerification = data.verifications[0]
          
          // セッション詳細を取得
          const sessionResponse = await fetch(`/api/identity/verification/${latestVerification.stripe_verification_session_id}`)
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            setVerification(sessionData)
          } else {
            setVerification(latestVerification)
          }
        }
      }
    } catch (error) {
      console.error("本人確認情報の取得エラー:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // 本人確認セッションを開始
  const startVerification = async () => {
    setIsLoading(true)
    try {
      const returnUrl = `${window.location.origin}/crowdfunding/${campaign.id}/edit?tab=owner&verification=completed`
      
      const response = await fetch('/api/identity/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          verification_type: 'individual',
          return_url: returnUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '本人確認セッションの作成に失敗しました')
      }

      const data = await response.json()
      
      // Stripeの本人確認ページにリダイレクト
      if (data.verification_session.url) {
        window.location.href = data.verification_session.url
      } else {
        toast.error('本人確認URLの取得に失敗しました')
      }

    } catch (error) {
      console.error('本人確認セッション作成エラー:', error)
      toast.error(error instanceof Error ? error.message : '本人確認の開始に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // コンポーネントマウント時に本人確認情報を取得
  useEffect(() => {
    fetchVerification()
  }, [campaign.id])

  // URLパラメータで完了フラグがある場合の処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('verification') === 'completed') {
      // 完了後の状態更新のため少し待ってから再取得
      setTimeout(() => {
        fetchVerification()
      }, 2000)
    }
  }, [])

  // ステータスに応じたバッジを表示
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3 mr-1" />確認済み</Badge>
      case 'pending':
      case 'requires_input':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"><Clock className="h-3 w-3 mr-1" />確認中</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><Loader2 className="h-3 w-3 mr-1 animate-spin" />処理中</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><XCircle className="h-3 w-3 mr-1" />キャンセル</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"><AlertCircle className="h-3 w-3 mr-1" />未確認</Badge>
    }
  }

  // 確認済みデータの表示
  const renderVerifiedData = (data: any) => {
    if (!data) return null

    return (
      <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Shield className="h-4 w-4" />
          <span className="font-medium">確認済み情報</span>
        </div>
        
        {data.firstName && data.lastName && (
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-muted-foreground">名前</span>
              <p className="font-medium">{data.firstName} {data.lastName}</p>
            </div>
          </div>
        )}
        
        {data.dateOfBirth && (
          <div>
            <span className="text-sm text-muted-foreground">生年月日</span>
            <p className="font-medium">
              {data.dateOfBirth.year}年{data.dateOfBirth.month}月{data.dateOfBirth.day}日
            </p>
          </div>
        )}
        
        {data.address && (
          <div>
            <span className="text-sm text-muted-foreground">住所</span>
            <p className="font-medium">
              {data.address.country && `${data.address.country} `}
              {data.address.state && `${data.address.state} `}
              {data.address.city && `${data.address.city} `}
              {data.address.line1 && `${data.address.line1}`}
              {data.address.line2 && ` ${data.address.line2}`}
              {data.address.postalCode && ` ${data.address.postalCode}`}
            </p>
          </div>
        )}
        
        {data.verifiedAt && (
          <div>
            <span className="text-sm text-muted-foreground">確認日時</span>
            <p className="font-medium">{new Date(data.verifiedAt).toLocaleString('ja-JP')}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          本人確認
        </h2>
        <p className="text-muted-foreground">
          クラウドファンディングを開始するには、Stripe Identityによる本人確認が必要です。
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                身分証明書による本人確認
              </CardTitle>
              <CardDescription>
                政府発行の身分証明書を使用して本人確認を行います
              </CardDescription>
            </div>
            {verification && getStatusBadge(verification.verification_session.status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 本人確認未実施の場合 */}
          {!verification && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  本人確認が完了していません。クラウドファンディングを開始するには、
                  身分証明書による本人確認が必要です。
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">必要な書類</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 運転免許証</li>
                  <li>• パスポート</li>
                  <li>• マイナンバーカード</li>
                  <li>• その他の政府発行身分証明書</li>
                </ul>
              </div>
              
              <Button 
                onClick={startVerification} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    セッション作成中...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    本人確認を開始
                  </>
                )}
              </Button>
            </div>
          )}

          {/* 本人確認実施済みの場合 */}
          {verification && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">確認状況</p>
                  <p className="text-sm text-muted-foreground">
                    作成日: {new Date(verification.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchVerification}
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

              {/* 確認完了時の情報表示 */}
              {verification.verification_session.status === 'verified' && verification.verified_data && (
                renderVerifiedData(verification.verified_data)
              )}

              {/* 確認中の場合 */}
              {(verification.verification_session.status === 'requires_input' || 
                verification.verification_session.status === 'processing') && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    本人確認が進行中です。Stripeでの確認プロセスが完了するまでお待ちください。
                  </div>
                </div>
              )}

              {/* キャンセルされた場合 */}
              {verification.verification_session.status === 'canceled' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      本人確認がキャンセルされました。クラウドファンディングを開始するには、
                      再度本人確認を実施してください。
                    </div>
                  </div>
                  
                  <Button 
                    onClick={startVerification} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        再開中...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        本人確認を再開
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 