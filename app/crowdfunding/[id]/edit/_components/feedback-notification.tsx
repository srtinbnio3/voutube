'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"

interface FeedbackNotificationProps {
  campaign: {
    id: string
    status: string
    title: string
  }
}

interface FeedbackSummary {
  totalMessages: number
  unreadMessages: number
  latestMessage?: {
    id: string
    message: string
    message_type: string
    created_at: string
    sender_type: 'user' | 'admin'
    admin_name?: string
  }
}

export function FeedbackNotification({ campaign }: FeedbackNotificationProps) {
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // フィードバック情報を取得
  useEffect(() => {
    const fetchFeedbackSummary = async () => {
      try {
        // メッセージ総数と未読数を取得
        const { data: messages, error: messagesError } = await supabase
          .from("campaign_feedback")
          .select("*")
          .eq("campaign_id", campaign.id)
          .order("created_at", { ascending: false })

        if (messagesError) {
          console.error("フィードバック取得エラー:", messagesError)
          return
        }

        const totalMessages = messages?.length || 0
        const unreadMessages = messages?.filter(msg => !msg.is_read).length || 0
        const latestMessage = messages?.[0] || null

        setFeedbackSummary({
          totalMessages,
          unreadMessages,
          latestMessage
        })
      } catch (error) {
        console.error("フィードバック情報取得エラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbackSummary()

    // リアルタイム更新の設定
    const channel = supabase
      .channel(`feedback_notification:${campaign.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_feedback',
          filter: `campaign_id=eq.${campaign.id}`
        },
        () => {
          fetchFeedbackSummary()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaign.id, supabase])

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // メッセージがない場合、状況に応じて案内を表示
  if (!feedbackSummary || feedbackSummary.totalMessages === 0) {
    if (campaign.status === 'under_review') {
      return (
        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  運営チームで確認中
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  IdeaTube運営チームがプロジェクト内容を確認しています。内容に応じてアドバイスや修正依頼をお送りする場合があります。
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/crowdfunding/${campaign.id}/feedback`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      運営とのやりとり
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                運営とのやりとり
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                質問やご相談がございましたら、運営チームまでお気軽にお声がけください。
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/crowdfunding/${campaign.id}/feedback`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  メッセージを送る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // メッセージがある場合の表示
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'advice':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'request_change':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case 'advice':
        return <Badge variant="secondary" className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">アドバイス</Badge>
      case 'request_change':
        return <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">修正依頼</Badge>
      case 'approved':
        return <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">承認</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300">却下</Badge>
      default:
        return <Badge variant="secondary">メッセージ</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今日 ' + date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (days === 1) {
      return '昨日'
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <Card className={`mb-6 ${
      feedbackSummary.unreadMessages > 0 
        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20' 
        : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {feedbackSummary.latestMessage && getMessageTypeIcon(feedbackSummary.latestMessage.message_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                運営とのやりとり
              </h3>
              {feedbackSummary.unreadMessages > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {feedbackSummary.unreadMessages}件未読
                </Badge>
              )}
              {feedbackSummary.latestMessage && getMessageTypeBadge(feedbackSummary.latestMessage.message_type)}
            </div>
            
            {feedbackSummary.latestMessage && (
              <div className="mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {feedbackSummary.latestMessage.sender_type === 'admin' 
                    ? `${feedbackSummary.latestMessage.admin_name || 'IdeaTube運営チーム'}: `
                    : 'あなた: '
                  }
                  {feedbackSummary.latestMessage.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(feedbackSummary.latestMessage.created_at)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                総メッセージ数: {feedbackSummary.totalMessages}件
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/crowdfunding/${campaign.id}/feedback`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  やりとりを見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}