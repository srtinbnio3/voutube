'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
      {/* 現在の表示件数 */}
      <div className="text-sm text-slate-600 dark:text-slate-300 order-2 sm:order-1">
        {totalItems > 0 ? (
          <>
            {startItem}〜{endItem}件目 / 全{totalItems}件
          </>
        ) : (
          '0件'
        )}
      </div>

      {/* ページネーションボタン */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* 前のページボタン */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => router.push(createPageURL(currentPage - 1))}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">前へ</span>
        </Button>

        {/* ページ番号 */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber
            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (currentPage <= 3) {
              pageNumber = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
            } else {
              pageNumber = currentPage - 2 + i
            }

            const isActive = pageNumber === currentPage

            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => router.push(createPageURL(pageNumber))}
                className={
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                }
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        {/* 次のページボタン */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => router.push(createPageURL(currentPage + 1))}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="hidden sm:inline mr-1">次へ</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 