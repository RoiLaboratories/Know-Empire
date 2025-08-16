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
    } = await request.json()

    // Get the current user's ID from their session
    const { data: { session } } = await supabaseAdmin.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Insert the product into the database
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        seller_id: session.user.id,
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
