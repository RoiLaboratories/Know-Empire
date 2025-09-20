import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../../utils/supabase'

export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    let query = supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        photos,
        country,
        delivery,
        category,
        status,
        seller:users (
          farcaster_username,
          display_name,
          avatar_url,
          rating,
          review_count,
          wallet_address,
          farcaster_id
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error in products fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
