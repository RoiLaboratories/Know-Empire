import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../../utils/supabase';

export async function POST(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const orderId = pathname.match(/\/orders\/([^\/]+)\/status/)?.[1];
    
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const { status, tracking_number, fid } = await request.json();
    const supabaseAdmin = createServiceClient();

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Validate status is one of the allowed values
    const allowedStatuses = ['pending', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // First, verify that the order exists and belongs to this seller
    const { data: seller } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();
    
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Verify order exists and belongs to seller's products
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        product:products!inner (
          id,
          seller_id
        )
      `)
      .eq('id', orderId)
      .eq('product.seller_id', seller.id)
      .single();

    if (orderError || !order) {
      console.error('Error finding order:', orderError);
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Update order status with tracking number only if provided
    const updateData: any = {
      status,
      shipped_at: status === 'shipped' ? new Date().toISOString() : null,
      delivered_at: status === 'delivered' ? new Date().toISOString() : null
    };
    
    // Only update tracking_number if it's provided in the request
    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        id,
        status,
        tracking_number,
        total_amount,
        escrow_id,
        is_paid,
        product:products!inner (
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
