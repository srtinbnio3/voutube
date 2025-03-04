import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

/**
 * 404 Not Foundページコンポーネント
 * 
 * 存在しないページにアクセスした場合に表示されるページです。
 * Next.jsのnotFound()関数が呼ばれた場合や、
 * 存在しないルートにアクセスした場合に自動的に表示されます。
 */
export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-muted-foreground" />
            <CardTitle>ページが見つかりません</CardTitle>
          </div>
          <CardDescription>
            お探しのページは存在しないか、移動した可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-muted-foreground">404</p>
            <p className="mt-2 text-sm text-muted-foreground">
              URLが正しいかご確認ください。
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
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