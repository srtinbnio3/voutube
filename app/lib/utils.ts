import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * スタイルクラスを結合するユーティリティ関数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 