"use client";

import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrders } from "../../providers/orders";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useState, useEffect } from 'react';

interface ITab {
  name: string;
  description: string;
  showRoutes?: boolean;
}

interface TabItem {
  title: string;
  icon: string;
  link: string;
}

const defaultTabs = [
  { title: "Discover", icon: ICON.SEARCH, link: "/marketplace" },
  { title: "Orders", icon: ICON.GIFT_CARD, link: "/buyer/empty-order" },
  { title: "Top", icon: ICON.ORGANISATION, link: "/leaderboard" },
];

const buyerTabs = [
  { title: "Discover", icon: ICON.SEARCH, link: "/marketplace" },
  { title: "Orders", icon: ICON.GIFT_CARD, link: "/buyer/order_management" },
  { title: "Top", icon: ICON.ORGANISATION, link: "/leaderboard" },
];

const sellerTabs = [
  { title: "Discover", icon: ICON.SEARCH, link: "/marketplace" },
  { title: "Orders", icon: ICON.GIFT_CARD, link: "/seller/orders" },
  { title: "Top", icon: ICON.ORGANISATION, link: "/leaderboard" },
];

function Tab({ name, description, showRoutes = true }: ITab) {
  const pathname = usePathname();
  const router = useRouter();
  const { context } = useMiniKit();
  const { hasOrders } = useOrders();
  const [isSellerAccount, setIsSellerAccount] = useState(false);
  const [isBuyerAccount, setIsBuyerAccount] = useState(false);
  const [tabs, setTabs] = useState<TabItem[]>(defaultTabs);

  const excludeRoutes = ["/marketplace/sell"];

  useEffect(() => {
    const checkAccountStatus = async (fid: number) => {
      try {
        // Check seller status and orders
        const sellerResponse = await fetch(`/api/seller/${fid}`);
        const sellerData = await sellerResponse.json();
        const isSeller = !!sellerData;
        setIsSellerAccount(isSeller);

        if (isSeller) {
          // Check seller orders
          const sellerOrdersResponse = await fetch(`/api/seller/orders?fid=${fid}`);
          const sellerOrdersData = await sellerOrdersResponse.json();
          const hasSellerOrders = Array.isArray(sellerOrdersData) && sellerOrdersData.length > 0;
          setTabs(sellerTabs);
          return; // Exit early for seller accounts
        }

        // If not a seller, check buyer status and orders
        const ordersResponse = await fetch(`/api/buyer/orders?fid=${fid}`);
        const ordersData = await ordersResponse.json();
        const hasOrders = Array.isArray(ordersData) && ordersData.length > 0;

        const buyerResponse = await fetch(`/api/buyer/${fid}`);
        const buyerData = await buyerResponse.json();
        const isBuyer = buyerData?.is_buyer === true;
        setIsBuyerAccount(isBuyer);

        // Set appropriate tabs for buyer or default
        if (isBuyer && hasOrders) {
          setTabs(buyerTabs);
        } else {
          setTabs(defaultTabs);
        }
      } catch (error) {
        console.error('Error checking account status:', error);
        setIsSellerAccount(false);
        setIsBuyerAccount(false);
        setTabs(defaultTabs);
      }
    };

    if (context?.user?.fid) {
      checkAccountStatus(context.user.fid);
    } else {
      setTabs(defaultTabs);
    }
  }, [context?.user?.fid]);

  const handleOrdersClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isSellerAccount && context?.user?.fid) {
      try {
        // Check for seller orders
        const sellerOrdersResponse = await fetch(`/api/seller/orders?fid=${context.user.fid}`);
        const sellerOrdersData = await sellerOrdersResponse.json();
        
        if (Array.isArray(sellerOrdersData) && sellerOrdersData.length > 0) {
          router.push("/seller/orders");
        } else {
          router.push("/seller/empty-orders");
        }
      } catch (error) {
        console.error('Error checking seller orders:', error);
        router.push("/seller/empty-orders");
      }
      return;
    }

    // If we have a buyer account, check for orders
    if (isBuyerAccount && context?.user?.fid) {
      try {
        const ordersResponse = await fetch(`/api/buyer/orders?fid=${context.user.fid}`);
        const ordersData = await ordersResponse.json();
        
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          router.push("/buyer/order_management");
        } else {
          router.push("/buyer/empty-order");
        }
      } catch (error) {
        console.error('Error checking orders:', error);
        router.push("/buyer/empty-order");
      }
      return;
    }

    // Default case - no account or error
    router.push("/buyer/empty-order");
  };

  return (
    <div className="space-y-3">
      <div className="text-gray flex flex-col items-center">
        <p className="text-xl font-bold">{name}</p>
        <p className="text-xs">{description}</p>
      </div>
      {/*routes */}
      {!excludeRoutes.includes(pathname) && (
        <div
          className={`flex justify-between items-center gap-x-2 text-sm mx-auto ${
            showRoutes ? "block" : "hidden"
          }`}
        >
          {tabs.map(({ title, icon, link }, i) => {
            const isOrdersTab = title === "Orders";
            const onClick = isOrdersTab ? handleOrdersClick : undefined;

            return (
              <Link
                key={i}
                href={link}
                onClick={onClick}
                className={`rounded-t-md font-medium flex gap-x-1 items-center py-2 px-3 ${
                  pathname === link
                    ? "text-primary"
                    : "text-gray-500 hover:bg-primary-light hover:text-primary"
                }`}
              >
                <Icon icon={icon} fontSize={18} />
                <p
                  className={`relative ${
                    pathname === link
                      ? "after:absolute after:w-full after:h-0.5 after:bg-primary after:-bottom-2 after:left-0"
                      : ""
                  }`}
                >
                  {title}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Tab;
