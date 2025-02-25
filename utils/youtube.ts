/**
 * YouTube Data API v3を利用するためのユーティリティ関数
 */

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// チャンネル情報を取得する
export async function getChannelInfo(channelId: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      return {
        youtube_channel_id: channel.id,
        name: channel.snippet.title,
        description: channel.snippet.description,
        subscriber_count: parseInt(channel.statistics.subscriberCount),
        icon_url: channel.snippet.thumbnails.default.url,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching YouTube channel:', error);
    throw error;
  }
}

// チャンネルを検索する
export async function searchChannels(query: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('YouTube API search request failed');
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => ({
        youtube_channel_id: item.snippet.channelId,
        name: item.snippet.title,
        description: item.snippet.description,
        icon_url: item.snippet.thumbnails.default.url,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching YouTube channels:', error);
    throw error;
  }
} 