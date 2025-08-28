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

    // Get seller's orders
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        product:products(
          *,
          seller:users(*)
        )
      `)
      .eq('product.seller.fid', fid)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
