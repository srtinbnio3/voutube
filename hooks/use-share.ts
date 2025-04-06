import { useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface UseShareOptions {
  url: string
  text: string
}

export function useShare({ url, text }: UseShareOptions) {
  const { toast } = useToast()

  const handleShare = useCallback(async (type: 'x' | 'copy') => {
    if (type === 'x') {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      window.open(shareUrl, '_blank')
    } else if (type === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        toast({
          title: "リンクをコピーしました",
          description: "URLがクリップボードにコピーされました",
        })
      } catch (error) {
        console.error('コピーエラー:', error)
        toast({
          title: "エラーが発生しました",
          description: "URLのコピーに失敗しました",
          variant: "destructive",
        })
      }
    }
  }, [url, text, toast])

  return { handleShare }
} 