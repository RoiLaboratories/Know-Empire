import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    try {
      // Parse and validate the message
      const parsedMessage = JSON.parse(message);
      const userInfo = parsedMessage.userInfo;

      // The presence of userInfo indicates a successful Farcaster verification
      const isValid = Boolean(userInfo?.fid);
      
      if (!isValid || !userInfo) {
        return NextResponse.json(
          { error: 'Invalid signature or message format' },
          { status: 401 }
        );
      }

      // Extract the user info
      const { fid, username, displayName, pfpUrl } = userInfo;

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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${fid}@farcaster.xyz`,
        password: `fc_${signature.slice(0, 32)}`, // Use signature prefix as password
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
