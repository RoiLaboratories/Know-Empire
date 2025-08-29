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
      .select('id, email, phone_number, shipping_address, is_buyer')
      .eq('farcaster_id', fid)
      .single();

    if (error) {
      console.error('Error fetching buyer:', error);
      return NextResponse.json({ error: 'Error fetching buyer data' }, { status: 500 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error in buyer GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, is_buyer')
      .eq('farcaster_id', fid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError);
      return NextResponse.json({ error: 'Error checking existing user' }, { status: 500 });
    }

    if (existingUser?.is_buyer) {
      return NextResponse.json({ error: 'Buyer already exists' }, { status: 400 });
    }

    let userId = existingUser?.id;

    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          farcaster_id: fid,
          farcaster_username: body.farcaster_username,
          display_name: body.display_name,
          avatar_url: body.avatar_url,
          is_buyer: true,
          email: body.email,
          phone_number: body.phone_number,
          shipping_address: body.shipping_address
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
      }

      userId = newUser.id;
    } else {
      // Update existing user to be a buyer
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          is_buyer: true,
          email: body.email,
          phone_number: body.phone_number,
          shipping_address: body.shipping_address
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Error in buyer POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
