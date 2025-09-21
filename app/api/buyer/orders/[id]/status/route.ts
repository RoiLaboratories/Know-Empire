import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../../utils/supabase';

interface Order {
  id: string;
  status: string;
  tracking_number: string | null;
  escrow_id: string;
  delivered_at: string | null;
}

export async function POST(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const orderId = pathname.match(/\/orders\/([^\/]+)\/status/)?.[1];
    
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const { status, fid } = await request.json();
    const supabaseAdmin = createServiceClient();

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Validate status is one of the allowed values
    const allowedStatuses = ['pending', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // First, verify that the order exists and belongs to this buyer
    const { data: buyer } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Verify order exists and belongs to buyer
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        tracking_number,
        escrow_id,
        delivered_at
      `)
      .eq('id', orderId)
      .eq('buyer_id', buyer.id)
      .single<Order>();

    if (orderError || !order) {
      console.error('Error finding order:', orderError);
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Update order status - preserve the tracking number
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : order.delivered_at
      })
      .eq('id', orderId)
      .select()
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