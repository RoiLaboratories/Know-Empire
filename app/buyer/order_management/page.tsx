"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../../../ui/BackButton";
import Search from "../../../components/Search";
import Tab from "../../../components/layout/Tab";
import OrdersCard from "../../../components/cards/OrdersCard";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    title: string;
    photos: string[];
    price: number;
    user: {
      farcaster_username: string;
    };
  };
  escrow_status?: string;
  transaction_hash?: string;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { context } = useMiniKit();
  const router = useRouter();

  useEffect(() => {
    const fetchBuyerOrders = async () => {
      try {
        if (!context?.user?.fid) {
          toast.error('Please connect with Farcaster first');
          return;
        }

        setLoading(true);
        console.log('Fetching orders for buyer FID:', context.user.fid);

        const response = await fetch(`/api/buyer/orders?fid=${context.user.fid}`);
        if (!response.ok) {
          console.error('Server responded with status:', response.status);
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const data = await response.json();
        console.log('Received orders:', data);

        // Sort orders by creation date, most recent first
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setOrders(sortedOrders || []);
      } catch (error) {
        console.error('Error fetching buyer orders:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerOrders();
  }, [context?.user?.fid]);

  // Redirect to empty orders page if no orders are found
  useEffect(() => {
    if (!loading && orders.length === 0) {
      router.push('/buyer/empty-order');
    }
  }, [loading, orders.length, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        <p>Loading orders...</p>
      </div>
    );
  }

  // If no orders, return null as we're redirecting
  if (orders.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center min-h-screen pb-3 bg-white">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 py-3 bg-white">
          <div className="px-4 mt-4">
            <BackButton onClick={() => router.back()} />
          </div>
          <Tab
            name="My Orders"
            description="Track your purchases and leave reviews"
          />
          <div className="mt-6">
            <Search placeholder="Search orders..." />
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-5 mt-2.5">
          {orders.map((order) => (
            <OrdersCard
              key={order.id}
              status={order.status}
              name={order.product.title}
              img={order.product.photos[0] || '/placeholder.png'}
              seller={order.product.user.farcaster_username}
              price={order.total_amount.toFixed(2)}
              id={order.id}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
