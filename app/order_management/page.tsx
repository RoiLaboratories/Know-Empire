"use client";
import BackButton from "../../ui/BackButton";
import Search from "../../components/Search";
import OrdersCard from "../../components/cards/OrdersCard";
// Order management page only displays orders, no purchase functionality

import { useEffect, useState } from "react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  product: {
    title: string;
    photos: string[];
    seller: {
      farcaster_username: string;
    };
  };
}

function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { context } = useMiniKit();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!context?.user?.fid) {
          toast.error('Please connect with Farcaster first');
          return;
        }

        const response = await fetch(`/api/orders?fid=${context.user.fid}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [context?.user?.fid]);

  return (
    <section className="flex flex-col items-center min-h-screen pb-3 bg-white">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 py-3 bg-white">
          <BackButton />
          <div className="text-gray flex flex-col items-center">
            <p className="text-xl font-bold">Order Management</p>
          </div>
          <div className="mt-6">
            <Search placeholder="Search orders..." />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px]">
            <p>No orders found</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 mt-2.5">
            {orders.map((order) => (
              <OrdersCard
                key={order.id}
                status={order.status}
                name={order.product.title}
                img={order.product.photos[0]}
                seller={order.product.seller.farcaster_username}
                price={order.total_amount.toString()}
                id={order.id}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default OrderManagement;
