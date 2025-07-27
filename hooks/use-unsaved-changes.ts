'use client'

import { useRef, useCallback, useEffect } from 'react'

/**
 * フォームの未保存の変更を追跡するカスタムhook
 * @param currentData 現在のフォームデータ
 * @param originalData 初期のフォームデータ
 * @returns hasUnsavedChanges: 未保存の変更があるかどうか, markAsSaved: 保存済みマークを付ける関数
 */
export function useUnsavedChanges<T extends Record<string, any>>(
  currentData: T,
  originalData: T
) {
  // 初期データを保存（最初の1回のみ設定）
  const initialDataRef = useRef<T | null>(null)
  
  // 初期データが設定されていない場合のみ設定
  if (initialDataRef.current === null) {
    initialDataRef.current = { ...originalData }
  }
  
  // 最後に保存されたデータを記録
  const lastSavedDataRef = useRef<T>({ ...originalData })

  /**
   * オブジェクトを深く比較する関数
   * ネストしたオブジェクトや配列も比較可能
   */
  const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true
    
    if (obj1 == null || obj2 == null) return obj1 === obj2
    
    if (typeof obj1 !== typeof obj2) return false
    
    if (typeof obj1 !== 'object') return obj1 === obj2
    
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    
    if (keys1.length !== keys2.length) return false
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false
      if (!deepEqual(obj1[key], obj2[key])) return false
    }
    
    return true
  }, [])

  /**
   * 未保存の変更があるかどうかをチェック
   * 最後に保存されたデータと現在のデータを比較
   */
  const hasUnsavedChanges = !deepEqual(currentData, lastSavedDataRef.current)

  /**
   * 現在のデータを保存済みとしてマークする関数
   * フォーム保存成功時に呼び出される
   */
  const markAsSaved = useCallback(() => {
    lastSavedDataRef.current = { ...currentData }
  }, [currentData])

  /**
   * 初期データにリセットする関数
   * キャンセル時などに使用
   */
  const resetToInitial = useCallback(() => {
    if (initialDataRef.current) {
      lastSavedDataRef.current = { ...initialDataRef.current }
    }
  }, [])

  return {
    hasUnsavedChanges,
    markAsSaved,
    resetToInitial
  }
} 