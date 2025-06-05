'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface ProjectRewardsFormProps {
  campaign: any
}

export function ProjectRewardsForm({ campaign }: ProjectRewardsFormProps) {
  const [rewards, setRewards] = useState([])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">支援のお返し（リターン）</h2>
        <p className="text-muted-foreground">
          支援者への感謝の気持ちとして、リターンを設定しましょう。魅力的なリターンがプロジェクトの成功につながります。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>リターン設定</CardTitle>
          <CardDescription>
            支援金額に応じたお返しを設定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              まだリターンが設定されていません
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              リターンを追加
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 