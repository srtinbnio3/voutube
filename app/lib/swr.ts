import { SWRConfiguration } from 'swr'

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // フォーカス時の再検証を無効化
  revalidateOnReconnect: false, // 再接続時の再検証を無効化
  dedupingInterval: 5000, // 5秒間の重複リクエストを防止
  errorRetryCount: 3, // エラー時のリトライ回数
} 