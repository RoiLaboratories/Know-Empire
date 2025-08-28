import { NextResponse } from "next/server";
import { createServiceClient } from "../../../utils/supabase";

// Define types based on the actual database schema
type User = {
  farcaster_username: string;
  display_name?: string;
  avatar_url?: string;
};

type Product = {
  title: string;
  description: string;
  photos: string[];
  price: number;
};

type DatabaseOrder = {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  escrow_id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  product: Product;
  seller: User;
  buyer: User;
};

// The type returned by Supabase's joins
type SupabaseOrder = Omit<DatabaseOrder, 'product' | 'seller' | 'buyer'> & {
  product: [Product];
  seller: [User];
  buyer: [User];
};

// Convert Supabase's array fields to single objects
function normalizeOrder(order: SupabaseOrder): DatabaseOrder {
  return {
    ...order,
    product: order.product[0],
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

    // Get orders where user is either buyer or seller
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        product:products (
          id,
          title,
          description,
          photos,
          price,
          seller_fid
        ),
        seller:users!seller_fid (
          fid,
          farcaster_username,
          display_name,
          avatar_url
        ),
        buyer:users!buyer_fid (
          fid,
          farcaster_username,
          display_name,
          avatar_url
        )
      `)
      .or(`buyer_fid.eq.${fid},seller_id.eq.${fid}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data to include a type field indicating if user is buyer or seller
    const transformedOrders = orders.map(order => ({
      ...normalizeOrder(order as any),
      orderType: order.seller_id === fid ? 'seller' : 'buyer'
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error in orders fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const body = await request.json();
    const { product_id, total_amount, escrow_id, status } = body;

    if (!product_id || !total_amount || !escrow_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the product to get the seller_id
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("seller_id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get the Farcaster ID from the request
    const { fid } = body;
    if (!fid) {
      return NextResponse.json(
        { error: "Farcaster ID is required" },
        { status: 401 }
      );
    }

    // Get the user from our database using Farcaster ID
    // First verify the farcaster_id from the request matches a valid user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, farcaster_id')
      .eq('farcaster_id', fid)
      .single();

    if (userError || !user) {
      console.error('User verification failed:', userError);
      return NextResponse.json(
        { error: "Unauthorized: Invalid user" },
        { status: 401 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id,
        total_amount,
        escrow_id,
        status: status || "pending"
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
        product:products (
          title,
          description,
          photos,
          price
        ),
        seller:users!seller_id (
          farcaster_username,
          display_name,
          avatar_url
        ),
        buyer:users!buyer_id (
          farcaster_username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Transform the response to match our DatabaseOrder type
    const normalizedOrder = normalizeOrder(order as SupabaseOrder);
    return NextResponse.json(normalizedOrder);
  } catch (error) {
    console.error("Error in order creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
