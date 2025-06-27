'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Wand2 } from "lucide-react"

interface ProjectBasicFormProps {
  campaign: any
}

export function ProjectBasicForm({ campaign }: ProjectBasicFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [formData, setFormData] = useState({
    title: campaign.title || "",
    description: campaign.post?.description || campaign.description || "",
    story: campaign.story || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/crowdfunding/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      toast.success("プロジェクト情報を更新しました")
    } catch (error) {
      toast.error("更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  // AI ストーリー生成機能
  const handleGenerateStory = async () => {
    // プロジェクトタイトルと概要が入力されているかチェック
    if (!formData.title.trim()) {
      toast.error("プロジェクトタイトルを先に入力してください")
      return
    }
    if (!formData.description.trim()) {
      toast.error("プロジェクト概要を先に入力してください")
      return
    }

    // 既存のストーリーがある場合は確認
    if (formData.story.trim()) {
      const confirmed = window.confirm(
        "既存のストーリーが上書きされます。続行しますか？"
      )
      if (!confirmed) return
    }

    setIsGeneratingStory(true)

    try {
      const response = await fetch('/api/crowdfunding/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ストーリー生成に失敗しました')
      }

      // 生成されたストーリー（HTML形式）をフォームに設定
      console.log('生成された原文:', data.story)
      
      // コードブロックマーカーを除去（複数パターンに対応）
      let cleanStory = data.story
        .replace(/^```html\s*\n?/i, '')  // 開始の```html を除去
        .replace(/^```\s*\n?/i, '')      // 開始の```のみも除去
        .replace(/\n?\s*```\s*$/g, '')   // 終了の```を除去
        .replace(/```\s*$/g, '')         // 行末の```も除去
        .replace(/```/g, '')             // 残りの```も全て除去
        .trim()
      
      console.log('清書後:', cleanStory)
      setFormData({ ...formData, story: cleanStory })
      toast.success("ストーリーを生成しました！内容を確認して必要に応じて編集してください")

    } catch (error) {
      console.error('ストーリー生成エラー:', error)
      toast.error(error instanceof Error ? error.message : 'ストーリー生成に失敗しました')
    } finally {
      setIsGeneratingStory(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">ページ作成</h2>
        <p className="text-muted-foreground">
          プロジェクトの基本情報を設定します。タイトルや説明文を魅力的に作成しましょう。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            プロジェクトの基本的な情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                プロジェクトタイトル <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="魅力的なタイトルを入力してください"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                プロジェクト概要 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="プロジェクトの概要を簡潔に説明してください"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="story">ストーリー・詳細説明</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory || !formData.title.trim() || !formData.description.trim()}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  {isGeneratingStory ? "生成中..." : "AIで生成"}
                </Button>
              </div>
              <RichTextEditor
                content={formData.story}
                onChange={(content) => setFormData({ ...formData, story: content })}
                placeholder="プロジェクトの背景や詳細な説明を入力してください。上記の「AIで生成」ボタンでプロジェクト概要から自動生成することもできます。"
                className="min-h-[300px]"
              />
              <p className="text-sm text-muted-foreground">
                ヒント: プロジェクトタイトルと概要を入力後、「AIで生成」ボタンで詳細なストーリーを自動作成できます。リッチエディタでテキストの装飾や見出し、リストなどを追加できます。
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 