/**
 * 数値を人間が読みやすい形式（X形式）に変換する関数
 * @param num 変換する数値
 * @returns フォーマットされた文字列（例：1.5K、2.3万）
 */
export function formatNumber(num: number): string {
  const absNum = Math.abs(num)
  if (absNum >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  if (absNum >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
} 