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
  name: string;
  status: "shipped" | "pending";
  img: StaticImageData | string;
  seller: string;
  price: string;
  id: string;
}

function Orders() {
  const { orders } = useOrders();
  const router = useRouter();
  const [isSellerAccount, setIsSellerAccount] = useState(false);
  const { context } = useMiniKit();

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!context?.user?.fid) return;
      try {
        const response = await fetch(`/api/seller/${context.user.fid}`);
        const data = await response.json();
        setIsSellerAccount(!!data);
      } catch (error) {
        console.error('Error checking seller status:', error);
        setIsSellerAccount(false);
      }
    };

    if (context?.user?.fid) {
      checkSellerStatus();
    }
  }, [context?.user?.fid]);

  return (
    <section className="flex flex-col items-center min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 bg-background py-3">
          <BackButton />
          <Tab
            name="My Orders"
            description="Track your purchases and leave reviews"
          />
          {/*search */}
          {orders.length !== 0 && <Search />}
        </div>

        {/*main content   orders.length !== 0*/}
        {false ? (
          <ul className="grid grid-cols-1 gap-5 mt-2.5">
            {orders.map((order, i) => (
              <OrdersCard
                key={i}
                status={order.status}
                name={order.name}
                img={order.img}
                seller={order.seller}
                price={order.price}
                id={order.id}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-10 items-center justify-between">
            <Image alt="empty orders" src={Empty} className="" />

            {/*sellers */}
            {isSellerAccount ? (
              <p className="text-xs font-medium text-center">
                You have no pending
                <span className="text-primary font-bold"> orders</span>, your
                orders will appear
                <span className="text-primary font-bold"> here </span>
                when customers make purchases
              </p>
            ) : (
              <p className="text-xs font-medium text-center">
                You have no
                <span className="text-primary font-bold"> orders </span>
                placed yet, place an order to see your order list
                <span className="text-primary font-bold"> here </span>
              </p>
            )}

            <Button
              className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn w-fit"
              onClick={() => router.push("/marketplace")}
            >
              Go to marketplace
              <Icon icon={ICON.ARROW_CIRCLE_RIGHT} className="" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
