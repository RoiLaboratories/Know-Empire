import { NextResponse } from 'next/server';
import { createClient, Errors } from '@farcaster/quick-auth';

const client = createClient();

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    const payload = await client.verifyJwt({
      token,
      domain: process.env.NEXT_PUBLIC_APP_URL || '',
    });

    // Get user info from Farcaster
    const res = await fetch(`https://api.farcaster.xyz/v2/user-by-fid?fid=${payload.sub}`);
    if (!res.ok) {
      throw new Error('Failed to fetch user data from Farcaster');
    }

    const { result: { user } } = await res.json();
    
    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfp: user.pfp.url
    });

  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.info('Invalid token:', e.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Auth error:', e);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
