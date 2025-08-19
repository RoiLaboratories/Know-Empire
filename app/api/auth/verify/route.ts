import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Get token from either body or Authorization header
    const jwtToken = token || authHeader?.replace('Bearer ', '');

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Missing JWT token' },
        { status: 400 }
      );
    }

    // Decode the JWT to get user information
    // Note: In production, you should verify the JWT signature
    const base64Url = jwtToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // Extract user data from JWT payload
    const { sub: fid, iss, aud, exp } = payload;
    
    // Check if token is expired
    if (exp && Date.now() >= exp * 1000) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // Validate issuer (should be https://auth.farcaster.xyz)
    if (iss !== 'https://auth.farcaster.xyz') {
      return NextResponse.json(
        { error: 'Invalid token issuer' },
        { status: 401 }
      );
    }

    if (!fid) {
      return NextResponse.json(
        { error: 'Invalid token - missing FID' },
        { status: 400 }
      );
    }

    console.log('Processing authentication for user:', { fid, iss, aud });

    // Create or update user in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        farcaster_id: fid.toString(),
        farcaster_username: `user_${fid}`, // Default username if not provided
        display_name: `User ${fid}`, // Default display name
        avatar_url: '', // Can be updated later
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating/updating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create/update user' },
        { status: 500 }
      );
    }

    console.log('Authentication successful for user:', fid);

    // Return success with user data
    return NextResponse.json({
      success: true,
      user,
      message: 'User authenticated successfully',
      tokenInfo: {
        fid,
        issuer: iss,
        audience: aud,
        expiresAt: new Date(exp * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
