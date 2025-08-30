import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../../utils/supabase'

export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // Check if user exists as a seller in the users table
    const { data: seller, error } = await supabaseAdmin
      .from('users')
      .select('id, seller_category, seller_email, seller_location, seller_description, is_seller')
      .eq('farcaster_id', id)
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
