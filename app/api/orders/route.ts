import { NextResponse } from "next/server";
import { createServiceClient } from "../../../utils/supabase";

// Define types based on the actual database schema
type User = {
  id: string;
  farcaster_id: string;
  farcaster_username?: string;
  display_name?: string;
  avatar_url?: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  photos: string[];
  price: number;
  seller_id: string;
};

type DatabaseOrder = {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  product: Product;
  seller: User;
  buyer: User;
};

// The type returned by Supabase's joins
type SupabaseOrder = Omit<DatabaseOrder, 'product' | 'seller' | 'buyer'> & {
  products: Product[];
  seller: User[];
  buyer: User[];
};

// Convert Supabase's array fields to single objects
function normalizeOrder(order: SupabaseOrder): DatabaseOrder {
  return {
    ...order,
    product: order.products[0],
    seller: order.seller[0],
    buyer: order.buyer[0]
  };
}

export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_seller')
      .eq('farcaster_id', fid)
      .single();

    if (userError || !user) {
      console.error('User verification failed:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get orders where user is either buyer or seller
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
        status,
        total_amount,
        created_at,
        updated_at,
        products:products!orders_product_id_fkey (
          id,
          title,
          description,
          photos,
          price,
          seller_id,
          category,
          country,
          delivery
        ),
        seller:users!orders_seller_id_fkey (
          id,
          farcaster_id,
          farcaster_username,
          display_name,
          avatar_url,
          seller_handle,
          seller_rating
        ),
        buyer:users!orders_buyer_id_fkey (
          id,
          farcaster_id,
          farcaster_username,
          display_name,
          avatar_url
        )
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // If there are no orders, return an empty array with metadata
    if (!orders || orders.length === 0) {
      return NextResponse.json({
        orders: [],
        metadata: {
          isSeller: user.is_seller,
          isEmpty: true
        }
      });
    }

    // Transform the data to include a type field indicating if user is buyer or seller
    const transformedOrders = orders.map(order => ({
      ...normalizeOrder(order as unknown as SupabaseOrder),
      orderType: order.seller_id === user.id ? 'seller' : 'buyer'
    }));

    return NextResponse.json({
      orders: transformedOrders,
      metadata: {
        isSeller: user.is_seller,
        isEmpty: false
      }
    });
  } catch (error) {
    console.error('Error in orders endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const {
      fid,
      product_id,
      total_amount,
      escrow_id,
      status
    } = await request.json();

    if (!fid || !product_id || !total_amount || !escrow_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get product details to verify it exists and get seller info
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('seller_id, price')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      console.error('Product lookup error:', productError);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify or create the user account
    let buyer_id;
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            farcaster_id: fid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return NextResponse.json(
            { error: "Failed to create user account" },
            { status: 500 }
          );
        }
        buyer_id = newUser.id;
      } else {
        console.error('User verification failed:', userError);
        return NextResponse.json(
          { error: "Failed to verify user" },
          { status: 500 }
        );
      }
    } else {
      buyer_id = user.id;
    }

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        buyer_id,
        seller_id: product.seller_id,
        product_id,
        total_amount,
        escrow_id,
        status: status || "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
        status,
        total_amount,
        created_at,
        updated_at,
        products:products!orders_product_id_fkey (
          id,
          title,
          description,
          photos,
          price,
          seller_id
        ),
        seller:users!orders_seller_id_fkey (
          id,
          farcaster_id,
          farcaster_username,
          display_name,
          avatar_url
        ),
        buyer:users!orders_buyer_id_fkey (
          id,
          farcaster_id,
          farcaster_username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Transform the response to match our DatabaseOrder type
    const normalizedOrder = normalizeOrder(order as unknown as SupabaseOrder);
    return NextResponse.json(normalizedOrder);
  } catch (error) {
    console.error("Error in order creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
