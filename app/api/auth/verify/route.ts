import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { createAppClient, viemConnector } from '@farcaster/auth-client';

const client = createAppClient({
  ethereum: viemConnector(),
  relay: 'https://relay.farcaster.xyz',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, signature, fid } = body;

    if (!message || !signature || !fid) {
      return NextResponse.json(
        { error: 'Missing required fields: message, signature, or fid' },
        { status: 400 }
      );
    }
    
    // Verify the Farcaster signature
    const { success, error, data } = await client.verifySignInMessage({
      message,
      signature,
      domain: request.headers.get('host') || '',
      nonce: message.match(/nonce: ([a-zA-Z0-9]+)/)?.[1] || '',
    });

    if (!success || !data) {
      console.error('Verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Create or update user in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        farcaster_id: fid.toString(),
        // We'll get profile data from the client's watchStatus response
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

    // Create Supabase session
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${fid}@farcaster.xyz`,
      password: `fc_${fid}`,
    });

    if (signInError || !authData.session) {
      console.error('Error creating session:', signInError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Set session cookie
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
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
      session: authData.session,
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
