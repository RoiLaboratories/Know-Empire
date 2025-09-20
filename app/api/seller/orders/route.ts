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

    // Verify seller exists
    const { data: seller, error: sellerError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();

    if (sellerError || !seller) {
      console.error('Error finding seller:', sellerError);
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    console.log('Fetching orders for seller FID:', fid);
    
    // First get the seller's products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('seller_id', seller.id);  // Use seller.id instead of fid

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
        is_paid,
        user:users!orders_buyer_id_fkey (
          id,
          farcaster_id,
          farcaster_username,
          display_name,
          avatar_url,
          buyer_shipping_address,
          buyer_phone
        ),
        product:products!orders_product_id_fkey (
          id,
          title,
          description,
          photos,
          price,
          seller_id
        )
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false });
    
    console.log('Orders query result:', { orders, error }); // For debugging

    if (error) {
      console.error('Error in orders query:', error);
      throw error;
    }

    // Transform orders to match our types
    const transformedOrders = !orders ? [] : orders.map((order: any) => ({
      id: order.id,
      status: (order.status || '').toUpperCase(),
      created_at: order.created_at,
      tracking_number: order.tracking_number,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      total_amount: order.total_amount,
      product: {
        id: order.product.id,
        title: order.product.title,
        description: order.product.description,
        photos: order.product.photos,
        price: order.product.price
      },
      buyer: {
        farcaster_username: order.user?.farcaster_username || '',
        shipping_address: order.user?.buyer_shipping_address || '',
        phone_number: order.user?.buyer_phone || ''
      },
      escrow_id: order.escrow_id
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
