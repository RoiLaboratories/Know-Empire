"use client";
import { useState, useEffect } from "react";
import Tab from "../../components/layout/Tab";
import Search from "../../components/Search";
import OrdersCard from "../../components/cards/OrdersCard";
import BackButton from "../../ui/BackButton";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import Empty from "../../assets/images/empty.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOrders } from "../../providers/orders";
import type { StaticImageData } from "next/image";

interface Order {
  id: string;
  status: "shipped" | "pending" | "delivered";
  tracking_number: string | null;
  total_amount: number;
  product: {
    id: string;
    title: string;
    photos: string[];
    seller: {
      username: string;
      wallet_address: string;
    };
  };
}

function Orders() {
  const { orders } = useOrders();
  const router = useRouter();
  const { context } = useMiniKit();

  // Check if the user is connected with Farcaster
  const [loading, setLoading] = useState(true);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchBuyerOrders() {
      if (!context?.user?.fid) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders?fid=${context.user.fid}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setBuyerOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBuyerOrders();
  }, [context?.user?.fid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Icon icon={ICON.SPINNER} className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 bg-background py-3">
          <BackButton onClick={() => router.push("/marketplace")} />
          <Tab
            name="My Orders"
            description="Track your purchases and leave reviews"
          />
          {buyerOrders.length > 0 && <Search />}
        </div>

        {buyerOrders.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 mt-2.5">
            {buyerOrders.map((order) => (
              <OrdersCard
                key={order.id}
                status={order.status}
                name={order.product.title}
                img={order.product.photos[0]}
                seller={order.product.seller.username}
                price={order.total_amount.toString()}
                id={order.id}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-10 items-center justify-between">
            <Image alt="empty orders" src={Empty} />

            <p className="text-xs font-medium text-center">
              You have no
              <span className="text-primary font-bold"> orders </span>
              placed yet, place an order to see your order list
              <span className="text-primary font-bold"> here </span>
            </p>

            <Button
              className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn w-fit"
              onClick={() => router.push("/marketplace")}
            >
              Go to marketplace
              <Icon icon={ICON.ARROW_CIRCLE_RIGHT} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
