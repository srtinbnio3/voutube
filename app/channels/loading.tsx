import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">チャンネル一覧</h1>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 