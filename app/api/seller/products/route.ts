import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../utils/supabase';

export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId parameter' }, { status: 400 });
  }

  try {
    // First get the seller's UUID using their FID
    const { data: seller, error: sellerError } = await supabaseAdmin
      .from('sellers')
      .select('id')
      .eq('fid', sellerId)
      .single();

    if (sellerError) {
      console.error('Error fetching seller:', sellerError);
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Then get their products using the UUID
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in seller products fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
