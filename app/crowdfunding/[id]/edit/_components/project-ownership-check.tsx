"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { ProjectEditLayout } from "./project-edit-layout"

interface Campaign {
  id: string
  title: string
  description: string
  target_amount: number
  current_amount: number
  start_date: string
  end_date: string
  status: string
  reward_enabled: boolean
  created_at: string
  channel: {
    id: string
    name: string
    icon_url: string
    youtube_channel_id: string
  }
  post: {
    id: string
    title: string
    description: string
    user_id: string
  }
}

interface ProjectOwnershipCheckProps {
  campaign: Campaign
  section: string
}

export function ProjectOwnershipCheck({ campaign, section }: ProjectOwnershipCheckProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkOwnership() {
      try {
        console.log("🔥 クライアントサイド所有権確認開始:", {
          campaignId: campaign.id,
          channelId: campaign.channel.id
        })

        // 現在のユーザーを取得
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          console.log("🔥 認証エラー:", userError?.message)
          router.push("/sign-in")
          return
        }

        setUser(currentUser)
        console.log("🔥 ユーザー確認成功:", currentUser.id)

        // YouTube API所有権確認
        const response = await fetch("/api/youtube/verify-ownership", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ channelId: campaign.channel.id })
        })

        const data = await response.json()
        
        console.log("🔥 所有権確認結果:", {
          status: response.status,
          isOwner: data.isOwner,
          error: data.error
        })

        if (!response.ok) {
          setError(data.error || "所有権確認に失敗しました")
          setHasPermission(false)
        } else {
          setHasPermission(data.isOwner || false)
          if (!data.isOwner) {
            setError("このチャンネルの所有者ではありません")
          }
        }
      } catch (error) {
        console.error("🔥 所有権確認エラー:", error)
        setError("所有権確認中にエラーが発生しました")
        setHasPermission(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkOwnership()
  }, [campaign.channel.id, router, supabase.auth])

  // ローディング状態
  if (isChecking) {
    return (
      <main className="relative overflow-hidden min-h-screen">
        {/* Background Elements - Same as landing page */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
        </div>
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border-2 border-blue-200 dark:border-blue-700 rounded-lg p-8 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">所有権確認中...</h2>
              <p className="text-muted-foreground">
                YouTubeチャンネルの所有権を確認しています。<br />
                しばらくお待ちください。
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 権限がない場合
  if (!hasPermission) {
    return (
      <main className="relative overflow-hidden min-h-screen">
        {/* Background Elements - Same as landing page */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow" />
        </div>
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border-2 border-red-200 dark:border-red-700 rounded-lg p-8 shadow-lg">
              <div className="text-red-500 dark:text-red-400 text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold mb-4 text-foreground">アクセス権限がありません</h1>
              <p className="mb-6 text-muted-foreground">
                このプロジェクトを編集する権限がありません。<br />
                クラウドファンディングはチャンネル所有者（YouTuber本人）のみが編集できます。
              </p>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4">
                  エラー詳細: {error}
                </div>
              )}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>プロジェクト:</strong> {campaign.title}<br />
                  <strong>チャンネル:</strong> {campaign.channel.name}<br />
                  {/* 開発環境でのみユーザーIDを表示（デバッグ用） */}
                  {process.env.NODE_ENV === 'development' && user && (
                    <><strong>現在のユーザー:</strong> {user.id}</>
                  )}
                </p>
                <div className="mt-6">
                  <a
                    href={`/channels/${campaign.channel.id}/posts/${campaign.post.id}`}
                    className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    ← 投稿詳細に戻る
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 権限がある場合 - 実際の編集画面を表示
  return (
    <ProjectEditLayout 
      campaign={campaign} 
      currentSection={section} 
    />
  )
} 