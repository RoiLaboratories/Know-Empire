import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../utils/supabase';

// PATCH handler for updating products
export async function PATCH(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    console.log('Received update request:', { productId, updates });

    // Only allow specific fields to be updated
    const allowedUpdates = [
      'title',
      'description',
      'price',
      'category',
      'delivery',
      'status'
    ];

    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedUpdates.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('Filtered updates:', filteredUpdates);

    // First verify the product exists and belongs to this seller
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      console.error('Error fetching product:', fetchError);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Now perform the update
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(filteredUpdates)
      .eq('id', productId)
      .select();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update product' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error('No product found with ID:', productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error in product update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler for fetching products
export async function GET(request: Request) {
  const supabaseAdmin = createServiceClient();
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId parameter' }, { status: 400 });
  }

  try {
    // First get the user's UUID using their Farcaster ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', sellerId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Then get their products using the UUID
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
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
