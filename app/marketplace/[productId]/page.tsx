'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  seller: {
    username: string;
    farcaster_id: string;
  };
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { context } = useMiniKit();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.productId) {
      fetchProduct();
    }
  }, [params.productId]);

  const handleBuyClick = async () => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      // Check if the user is the seller
      if (product?.seller.farcaster_id === context.user.fid.toString()) {
        toast.error('You cannot buy your own product');
        return;
      }

      // Proceed with purchase flow
      router.push(`/cart?productId=${product?.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process purchase');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Your product display UI here */}
      <button 
        onClick={handleBuyClick}
        disabled={!context?.user?.fid}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Buy Now
      </button>
    </div>
  );
}
