import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../../utils/supabase';

export async function POST(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const orderId = pathname.split('/').slice(-2)[0]; // Get the ID part from /orders/{id}/status
    const { status, tracking_number, fid } = await request.json();
    const supabaseAdmin = createServiceClient();

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // First, verify that the order exists and belongs to this seller
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('seller_id', fid)
      .single();

    if (orderError || !order) {
      console.error('Error finding order:', orderError);
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Update order status
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status,
        tracking_number: tracking_number || null,
        shipped_at: status === 'shipped' ? new Date().toISOString() : null
      })
      .eq('id', orderId)
      .eq('seller_id', fid)
      .select(`
        id,
        status,
        tracking_number,
        total_amount,
        escrow_id,
        is_paid,
        product:products (
          id,
          title,
          photos
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
