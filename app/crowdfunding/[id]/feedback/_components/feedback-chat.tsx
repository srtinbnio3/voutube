'use client'

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, AlertTriangle, CheckCircle, Clock, HelpCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/hooks/use-toast"

interface FeedbackMessage {
  id: string
  campaign_id: string
  sender_id: string | null
  sender_type: 'user' | 'admin'
  message: string
  message_type: 'feedback' | 'question' | 'response' | 'advice' | 'request_change' | 'approved' | 'rejected'
  is_read: boolean
  admin_name: string | null
  admin_avatar: string | null
  created_at: string
  updated_at: string
  sender?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface Campaign {
  id: string
  title: string
  status: string
  channel: {
    id: string
    name: string
    icon_url: string | null
    owner_user_id: string
  }
}

interface User {
  id: string
  email?: string
}

interface FeedbackChatProps {
  campaign: Campaign
  initialMessages: FeedbackMessage[]
  currentUser: User
  isAdmin: boolean
}

export function FeedbackChat({ campaign, initialMessages, currentUser, isAdmin }: FeedbackChatProps) {
  const [messages, setMessages] = useState<FeedbackMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // デバッグ用：初期メッセージの確認
  useEffect(() => {
    console.log('📝 初期メッセージ:', initialMessages)
    console.log('📝 現在のメッセージ状態:', messages)
  }, [initialMessages, messages])

  // メッセージエリアを最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // リアルタイム更新の設定
  useEffect(() => {
    const channel = supabase
      .channel(`campaign_feedback:${campaign.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_feedback',
          filter: `campaign_id=eq.${campaign.id}`
        },
        (payload) => {
          console.log('📝 リアルタイム更新:', payload)
          
          if (payload.eventType === 'INSERT') {
            // 新しいメッセージを追加
            const newMsg = payload.new as FeedbackMessage
            // 送信者情報も含めてメッセージを構築
            const fullMessage: FeedbackMessage = {
              ...newMsg,
              sender: newMsg.sender_id ? {
                id: newMsg.sender_id,
                username: isAdmin ? 'IdeaTube運営チーム' : 'あなた',
                avatar_url: null
              } : undefined
            }
            setMessages(prev => {
              // 既に同じIDが存在する場合は重複追加しない
              if (prev.some(m => m.id === fullMessage.id)) return prev
              // 送信中の一時メッセージは置き換え対象にする（IDはtemp-で始まる）
              const withoutTemps = prev.filter(m => !m.id.startsWith('temp-'))
              return [...withoutTemps, fullMessage]
            })
          } else if (payload.eventType === 'UPDATE') {
            // メッセージを更新
            const updatedMsg = payload.new as FeedbackMessage
            setMessages(prev => 
              prev.map(msg => 
                msg.id === updatedMsg.id ? updatedMsg : msg
              )
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('📝 リアルタイム購読ステータス:', status)
      })

    return () => {
      console.log('📝 リアルタイム購読を解除')
      supabase.removeChannel(channel)
    }
  }, [campaign.id, supabase, isAdmin])

  // メッセージ送信
  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    
    // 送信中のメッセージをローカルに追加（楽観的更新）
    const tempMessage: FeedbackMessage = {
      id: `temp-${Date.now()}`,
      campaign_id: campaign.id,
      sender_id: currentUser.id,
      sender_type: isAdmin ? 'admin' : 'user',
      message: newMessage.trim(),
      message_type: isAdmin ? 'response' : 'question',
      is_read: false,
      admin_name: isAdmin ? 'IdeaTube運営チーム' : null,
      admin_avatar: isAdmin ? null : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        username: isAdmin ? 'IdeaTube運営チーム' : 'あなた',
        avatar_url: null
      }
    }
    
    setMessages(prev => [...prev, tempMessage])
    const messageToSend = newMessage.trim()
    setNewMessage("")
    
    try {
      const { data: inserted, error } = await supabase
        .from("campaign_feedback")
        .insert({
          campaign_id: campaign.id,
          sender_id: currentUser.id,
          sender_type: isAdmin ? 'admin' : 'user',
          message: messageToSend,
          message_type: isAdmin ? 'response' : 'question',
          is_read: false,
          admin_name: isAdmin ? 'IdeaTube運営チーム' : null,
          admin_avatar: isAdmin ? null : null
        })
        .select()
        .single()

      if (error) throw error

      // 成功時：一時メッセージを実レコードで置換（リアルタイム未到達でも即時反映）
      if (inserted) {
        const confirmed: FeedbackMessage = {
          ...(inserted as FeedbackMessage),
          sender: {
            id: currentUser.id,
            username: isAdmin ? 'IdeaTube運営チーム' : 'あなた',
            avatar_url: null
          }
        }
        setMessages(prev => prev.map(m => m.id.startsWith('temp-') ? confirmed : m))
      } else {
        // 念のため：取得できなければ一時メッセージは残す
      }
      
      toast({
        title: "メッセージを送信しました",
        description: isAdmin ? "ユーザーに返信しました。" : "運営チームからの返信をお待ちください。",
      })
    } catch (error) {
      console.error("メッセージ送信エラー:", error)
      
      // エラー時は一時的なメッセージを削除
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
      
      toast({
        title: "送信に失敗しました",
        description: "しばらく時間をおいて再度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // メッセージタイプに応じたアイコンを取得
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'advice':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'request_change':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'question':
        return <HelpCircle className="h-4 w-4 text-purple-600" />
      case 'response':
        return <MessageSquare className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // メッセージタイプに応じたバッジを取得
  const getMessageBadge = (type: string) => {
    switch (type) {
      case 'advice':
        return <Badge variant="secondary" className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">アドバイス</Badge>
      case 'request_change':
        return <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">修正依頼</Badge>
      case 'approved':
        return <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">承認</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300">却下</Badge>
      case 'question':
        return <Badge variant="secondary" className="text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-300">質問</Badge>
      case 'response':
        return <Badge variant="secondary" className="text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300">返信</Badge>
      default:
        return <Badge variant="secondary">その他</Badge>
    }
  }

  // 日時フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (days === 1) {
      return '昨日 ' + date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          メッセージ
          {isAdmin && <Badge variant="secondary" className="text-xs">管理者</Badge>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* メッセージリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>まだメッセージはありません</p>
              <p className="text-xs mt-1">
                {isAdmin ? "ユーザーからの質問や相談があれば、下記から返信してください" : "質問やご相談がございましたら、下記からメッセージをお送りください"}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 space-y-2 ${
                    message.sender_type === 'admin'
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={
                          message.sender_type === 'admin' 
                            ? message.admin_avatar || undefined 
                            : message.sender?.avatar_url || undefined
                        } />
                        <AvatarFallback className="text-xs">
                          {message.sender_type === 'admin' ? '運営' : 'あなた'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {message.sender_type === 'admin' 
                          ? (message.admin_name || 'IdeaTube運営チーム')
                          : (message.sender?.username || 'あなた')
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {message.sender_type === 'admin' && (
                        <>
                          {getMessageIcon(message.message_type)}
                          {getMessageBadge(message.message_type)}
                        </>
                      )}
                    </div>
                  </div>

                  {/* メッセージ内容 */}
                  <div>
                    <p className={`text-sm leading-relaxed ${
                      message.sender_type === 'admin' 
                        ? 'text-gray-800 dark:text-gray-200' 
                        : 'text-white'
                    }`}>
                      {message.message}
                    </p>
                  </div>

                  {/* 時刻 */}
                  <div className="text-right">
                    <span className={`text-xs ${
                      message.sender_type === 'admin' 
                        ? 'text-muted-foreground' 
                        : 'text-blue-100'
                    }`}>
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* メッセージ入力エリア */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAdmin ? "ユーザーへの返信を入力してください..." : "運営チームへのメッセージを入力してください..."}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ctrl/Cmd + Enter で送信
          </p>
        </div>
      </CardContent>
    </Card>
  )
}