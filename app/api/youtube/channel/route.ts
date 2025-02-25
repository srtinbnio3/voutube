import { NextResponse } from 'next/server';
import { getChannelInfo } from '@/utils/youtube';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('id');
  
  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
  }
  
  try {
    const channelInfo = await getChannelInfo(channelId);
    
    if (!channelInfo) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    return NextResponse.json(channelInfo);
  } catch (error) {
    console.error('Error in YouTube API route:', error);
    return NextResponse.json({ error: 'Failed to fetch channel data' }, { status: 500 });
  }
} 