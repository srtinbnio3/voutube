'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image as ImageIcon } from "lucide-react"

interface ProjectImageFormProps {
  campaign: any
}

export function ProjectImageForm({ campaign }: ProjectImageFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">メイン画像を設定する</h2>
        <p className="text-muted-foreground">
          プロジェクトのメイン画像を設定します。魅力的な画像がプロジェクトの印象を大きく左右します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>メイン画像</CardTitle>
          <CardDescription>
            プロジェクトページのトップに表示される画像です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">画像をアップロード</h3>
            <p className="text-muted-foreground mb-4">
              推奨サイズ: 1280×720px (16:9) / JPEGまたはPNG形式
            </p>
            <Button disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              画像を選択
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>サムネイル画像</CardTitle>
          <CardDescription>
            一覧ページで表示される小さな画像です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">
              推奨サイズ: 400×300px (4:3)
            </p>
            <Button variant="outline" disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              画像を選択
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 