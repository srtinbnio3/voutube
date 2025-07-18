import { stat } from 'fs/promises'
import { join } from 'path'

/**
 * ファイルの最終更新日時を取得する関数
 * @param filePath ファイルパス（app/ディレクトリからの相対パス）
 * @returns フォーマットされた日付文字列
 */
export async function getFileLastModified(filePath: string): Promise<string> {
  try {
    // プロジェクトルートからのパスを構築
    const fullPath = join(process.cwd(), 'app', filePath)
    const stats = await stat(fullPath)
    
    // 日本時間でフォーマット
    const date = new Date(stats.mtime)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo'
    })
  } catch (error) {
    console.error(`Failed to get file stats for ${filePath}:`, error)
    // フォールバック：現在の日付を返す
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo'
    })
  }
}

/**
 * 複数のファイルから最新の更新日時を取得する関数
 * @param filePaths ファイルパスの配列
 * @returns 最新の更新日時
 */
export async function getLatestModified(filePaths: string[]): Promise<string> {
  try {
    const dates = await Promise.all(
      filePaths.map(async (filePath) => {
        const fullPath = join(process.cwd(), 'app', filePath)
        const stats = await stat(fullPath)
        return stats.mtime
      })
    )
    
    // 最新の日付を取得
    const latestDate = new Date(Math.max(...dates.map(date => date.getTime())))
    
    return latestDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo'
    })
  } catch (error) {
    console.error('Failed to get latest modified date:', error)
    // フォールバック：現在の日付を返す
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo'
    })
  }
} 