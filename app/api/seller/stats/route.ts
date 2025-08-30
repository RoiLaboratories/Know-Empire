import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../utils/supabase';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createServiceClient();
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Get seller's orders stats
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        status,
        total_amount,
        product:products(
          seller:users(fid)
        )
      `)
      .eq('product.seller.fid', fid);

    if (ordersError) throw ordersError;

    // Calculate stats
    const stats = {
      total_orders: orders.length,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      shipped_orders: orders.filter(o => o.status === 'shipped').length,
      completed_orders: orders.filter(o => o.status === 'completed').length,
      total_revenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
