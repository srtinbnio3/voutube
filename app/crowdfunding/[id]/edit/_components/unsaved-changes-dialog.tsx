'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface UnsavedChangesDialogProps {
  /**
   * ダイアログの表示状態
   */
  open: boolean
  /**
   * ダイアログを閉じる時のコールバック関数
   */
  onClose: () => void
  /**
   * 「続行」ボタンを押した時のコールバック関数
   * 未保存の変更を破棄してセクション切り替えを実行
   */
  onConfirm: () => void
  /**
   * 切り替え先のセクション名（任意）
   * 表示メッセージをより具体的にするために使用
   */
  targetSectionName?: string
}

/**
 * 未保存の変更がある状態でセクション切り替えを行う際の確認ダイアログ
 * ユーザーに変更の破棄について確認を求める
 */
export function UnsavedChangesDialog({ 
  open, 
  onClose, 
  onConfirm, 
  targetSectionName 
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                未保存の変更があります
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left mt-4">
            現在のセクションで編集した内容が保存されていません。
            {targetSectionName && (
              <>
                <br />
                「{targetSectionName}」に移動すると、編集内容は失われます。
              </>
            )}
            <br />
            <br />
            続行しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            className="sm:mr-auto"
          >
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            続行（変更を破棄）
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 