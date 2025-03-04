'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

/**
 * エラーコンポーネント
 * 
 * ページやコンポーネントでエラーが発生した場合に表示されるコンポーネントです。
 * Next.jsのエラーバウンダリによって自動的に表示されます。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('エラーが発生しました:', error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>エラーが発生しました</CardTitle>
          </div>
          <CardDescription>
            申し訳ありませんが、このページの表示中にエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {error.message || 'ページの読み込み中に問題が発生しました。'}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                エラーID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={reset}>
            再試行
          </Button>
          <Button asChild>
            <Link href="/">
              ホームに戻る
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 