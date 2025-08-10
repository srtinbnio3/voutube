import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ideatube.net'

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
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  // チャンネルページの動的生成
  let channelPages: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'daily';
    priority: number;
  }> = [];

  try {
    // 本番環境でのAPIエンドポイントを使用
    const response = await fetch(`${baseUrl}/api/channels`);
    
    if (response.ok) {
      const { data: channels } = await response.json();
      channelPages = channels?.map((channel: any) => ({
        url: `${baseUrl}/channels/${channel.id}`,
        lastModified: new Date(channel.updated_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })) || [];
    } else {
      console.error('Failed to fetch channels for sitemap:', response.status);
    }
  } catch (error) {
    // エラーをログに記録するが、処理は続行（静的ページのみのサイトマップを生成）
    console.error('Error generating dynamic sitemap entries:', error);
  }

  return [...staticPages, ...channelPages];
} 