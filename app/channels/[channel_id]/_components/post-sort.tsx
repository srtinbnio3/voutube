"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { TrendingUp, Clock } from 'lucide-react'

interface PostSortProps {
  currentSort: 'popular' | 'recent'
}

export function PostSort({ currentSort }: PostSortProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createSortUrl = (sort: 'popular' | 'recent') => {
    const params = new URLSearchParams(searchParams)
    if (sort === 'popular') {
      params.delete('sort') // デフォルトは popular なので削除
    } else {
      params.set('sort', sort)
    }
    const query = params.toString()
    return `${pathname}${query ? `?${query}` : ''}`
  }

  return (
    <div className="flex bg-slate-100/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 border border-slate-200/50 dark:border-slate-600/50">
      {/* 人気順タブ - モバイル最適化 */}
      <Link
        href={createSortUrl('popular')}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none ${
          currentSort === 'popular'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border-b-2 border-blue-500'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="whitespace-nowrap">人気順</span>
      </Link>

      {/* 新着順タブ - モバイル最適化 */}
      <Link
        href={createSortUrl('recent')}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none ${
          currentSort === 'recent'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border-b-2 border-purple-500'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="whitespace-nowrap">新着順</span>
      </Link>
    </div>
  )
} 