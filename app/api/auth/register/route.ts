import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../utils/supabase';

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const { fid, username, displayName, pfpUrl } = await request.json();

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();

    if (existingUser) {
      // User exists, update their info
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          farcaster_username: username,
          display_name: displayName,
          avatar_url: pfpUrl,
          updated_at: new Date().toISOString()
        })
        .eq('farcaster_id', fid)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json(updatedUser);
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        farcaster_id: fid,
        farcaster_username: username,
        display_name: displayName,
        avatar_url: pfpUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(newUser);

  } catch (error) {
    console.error('Error in user registration:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
