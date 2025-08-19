import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const fid = request.headers.get('fid');
    
    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    // Get user data from Farcaster
    const response = await fetch(`https://api.warpcast.com/v2/user-by-fid?fid=${fid}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data from Farcaster');
    }

    const data = await response.json();
    
    return NextResponse.json({
      username: data.result.user.username,
      displayName: data.result.user.displayName,
      pfp: data.result.user.pfp.url
    });
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
