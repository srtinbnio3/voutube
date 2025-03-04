"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

/**
 * テーマプロバイダーコンポーネント
 * 
 * next-themesを使用してダークモードなどのテーマ切り替え機能を提供します。
 * このコンポーネントはルートレイアウトに配置する必要があります。
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}