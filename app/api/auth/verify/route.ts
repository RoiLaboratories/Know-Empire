import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const { signature, message, nonce } = await request.json();

    if (!signature || !message || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let messageData;
    try {
      messageData = JSON.parse(message);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const { 
      message: { fid } = { fid: null },
      data: { 
        username = '', 
        displayName = '', 
        pfpUrl = '' 
      } = {}
    } = messageData;

    if (!fid) {
      return NextResponse.json(
        { error: 'Invalid message format - missing fid' },
        { status: 400 }
      );
    }

    // Create or update user in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        farcaster_id: fid.toString(),
        farcaster_username: username,
        display_name: displayName,
        avatar_url: pfpUrl,
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

    // Create a session
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${fid}@farcaster.xyz`,
      password: `fc_${fid}`,
    });

    if (signInError || !data.session) {
      console.error('Error creating session:', signInError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Set session cookie
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (sessionError) {
      console.error('Error setting session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to set session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      session: data.session
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
