import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../utils/supabase";

interface Seller {
  farcaster_username: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  photos: string[];
  price: number;
  user: {
    farcaster_username: string;
  };
}

interface Order {
  id: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  tracking_number: string;  // Using order.id as tracking number
  shipped_at: string | null;
  delivered_at: string | null;
  total_amount: number;
  escrow_id: string;
  product: Product;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createServiceClient();

    // First get the buyer by farcaster_id
    const { data: buyer, error: buyerError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();

    if (buyerError || !buyer) {
      console.error('Error finding buyer:', buyerError);
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    console.log('Fetching orders for buyer with id:', buyer.id);

    // Then get their orders using the buyer's actual ID
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
        product:products (
          id,
          title,
          description,
          photos,
          price,
          user:users!products_seller_id_fkey (
            farcaster_username
          )
        )
      `)
      .eq('buyer_id', buyer.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in orders query:', error);
      throw error;
    }

    console.log('Orders found:', orders?.length || 0);

    // Transform orders to match our types
    const transformedOrders = !orders ? [] : orders.map((order: any): Order => ({
      id: order.id,
      status: (order.status || '').toUpperCase(),
      created_at: order.created_at,
      tracking_number: order.tracking_number,  // Use the actual tracking number from the database
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      total_amount: order.total_amount,
      escrow_id: order.escrow_id,
      product: {
        id: order.product.id,
        title: order.product.title,
        description: order.product.description,
        photos: order.product.photos,
        price: order.product.price,
        user: {
          farcaster_username: order.product.user.farcaster_username
        }
      }
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
