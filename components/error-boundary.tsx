'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertOctagon } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * カスタムエラーバウンダリコンポーネント
 * 
 * 特定のコンポーネントツリー内でエラーをキャッチし、
 * フォールバックUIを表示するためのコンポーネントです。
 * 
 * 使用例:
 * ```tsx
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // エラー発生時の状態を更新
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーをログに記録
    console.error('エラーバウンダリがエラーをキャッチしました:', error, errorInfo)
    
    // カスタムエラーハンドラがあれば呼び出す
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIが提供されていればそれを使用
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのフォールバックUI
      return (
        <Card className="max-w-md w-full mx-auto my-4">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-amber-500" />
              <CardTitle>コンポーネントエラー</CardTitle>
            </div>
            <CardDescription>
              このコンポーネントの表示中にエラーが発生しました。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || 'コンポーネントの読み込み中に問題が発生しました。'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={this.resetError}>
              再試行
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
} 