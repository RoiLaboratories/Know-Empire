import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../utils/supabase';

interface RouteContext {
  params: { id: string }
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = params;
  const supabaseAdmin = createServiceClient();
  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        seller: seller_id (
          id,
          username,
          farcaster_id,
          rating,
          review_count
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
