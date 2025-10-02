import ProductDetailsContent from '../../../../components/product/ProductDetailsContent';
import { createServiceClient } from '../../../../utils/supabase';

async function getProduct(productId: string) {
  const supabaseAdmin = createServiceClient();

  // First get the product with seller info
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      seller:users!seller_id (
        username:farcaster_username,
        display_name,
        avatar_url,
        rating,
        review_count,
        wallet_address,
        farcaster_id
      )
    `)
    .eq('id', productId)
    .single();
    
  if (product) {
    // Get seller's trade count (both as seller and buyer)
    const [sellerOrdersResponse, buyerOrdersResponse] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('seller_id', product.seller.farcaster_id)
        .eq('status', 'completed'),
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('buyer_id', product.seller.farcaster_id)
        .eq('status', 'completed')
    ]);
    
    const totalTrades = (sellerOrdersResponse.count || 0) + (buyerOrdersResponse.count || 0);
    product.seller.is_verified = totalTrades >= 6;
  }

  if (error) {
    throw error;
  }

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

export default async function Page({ params }: any) {
  const product = await getProduct(params.productId);
  
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Product not found</p>
      </div>
    );
  }

  return <ProductDetailsContent initialProduct={product} />;
}