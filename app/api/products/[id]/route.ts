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
          avatar_url,
          rating,
          review_count,
          wallet_address
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

    // Check if seller has a wallet address
    if (!product.seller.wallet_address) {
      return NextResponse.json(
        { error: 'Seller wallet address not found. The seller may need to update their profile.' },
        { status: 400 }
      );
    }

    // Transform the data to match the frontend's expected format
    const transformedProduct = {
      ...product,
      seller: {
        username: product.seller.farcaster_username,
        rating: product.seller.rating,
        review_count: product.seller.review_count,
        wallet_address: product.seller.wallet_address
      }
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
