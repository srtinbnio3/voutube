import { NextResponse } from 'next/server';
import { searchChannels } from '@/utils/youtube';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }
  
  try {
    const channels = await searchChannels(query);
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error in YouTube search API route:', error);
    return NextResponse.json({ error: 'Failed to search channels' }, { status: 500 });
  }
} 