"use client"

import { useShare } from "@/hooks/use-share"
import { ShareButton } from "@/components/share-button"
import { useEffect, useState } from "react"

// このコンポーネントが受け取る情報の型を定義します
interface PostShareButtonProps {
  postId: string
  channelId: string
  title: string
}

// 投稿シェアボタンコンポーネント
export function PostShareButton({ postId, channelId, title }: PostShareButtonProps) {
  const [url, setUrl] = useState("")

  // クライアントサイドでのみURLを生成
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/channels/${channelId}/posts/${postId}`)
    }
  }, [channelId, postId])

  // 共通化されたシェア機能を使用
  const { handleShare } = useShare({
    url,
    text: title
  })

  // URLが設定されるまでは何も表示しない
  if (!url) return null

  return (
    <ShareButton onShare={handleShare} />
  )
} 