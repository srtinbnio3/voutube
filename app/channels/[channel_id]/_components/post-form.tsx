"use client"  // クライアントサイドでの実行を指定

import { useState } from "react"  // Reactの状態管理フック
import { useRouter } from "next/navigation"  // ページ遷移用フック
import { createBrowserClient } from '@supabase/ssr'  // Supabaseクライアント作成
import { Button } from "@/components/ui/button"  // ボタンコンポーネント
import {
  Dialog,  // モーダルウィンドウコンポーネント
  DialogContent,  // モーダルの内容
  DialogHeader,  // モーダルのヘッダー
  DialogTitle,  // モーダルのタイトル
  DialogTrigger,  // モーダルを開くトリガー
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"  // 入力フィールド
import { Textarea } from "@/components/ui/textarea"  // テキストエリア
import { useToast } from "@/hooks/use-toast"  // 通知表示用フック
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthDialog } from "@/hooks/use-auth-dialog"  // 認証ダイアログフック
import { AuthDialog } from "@/components/ui/auth-dialog"  // 認証ダイアログコンポーネント
import { PlusCircle, Lightbulb, Send, Sparkles } from "lucide-react"

// コンポーネントのプロパティの型定義
interface PostFormProps {
  channelId: string  // 投稿先チャンネルのID
}

export function PostForm({ channelId }: PostFormProps) {
  // 状態管理
  const [isOpen, setIsOpen] = useState(false)  // モーダルの開閉状態
  const [isLoading, setIsLoading] = useState(false)  // 投稿処理中の状態
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [titleError, setTitleError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")
  const router = useRouter()  // ページ遷移用
  const { toast } = useToast()  // 通知表示用
  const { open, setOpen, checkAuthAndShowDialog } = useAuthDialog()  // 認証ダイアログフック
  
  // Supabaseクライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,        // データベースのURL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!    // 公開用キー
  )

  // 新規投稿ボタンクリック時の処理
  const handleClick = async () => {
    // ログイン状態の確認と未ログイン時のダイアログ表示
    const isAuthenticated = await checkAuthAndShowDialog()
    if (!isAuthenticated) return
    
    // ログイン済みの場合、投稿モーダルを開く
    setIsOpen(true)
  }

  // 投稿を作成する関数
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTitleError("")
    setDescriptionError("")

    // バリデーション
    if (title.length < 3) {
      setTitleError("タイトルは3文字以上で入力してください")
      return
    }
    if (title.length > 100) {
      setTitleError("タイトルは100文字以内で入力してください")
      return
    }
    if (description.length < 10) {
      setDescriptionError("説明は10文字以上で入力してください")
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // 未ログインの場合、現在のURLを保持してログインページへリダイレクト
        const currentPath = window.location.pathname
        setIsOpen(false)
        router.push(`/sign-in?redirect_to=${encodeURIComponent(currentPath)}`)
        return
      }

      console.log('投稿データ:', {
        channel_id: channelId,
        title,
        description,
        user_id: user.id
      })

      const { data, error } = await supabase
        .from("posts")
        .insert({
          channel_id: channelId,
          user_id: user.id,
          title,
          description,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabaseエラー:', error)
        throw error
      }

      console.log('投稿成功:', data)
      toast({
        title: "投稿を作成しました",
        description: "投稿が正常に作成されました",
      })
      setIsOpen(false)
      setTitle("")
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error('投稿エラー:', error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "投稿の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // UIの描画
  return (
    <>
      {/* 新規投稿ボタン - モダンなデザイン */}
      <Button 
        onClick={handleClick}
        className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-105 rounded-2xl px-6 py-3 font-semibold"
      >
        {/* 背景のアニメーション効果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* ボタンの内容 */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="relative">
            <PlusCircle className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          </div>
          <span className="text-sm font-medium">新規投稿</span>
        </div>
        
        {/* ホバー時のグラデーションボーダー */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Button>
      
      {/* 投稿作成モーダル */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          {/* モーダルの背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/30 rounded-3xl" />
          
          <div className="relative z-10">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                新しいアイデアを投稿
              </DialogTitle>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                あなたの企画アイデアを共有して、クリエイターに提案しましょう
              </p>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6" role="form">
              {/* タイトル入力 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  タイトル
                </label>
                <Input
                  placeholder="魅力的なタイトルを入力してください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300"
                />
                {titleError && (
                  <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {titleError}
                  </p>
                )}
              </div>
              
              {/* 説明入力 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  企画の詳細
                </label>
                <Textarea
                  placeholder="企画の内容を詳しく説明してください&#10;・どんな動画にしたいか&#10;・面白いポイント&#10;・必要な準備など"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  className="min-h-[160px] bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-300 resize-none"
                />
                {descriptionError && (
                  <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {descriptionError}
                  </p>
                )}
              </div>
              
              {/* 投稿ボタン */}
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 rounded-2xl px-8 py-3 font-semibold min-w-[120px]"
                >
                  {/* 背景のアニメーション効果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* ボタンの内容 */}
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>投稿中...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        <span>投稿する</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 