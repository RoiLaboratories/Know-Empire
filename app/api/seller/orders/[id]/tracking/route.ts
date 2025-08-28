import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../../utils/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tracking_number, fid } = await request.json();
    const supabaseAdmin = createServiceClient();

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Update tracking number
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ tracking_number })
      .eq('id', params.id)
      .eq('product.seller.fid', fid)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tracking number:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking number' },
      { status: 500 }
    );
  }
}
