import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../../utils/supabase'

export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    // Pagination: use ?limit=<n>&page=<n> (defaults: limit=24, page=1). Cap limit to 100 to avoid heavy queries
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const limit = Math.min(100, Number(limitParam) || 24);
    const page = Math.max(1, Number(pageParam) || 1);
    const start = (page - 1) * limit;
    const end = start + limit - 1;

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
      .order('created_at', { ascending: false })
      .range(start, end);

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
