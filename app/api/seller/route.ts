import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../utils/supabase'

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  try {
    // Get the current user's session
    const { data: { session } } = await supabaseAdmin.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      handle,
      category,
      email,
      location,
      description,
    } = await request.json()

    // First, update the user's profile in the users table
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        seller_handle: handle,
        seller_category: category,
        seller_email: email,
        seller_location: location,
        seller_description: description,
        is_seller: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (userUpdateError) {
      console.error('Error updating user as seller:', userUpdateError)
      return NextResponse.json(
        { error: 'Failed to create seller account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Seller account created successfully',
      sellerId: session.user.id
    })
  } catch (error) {
    console.error('Error in seller creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
