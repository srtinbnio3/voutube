/**
 * 数値を人間が読みやすい形式（X形式）に変換する関数
 * @param num 変換する数値
 * @returns フォーマットされた文字列（例：1.5K、2.3万）
 */
export function formatNumber(num: number): string {
  const isNegative = num < 0
  const absNum = Math.abs(num)
  let formattedNum: string

  if (absNum >= 10000) {
    const value = absNum / 10000
    // 小数点以下が0の場合は整数のみ表示
    formattedNum = Number.isInteger(value) ? `${Math.floor(value)}万` : `${value.toFixed(1)}万`
  } else if (absNum >= 1000) {
    const value = absNum / 1000
    // 小数点以下が0の場合は整数のみ表示
    formattedNum = Number.isInteger(value) ? `${Math.floor(value)}K` : `${value.toFixed(1)}K`
  } else {
    formattedNum = absNum.toString()
  }

  return isNegative ? `-${formattedNum}` : formattedNum
} 