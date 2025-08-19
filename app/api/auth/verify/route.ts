import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const { fid, username, displayName, pfpUrl } = await request.json();

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing Farcaster ID' },
        { status: 400 }
      );
    }

    try {

      // Create or update user in Supabase using our existing schema
      const { data: user, error: userError } = await supabase
        .from('users')
        .upsert({
          farcaster_id: fid?.toString() || '',
          farcaster_username: username || '',
          display_name: displayName || '',
          avatar_url: pfpUrl || '',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating/updating user:', userError);
        throw new Error('Failed to create/update user');
      }

      // Create a session using Supabase custom token
      // Create a session using Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${fid}@farcaster.xyz`,
        password: `fc_${fid}`, // Use fid as password since we've already verified the user
      });

      if (signInError || !data.session) {
        console.error('Error creating session:', signInError);
        throw new Error('Failed to create session');
      }

      // Set session cookie
      const { data: session, error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        throw new Error('Failed to set session');
      }

      return NextResponse.json({
        success: true,
        user,
        session
      });

    } catch (error) {
      console.error('Verification or database error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Authentication failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
