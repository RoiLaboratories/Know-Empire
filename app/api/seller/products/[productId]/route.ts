import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../utils/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const supabaseAdmin = createServiceClient();
  try {
    const updates = await request.json();
    const { productId } = params;

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

    const { error } = await supabaseAdmin
      .from('products')
      .update(filteredUpdates)
      .eq('id', productId);

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in product update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
