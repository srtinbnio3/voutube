import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ideatube.app'

  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/channels`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // チャンネルページの動的生成
  const { data: channels } = await fetch(`${baseUrl}/api/channels`).then(res => res.json())
  const channelPages = channels?.map((channel: any) => ({
    url: `${baseUrl}/channels/${channel.id}`,
    lastModified: new Date(channel.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) || []

  return [...staticPages, ...channelPages]
} 