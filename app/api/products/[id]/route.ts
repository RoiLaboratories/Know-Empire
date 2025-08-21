import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../utils/supabase';

export async function GET(request: Request) {
  const { pathname } = new URL(request.url);
  const id = pathname.split('/').pop();
  const supabaseAdmin = createServiceClient();
  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        seller:users!seller_id (
          farcaster_username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
