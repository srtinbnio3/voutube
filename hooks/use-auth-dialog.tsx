"use client"

import { useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

export function useAuthDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // ユーザーの認証状態を確認し、未ログインならダイアログを表示する関数
  const checkAuthAndShowDialog = useCallback(async (redirectPath?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // 未ログインの場合、ダイアログを表示
      setOpen(true)
      return false
    }
    
    // ログイン済みの場合
    return true
  }, [supabase])
  
  // リダイレクト付きのログインページに移動する関数
  const redirectToLogin = useCallback((redirectPath?: string) => {
    const currentPath = redirectPath || window.location.pathname
    router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
  }, [router])
  
  return {
    open,
    setOpen,
    checkAuthAndShowDialog,
    redirectToLogin
  }
} 