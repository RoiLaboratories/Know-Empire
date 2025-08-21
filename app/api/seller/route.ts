import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../utils/supabase'

export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Check if user exists as a seller in the users table
    const { data: seller, error } = await supabaseAdmin
      .from('users')
      .select('id, seller_category, seller_email, seller_location, seller_description, is_seller')
      .eq('farcaster_id', fid)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error fetching seller' }, { status: 500 });
    }

    // Only return seller data if they are marked as a seller
    return NextResponse.json(seller?.is_seller ? seller : null);
  } catch (error) {
    console.error('Error in seller check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const {
      fid,
      username,
      displayName,
      pfpUrl,
      category,
      email,
      location,
      description,
    } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { error: 'Farcaster ID is required' },
        { status: 401 }
      )
    }

    // First check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select()
      .eq('farcaster_id', fid)
      .single()

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          seller_category: category,
          seller_email: email,
          seller_location: location,
          seller_description: description,
          is_seller: true,
          display_name: displayName,
          avatar_url: pfpUrl,
          updated_at: new Date().toISOString()
        })
        .eq('farcaster_id', fid)

      if (updateError) {
        console.error('Error updating user as seller:', updateError)
        return NextResponse.json(
          { error: 'Failed to update seller account' },
          { status: 500 }
        )
      }
    } else {
      // Create new user
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          farcaster_id: fid,
          farcaster_username: username,
          display_name: displayName,
          avatar_url: pfpUrl,
          seller_category: category,
          seller_email: email,
          seller_location: location,
          seller_description: description,
          is_seller: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating seller account:', insertError)
        return NextResponse.json(
          { error: 'Failed to create seller account' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: 'Seller account created/updated successfully',
      fid: fid
    })
  } catch (error) {
    console.error('Error in seller creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
