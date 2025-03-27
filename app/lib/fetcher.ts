export const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('データの取得に失敗しました')
  }
  return response.json()
} 