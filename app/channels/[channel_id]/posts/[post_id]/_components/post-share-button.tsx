"use client"

import { useShare } from "@/hooks/use-share"
import { ShareButton } from "@/components/share-button"

// このコンポーネントが受け取る情報の型を定義します
interface PostShareButtonProps {
  postId: string
  channelId: string
  title: string
}

// 投稿シェアボタンコンポーネント
export function PostShareButton({ postId, channelId, title }: PostShareButtonProps) {
  // 共通化されたシェア機能を使用
  const { handleShare } = useShare({
    url: `${window.location.origin}/channels/${channelId}/posts/${postId}`,
    text: title
  })

  return (
    <ShareButton onShare={handleShare} />
  )
} 