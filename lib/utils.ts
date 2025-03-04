import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * クラス名を結合するユーティリティ関数
 * 
 * clsxとtailwind-mergeを組み合わせて、クラス名を効率的に結合します。
 * これにより、条件付きクラスの適用やTailwindのクラスの衝突を解決できます。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * エラーメッセージをフォーマットするユーティリティ関数
 * 
 * エラーオブジェクトからエラーメッセージを抽出します。
 * エラーがない場合はデフォルトメッセージを返します。
 */
export function formatError(error: unknown, defaultMessage = "エラーが発生しました"): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === "string") {
    return error
  }
  
  return defaultMessage
}

/**
 * リダイレクトURLにステータスとメッセージを追加するユーティリティ関数
 * 
 * URLSearchParamsを使用して、リダイレクト先のURLにステータスとメッセージを追加します。
 */
export function encodedRedirect(
  redirectTo: string,
  type: "success" | "error",
  message: string
): string {
  const params = new URLSearchParams()
  params.set("status", type)
  params.set("message", message)
  
  // URLに既存のクエリパラメータがあるかチェック
  const hasQuery = redirectTo.includes("?")
  
  return `${redirectTo}${hasQuery ? "&" : "?"}${params.toString()}`
}

/**
 * 日付をフォーマットするユーティリティ関数
 * 
 * 日付を「YYYY年MM月DD日 HH:MM」形式でフォーマットします。
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

/**
 * 文字列を省略するユーティリティ関数
 * 
 * 文字列が指定された長さを超える場合、省略記号を追加します。
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength) + "..."
}
