import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../utils/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('fid');

    if (!buyerId) {
      return NextResponse.json({ error: 'Buyer ID is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products (*),
        seller:profiles!seller_id (*),
        buyer:profiles!buyer_id (*)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
