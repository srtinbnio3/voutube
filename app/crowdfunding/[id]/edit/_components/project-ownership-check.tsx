"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
// import { ProjectEditLayout } from "./project-edit-layout"

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-8 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">所有権確認中...</h2>
              <p className="text-gray-600">
                YouTubeチャンネルの所有権を確認しています。<br />
                しばらくお待ちください。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 権限がない場合
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white border-2 border-red-200 rounded-lg p-8 shadow-lg">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold mb-4">アクセス権限がありません</h1>
              <p className="mb-6">
                このプロジェクトを編集する権限がありません。<br />
                クラウドファンディングはチャンネル所有者（YouTuber本人）のみが編集できます。
              </p>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                  エラー詳細: {error}
                </div>
              )}
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  <strong>プロジェクト:</strong> {campaign.title}<br />
                  <strong>チャンネル:</strong> {campaign.channel.name}<br />
                  {user && <><strong>現在のユーザー:</strong> {user.id}</>}
                </p>
                <div className="mt-6">
                  <a
                    href={`/channels/${campaign.channel.id}/posts/${campaign.post.id}`}
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    ← 投稿詳細に戻る
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 権限がある場合 - 編集画面を表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8">
        <div className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">🎉 アクセス権限確認完了！</h2>
          <p className="text-lg">YouTube API所有権確認が正常に動作し、編集権限が確認されました。</p>
          <p className="text-sm mt-2">確認時刻: {new Date().toLocaleString('ja-JP')}</p>
        </div>
        
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">🛠️ プロジェクト編集</h1>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-3 text-gray-700">📋 プロジェクト情報</h3>
              <div className="space-y-2 text-lg">
                <p><strong>ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{campaign.id}</code></p>
                <p><strong>タイトル:</strong> {campaign.title}</p>
                <p><strong>チャンネル:</strong> {campaign.channel.name}</p>
                <p><strong>投稿:</strong> {campaign.post.title}</p>
                <p><strong>ステータス:</strong> <span className="bg-yellow-100 px-2 py-1 rounded">{campaign.status}</span></p>
                <p><strong>作成日時:</strong> {new Date(campaign.created_at).toLocaleString('ja-JP')}</p>
                <p><strong>投稿者ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{campaign.post.user_id}</code></p>
                {user && <p><strong>現在のユーザーID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{user.id}</code></p>}
                <p><strong>現在のセクション:</strong> <span className="bg-blue-100 px-2 py-1 rounded">{section}</span></p>
              </div>
            </div>
            
            <div className="border-t-2 pt-6">
              <h3 className="font-bold text-xl mb-3 text-gray-700">🚀 次のステップ</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 text-lg">
                  権限確認が完了しました。ProjectEditLayoutコンポーネントを有効化できます。
                </p>
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✅ クライアントサイドでのYouTube API所有権確認が正常に動作しました
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  // 実際の編集画面を表示する場合（一時的にコメントアウト）
  // return (
  //   <ProjectEditLayout 
  //     campaign={campaign} 
  //     currentSection={section} 
  //   />
  // )
} 