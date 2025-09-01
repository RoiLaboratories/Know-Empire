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

    // Check if user exists as a buyer in the users table
    const { data: buyer, error } = await supabaseAdmin
      .from('users')
      .select('id, buyer_email, buyer_phone, shipping_address, is_buyer')
      .eq('farcaster_id', fid)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error fetching buyer' }, { status: 500 });
    }

    // Only return buyer data if they are marked as a buyer
    return NextResponse.json(buyer?.is_buyer ? buyer : null);
  } catch (error) {
    console.error('Error in buyer check:', error);
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
      email,
      phone_number,
      shipping_address,
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
          buyer_email: email,
          buyer_phone: phone_number,
          shipping_address: shipping_address,
          is_buyer: true,
          display_name: displayName,
          avatar_url: pfpUrl,
          updated_at: new Date().toISOString()
        })
        .eq('farcaster_id', fid)

      if (updateError) {
        console.error('Error updating user as buyer:', updateError)
        return NextResponse.json(
          { error: 'Failed to update buyer account' },
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
          buyer_email: email,
          buyer_phone: phone_number,
          shipping_address: shipping_address,
          is_buyer: true
        })

      if (insertError) {
        console.error('Error creating buyer:', insertError)
        return NextResponse.json(
          { error: 'Failed to create buyer account' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ message: 'Successfully created/updated buyer account' })
  } catch (error) {
    console.error('Error in buyer creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
