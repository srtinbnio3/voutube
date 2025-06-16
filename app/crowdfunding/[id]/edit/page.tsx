import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ProjectOwnershipCheck } from "./_components/project-ownership-check"
import { Metadata } from "next"

// プロジェクト編集ページ - クラウドファンディングプロジェクトの詳細設定
export const metadata: Metadata = {
  title: "プロジェクト編集 | IdeaTube",
  description: "クラウドファンディングプロジェクトを編集します。",
}

interface ProjectEditPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ section?: string }>
}

// データベースからプロジェクトを取得する関数（リトライ機能付き）
async function fetchProjectWithRetry(supabase: any, id: string, userId: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔥 プロジェクト取得試行 ${attempt}/${maxRetries}:`, { id, userId })
    
    try {
      // owner_idを参照せず、シンプルにプロジェクト情報のみ取得
      const { data: campaign, error } = await supabase
        .from("crowdfunding_campaigns")
        .select(`
          *,
          channel:channels(
            id,
            name,
            icon_url,
            youtube_channel_id
          ),
          post:posts(
            id, 
            title, 
            description,
            user_id
          )
        `)
        .eq("id", id)
        .single()

      console.log(`🔥 プロジェクト取得結果 (試行${attempt}):`, { 
        found: !!campaign,
        error: error?.message,
        campaignId: campaign?.id,
        postUserId: campaign?.post?.user_id,
        channelName: campaign?.channel?.name,
        userId 
      })

      // エラーがない場合は結果を返す
      if (!error) {
        return { data: campaign, error: null }
      }

      // 404エラーの場合は、一度だけリトライする
      if (error.code === 'PGRST116' && attempt < maxRetries) {
        console.log(`🔥 プロジェクトが見つかりませんでした。${attempt}秒後にリトライします...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        continue
      }

      // その他のエラーの場合はそのまま返す
      return { data: null, error }
    } catch (err) {
      console.error(`🔥 プロジェクト取得でエラー発生 (試行${attempt}):`, err)
      
      if (attempt === maxRetries) {
        return { data: null, error: err }
      }
      
      await new Promise(resolve => setTimeout(resolve, attempt * 1000))
    }
  }
  
  return { data: null, error: new Error('最大リトライ回数に達しました') }
}

export default async function ProjectEditPage({
  params,
  searchParams
}: ProjectEditPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { id } = resolvedParams
  const { section = "basic" } = resolvedSearchParams

  console.log("�� プロジェクト編集ページ開始:", { id, section })
  console.log("🔥 現在時刻:", new Date().toISOString())

  const supabase = await createClient()

  // ユーザー認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log("🔥 認証チェック結果:", { 
    hasUser: !!user, 
    userId: user?.id, 
    authError: authError?.message 
  })
  
  if (authError || !user) {
    console.log("🔥 認証エラー - サインインページにリダイレクト")
    redirect("/sign-in")
  }

  console.log("🔥 認証成功:", user.id)

  // プロジェクトの取得（リトライ付き）
  const { data: campaign, error } = await fetchProjectWithRetry(supabase, id, user.id)

  if (error || !campaign) {
    console.log("🔥 プロジェクトが見つからない:", { error: error?.message })
    
    // デバッグ用の追加情報を表示
    if (process.env.NODE_ENV === 'development') {
      console.log("🔥 デバッグ情報 - 全キャンペーンを確認:")
      const { data: allCampaigns } = await supabase
    .from("crowdfunding_campaigns")
    .select(`
          id, 
          title, 
          channel_id,
          post:posts(user_id)
    `)
        .limit(10)
      console.log("🔥 存在するキャンペーン:", allCampaigns)
    }
    
    notFound()
  }

  console.log("🔥 プロジェクト情報取得成功 - 所有権確認をクライアントサイドで実行")

  // クライアントサイドで所有権確認を行うコンポーネントに渡す
  return (
    <ProjectOwnershipCheck 
      campaign={campaign}
      section={section}
    />
  )
} 