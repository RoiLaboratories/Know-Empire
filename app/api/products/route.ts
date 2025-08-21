import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../utils/supabase'

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    const {
      title,
      description,
      price,
      country,
      delivery,
      category,
      photos,
      fid, // Farcaster user ID from client
    } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { error: 'Farcaster ID is required' },
        { status: 401 }
      )
    }

    // Get the user from the database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('farcaster_id', fid)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Insert the product into the database
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        seller_id: user.id,
        title: title,
        description: description,
        price: price,
        photos: photos,  // Array of image URLs
        country: country,
        delivery: delivery,
        category: category,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error in product creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
