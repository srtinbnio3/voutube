import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import { FeedbackChat } from "./_components/feedback-chat"
import { checkAdminPermission } from "@/app/lib/admin-auth"

// 運営とのやりとりページ - クラウドファンディングプロジェクトのフィードバック
export const metadata: Metadata = {
  title: "運営とのやりとり | IdeaTube",
  description: "運営チームとのフィードバック・やりとりページです。",
}

interface FeedbackPageProps {
  params: Promise<{ id: string }>
}

// プロジェクトとフィードバックメッセージを取得する関数
async function fetchCampaignAndMessages(supabase: any, campaignId: string, userId: string) {
  try {
    // キャンペーン情報を取得
    const { data: campaign, error: campaignError } = await supabase
      .from("crowdfunding_campaigns")
      .select(`
        *,
        channel:channels(
          id,
          name,
          icon_url,
          owner_user_id
        ),
        post:posts(
          id, 
          title, 
          description,
          user_id
        )
      `)
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      return { campaign: null, messages: [], error: campaignError }
    }

    // 管理者権限をチェック
    const adminCheck = await checkAdminPermission()
    
    // ユーザーがキャンペーンの所有者か、または管理者かチェック
    const isOwner = campaign.channel?.owner_user_id === userId
    const isAdmin = adminCheck.isAdmin
    
    if (!isOwner && !isAdmin) {
      return { campaign: null, messages: [], error: new Error('権限がありません') }
    }

    // フィードバックメッセージを取得
    const { data: messages, error: messagesError } = await supabase
      .from("campaign_feedback")
      .select(`
        *,
        sender:profiles(
          id,
          username,
          avatar_url
        )
      `)
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true })

    return { 
      campaign, 
      messages: messages || [], 
      error: messagesError,
      isAdmin
    }
  } catch (err) {
    console.error("フィードバック情報取得エラー:", err)
    return { campaign: null, messages: [], error: err, isAdmin: false }
  }
}

export default async function FeedbackPage({
  params
}: FeedbackPageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  console.log("📝 フィードバックページ開始:", { id })

  const supabase = await createClient()

  // ユーザー認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.log("📝 認証エラー - サインインページにリダイレクト")
    redirect("/sign-in")
  }

  console.log("📝 認証成功:", user.id)

  // キャンペーンとメッセージの取得
  const { campaign, messages, error, isAdmin } = await fetchCampaignAndMessages(supabase, id, user.id)

  if (error || !campaign) {
    console.log("📝 キャンペーンが見つからないか権限がない:", { error: error?.message })
    notFound()
  }

  // isAdminのデフォルト値を設定
  const adminStatus = isAdmin ?? false

  console.log("📝 キャンペーン情報とメッセージ取得成功:", { 
    campaignId: campaign.id, 
    messagesCount: messages.length,
    isAdmin: adminStatus
  })

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            運営とのやりとり
          </h1>
          <div className="flex-1"></div>
          {isAdmin ? (
            <a 
              href={`/crowdfunding/${campaign.id}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← プロジェクト詳細に戻る
            </a>
          ) : (
            <a 
              href={`/crowdfunding/${campaign.id}/edit`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← プロジェクト編集に戻る
            </a>
          )}
        </div>
        <p className="text-muted-foreground">
          {campaign.title} のフィードバック・やりとり
          {isAdmin && " (管理者表示)"}
        </p>
      </div>

      <FeedbackChat 
        campaign={campaign}
        initialMessages={messages}
        currentUser={user}
        isAdmin={adminStatus}
      />
    </div>
  )
}