import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../../utils/supabase';

export async function POST(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const orderId = pathname.match(/\/orders\/([^\/]+)\/tracking/)?.[1];
    
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const { tracking_number, fid } = await request.json();
    const supabaseAdmin = createServiceClient();

    console.log('[Tracking Update] Request:', { orderId, tracking_number, fid });

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // First, get the seller's ID from their FID
    const { data: seller } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();
    
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Update tracking number
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ tracking_number })
      .eq('id', orderId)
      .eq('products.seller_id', seller.id) // Note: products not product
      .select(`
        id,
        tracking_number,
        status,
        products (
          id,
          title,
          seller_id
        )
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Order not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tracking number:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking number' },
      { status: 500 }
    );
  }
}
