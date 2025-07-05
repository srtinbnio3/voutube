'use client'

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AutocompleteOption {
  code: string
  name: string
  hiragana?: string
  katakana?: string
}

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (option: AutocompleteOption) => void
  options: AutocompleteOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  noOptionsMessage?: string
  id?: string
  required?: boolean
}

export function Autocomplete({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  className,
  disabled = false,
  loading = false,
  noOptionsMessage = "該当する項目がありません",
  id,
  required = false
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        setHighlightedIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 選択ハンドラー
  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.name)
    onSelect?.(option)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  // 入力値の変更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  // フォーカス処理
  const handleFocus = () => {
    if (options.length > 0) {
      setIsOpen(true)
    }
  }

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ハイライトされた項目をスクロール範囲内に保持
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [highlightedIndex])

  const showOptions = isOpen && (options.length > 0 || loading)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          "w-full",
          showOptions && "rounded-b-none border-b-0"
        )}
        autoComplete="off"
      />
      
      {showOptions && (
        <ul
          ref={listRef}
          className={cn(
            "absolute z-50 w-full bg-background border border-t-0 rounded-b-md shadow-lg max-h-60 overflow-auto",
            "border-input"
          )}
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              検索中...
            </li>
          )}
          
          {!loading && options.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {noOptionsMessage}
            </li>
          )}
          
          {!loading && options.map((option, index) => (
            <li
              key={`${option.code}-${index}`}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                index === highlightedIndex && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <span>{option.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {option.code}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 