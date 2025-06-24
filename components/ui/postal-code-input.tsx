'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Search, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface AddressData {
  zip_code: string
  prefecture: string
  city: string
  town: string
  formatted_address: string
  full_address: string
}

interface PostalCodeInputProps {
  postalCode: string
  address: string
  onPostalCodeChange: (value: string) => void
  onAddressChange: (value: string) => void
  className?: string
  disabled?: boolean
  required?: boolean
  postalCodeLabel?: string
  addressLabel?: string
  postalCodePlaceholder?: string
  addressPlaceholder?: string
  rows?: number
}

export function PostalCodeInput({
  postalCode,
  address,
  onPostalCodeChange,
  onAddressChange,
  className,
  disabled = false,
  required = false,
  postalCodeLabel = "郵便番号",
  addressLabel = "住所",
  postalCodePlaceholder = "例: 100-0001",
  addressPlaceholder = "例: 東京都千代田区千代田1-1",
  rows = 3
}: PostalCodeInputProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  // 郵便番号の正規化処理（ハイフンを自動挿入）
  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3)
    }
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7)
  }

  // 郵便番号入力ハンドラー
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value)
    onPostalCodeChange(formatted)
    
    // 入力時にステータスをリセット
    if (searchStatus !== 'idle') {
      setSearchStatus('idle')
      setErrorMessage("")
    }
  }

  // 住所検索関数
  const searchAddress = async () => {
    if (!postalCode.trim()) {
      setErrorMessage("郵便番号を入力してください")
      setSearchStatus('error')
      return
    }

    const cleanZip = postalCode.replace(/[^0-9]/g, '')
    if (cleanZip.length !== 7) {
      setErrorMessage("郵便番号は7桁で入力してください")
      setSearchStatus('error')
      return
    }

    setIsSearching(true)
    setSearchStatus('idle')
    setErrorMessage("")

    try {
      const response = await fetch(`/api/postal-code?zip=${encodeURIComponent(postalCode)}`)
      const data = await response.json()

      if (data.success && data.address) {
        // 住所を自動入力
        onAddressChange(data.address.formatted_address)
        setSearchStatus('success')
      } else {
        setErrorMessage(data.error || "住所が見つかりませんでした")
        setSearchStatus('error')
      }
    } catch (error) {
      console.error("住所検索エラー:", error)
      setErrorMessage("住所検索中にエラーが発生しました")
      setSearchStatus('error')
    } finally {
      setIsSearching(false)
    }
  }

  // Enterキー押下時の検索実行
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      e.preventDefault()
      searchAddress()
    }
  }

  // ステータスアイコンの表示
  const getStatusIcon = () => {
    if (isSearching) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    }
    if (searchStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (searchStatus === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 郵便番号入力欄 */}
      <div className="space-y-2">
        <Label htmlFor="postal_code">
          {postalCodeLabel} {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="postal_code"
              type="text"
              value={postalCode}
              onChange={handlePostalCodeChange}
              onKeyDown={handleKeyDown}
              placeholder={postalCodePlaceholder}
              disabled={disabled || isSearching}
              required={required}
              maxLength={8} // 123-4567形式なので8文字
              className={cn(
                "pr-10",
                searchStatus === 'success' && "border-green-500",
                searchStatus === 'error' && "border-red-500"
              )}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={searchAddress}
            disabled={disabled || isSearching || !postalCode.trim()}
            className="shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-1 hidden sm:inline">検索</span>
          </Button>
        </div>
        
        {/* エラーメッセージ */}
        {errorMessage && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorMessage}
          </p>
        )}
        
        {/* 成功メッセージ */}
        {searchStatus === 'success' && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            住所を自動入力しました
          </p>
        )}
      </div>

      {/* 住所入力欄 */}
      <div className="space-y-2">
        <Label htmlFor="address">
          {addressLabel} {required && <span className="text-destructive">*</span>}
        </Label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder={addressPlaceholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        <p className="text-xs text-muted-foreground">
          郵便番号検索で基本住所を入力後、建物名・部屋番号などを追記してください
        </p>
      </div>
    </div>
  )
} 