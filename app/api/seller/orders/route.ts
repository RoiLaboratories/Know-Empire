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

    console.log('Fetching orders for seller FID:', fid);
    
    // First get the seller's products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('seller_fid', fid);

    if (productsError) {
      console.error('Error fetching seller products:', productsError);
      throw productsError;
    }

    console.log('Seller products:', products);

    if (!products || products.length === 0) {
      return NextResponse.json([]);
    }

    const productIds = products.map(p => p.id);
    
    // Get seller's orders
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_amount,
        escrow_id,
        tracking_number,
        shipped_at,
        delivered_at,
        product:products!inner (
          id,
          title,
          photos,
          seller:users!inner (
            fid,
            farcaster_username,
            wallet_address
          )
        )
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false });
    
    console.log('Orders query result:', { orders, error }); // For debugging

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
