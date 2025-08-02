'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { uploadProjectMainImageAction, uploadProjectThumbnailImageAction, deleteProjectImageAction } from "@/app/actions/profile"
import { toast } from "sonner"

interface ProjectImageFormProps {
  campaign: any
  /**
   * 未保存の変更状態を親コンポーネントに通知するコールバック関数
   */
  onUnsavedChangesUpdate?: (hasChanges: boolean) => void
  /**
   * キャンペーンデータ更新を親コンポーネントに通知するコールバック関数
   */
  onCampaignDataUpdate?: () => Promise<void>
}

export function ProjectImageForm({ campaign, onUnsavedChangesUpdate, onCampaignDataUpdate }: ProjectImageFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(campaign?.main_image || null)
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(campaign?.thumbnail_image || null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // ファイル入力のref
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const thumbnailImageInputRef = useRef<HTMLInputElement>(null)

  // 未保存の変更状態を親コンポーネントに通知
  useEffect(() => {
    onUnsavedChangesUpdate?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onUnsavedChangesUpdate])

  // キャンペーンデータが更新された時に画像URLを同期
  useEffect(() => {
    console.log("キャンペーンデータ同期:", {
      campaignMainImage: campaign?.main_image,
      campaignThumbnail: campaign?.thumbnail_image,
      currentMainImage: mainImageUrl,
      currentThumbnail: thumbnailImageUrl
    })
    setMainImageUrl(campaign?.main_image || null)
    setThumbnailImageUrl(campaign?.thumbnail_image || null)
  }, [campaign?.main_image, campaign?.thumbnail_image])

  // 保存済み状態にマークする関数
  const markAsSaved = () => {
    setHasUnsavedChanges(false)
  }

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // campaign オブジェクトの確認
      if (!campaign || !campaign.id) {
        toast.error("キャンペーン情報が取得できません")
        return
      }

      console.log("保存開始:", {
        campaignId: campaign.id,
        mainImageUrl,
        thumbnailImageUrl
      })
      
      const response = await fetch(`/api/crowdfunding/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          main_image: mainImageUrl || null,
          thumbnail_image: thumbnailImageUrl || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "不明なエラー" }))
        throw new Error(errorData.error || "更新に失敗しました")
      }

      // 保存成功時に未保存の変更状態をリセット
      markAsSaved()
      
      // 親コンポーネントのキャンペーンデータを更新
      if (onCampaignDataUpdate) {
        await onCampaignDataUpdate()
      }
      
      toast.success("プロジェクト画像を保存しました")
    } catch (error) {
      console.error("保存エラー:", error)
      toast.error("保存に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  // メイン画像選択ダイアログを開く
  const handleMainImageSelect = () => {
    mainImageInputRef.current?.click()
  }

  // サムネイル画像選択ダイアログを開く
  const handleThumbnailImageSelect = () => {
    thumbnailImageInputRef.current?.click()
  }

  // メイン画像ファイル選択時の処理
  const handleMainImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイル形式チェック
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("JPG、PNG、GIF、WebP形式の画像のみアップロード可能です")
      return
    }

    // ファイルサイズチェック (10MB以下)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ファイルサイズは10MB以下にしてください")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      
      const result = await uploadProjectMainImageAction(formData)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.url) {
        setMainImageUrl(result.url)
        setHasUnsavedChanges(true)
      }
      toast.success("メイン画像をアップロードしました")
    } catch (error) {
      console.error("メイン画像アップロードエラー:", error)
      toast.error("画像のアップロードに失敗しました")
    } finally {
      setIsLoading(false)
      // ファイル入力をリセット
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ""
      }
    }
  }

  // サムネイル画像ファイル選択時の処理
  const handleThumbnailImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイル形式チェック
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("JPG、PNG、GIF、WebP形式の画像のみアップロード可能です")
      return
    }

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      
      const result = await uploadProjectThumbnailImageAction(formData)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.url) {
        setThumbnailImageUrl(result.url)
        setHasUnsavedChanges(true)
      }
      toast.success("サムネイル画像をアップロードしました")
    } catch (error) {
      console.error("サムネイル画像アップロードエラー:", error)
      toast.error("画像のアップロードに失敗しました")
    } finally {
      setIsLoading(false)
      // ファイル入力をリセット
      if (thumbnailImageInputRef.current) {
        thumbnailImageInputRef.current.value = ""
      }
    }
  }

  // 画像削除処理
  const handleDeleteImage = async (imageUrl: string, imageType: 'main' | 'thumbnail') => {
    if (!imageUrl) return

    setIsLoading(true)
    try {
      const result = await deleteProjectImageAction(imageUrl)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (imageType === 'main') {
        setMainImageUrl(null)
      } else {
        setThumbnailImageUrl(null)
      }
      
      setHasUnsavedChanges(true)
      toast.success(`${imageType === 'main' ? 'メイン' : 'サムネイル'}画像を削除しました`)
    } catch (error) {
      console.error("画像削除エラー:", error)
      toast.error("画像の削除に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">メイン画像を設定する</h2>
        <p className="text-muted-foreground">
          プロジェクトのメイン画像を設定します。魅力的な画像がプロジェクトの印象を大きく左右します。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>メイン画像</CardTitle>
            <CardDescription>
              プロジェクトページのトップに表示される画像です
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mainImageUrl ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={mainImageUrl}
                    alt="メイン画像プレビュー"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteImage(mainImageUrl, 'main')}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMainImageSelect}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  画像を変更
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">画像をアップロード</h3>
                <p className="text-muted-foreground mb-4">
                  推奨サイズ: 1280×720px (16:9)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMainImageSelect}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? "アップロード中..." : "画像を選択"}
                </Button>
              </div>
            )}
            <input
              type="file"
              ref={mainImageInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleMainImageFileSelect}
              disabled={isLoading}
            />
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
            {thumbnailImageUrl ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={thumbnailImageUrl}
                    alt="サムネイル画像プレビュー"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteImage(thumbnailImageUrl, 'thumbnail')}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleThumbnailImageSelect}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  画像を変更
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">
                  推奨サイズ: 400×300px (4:3)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleThumbnailImageSelect}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? "アップロード中..." : "画像を選択"}
                </Button>
              </div>
            )}
            <input
              type="file"
              ref={thumbnailImageInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleThumbnailImageFileSelect}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </div>
  )
} 