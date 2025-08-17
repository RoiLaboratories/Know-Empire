import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

// Create Supabase admin client directly in the API route
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

export async function POST(request: Request) {
  try {
    const frameData = await request.json();
    console.log('Received frame data:', frameData); // Debug log

    const { fid, username, displayName, pfp } = frameData.untrustedData;

    // Create or update user in Supabase using admin client
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        farcaster_id: fid.toString(),
        farcaster_username: username,
        display_name: displayName,
        avatar_url: pfp.url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating/updating user:', userError);
      return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error in Farcaster sign-in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
