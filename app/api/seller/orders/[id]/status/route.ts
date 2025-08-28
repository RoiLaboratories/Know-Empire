import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../../utils/supabase';

export async function POST(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();
    const { status, tracking_number, fid } = await request.json();
    const supabaseAdmin = createServiceClient();

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Update order status
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status,
        tracking_number: tracking_number || null,
        shipped_at: status === 'shipped' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .eq('product.seller.fid', fid)
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
