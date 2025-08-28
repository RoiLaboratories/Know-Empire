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
  { title: "Orders", icon: ICON.GIFT_CARD, link: "/orders" },
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
  const [tabs, setTabs] = useState<TabItem[]>(defaultTabs);

  const excludeRoutes = ["/marketplace/sell"];

  useEffect(() => {
    const checkSellerStatus = async (fid: number) => {
      try {
        const response = await fetch(`/api/seller/${fid}`);
        const data = await response.json();
        setIsSellerAccount(!!data);
        setTabs(!!data ? sellerTabs : defaultTabs);
      } catch (error) {
        console.error('Error checking seller status:', error);
        setIsSellerAccount(false);
        setTabs(defaultTabs);
      }
    };

    if (context?.user?.fid) {
      checkSellerStatus(context.user.fid);
    }
  }, [context?.user?.fid]);

  const handleOrdersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isBuyerOrdersPage = pathname === "/orders";
    const isSellerOrdersPage = pathname === "/seller/orders";
    
    if ((isBuyerOrdersPage && !isSellerAccount) || (isSellerOrdersPage && isSellerAccount)) {
      // If we're already on the correct orders page, prevent navigation
      e.preventDefault();
      return;
    }

    e.preventDefault();
    // Navigate to the appropriate orders page based on account type
    router.push(isSellerAccount ? "/seller/orders" : "/orders");
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
