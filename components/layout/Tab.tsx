"use client";

import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrders } from "../../providers/orders";

interface ITab {
  name: string;
  description: string;
  showRoutes?: boolean;
}

const tabs = [
  { title: "Discover", icon: ICON.SEARCH, link: "/marketplace" },
  { title: "Orders", icon: ICON.GIFT_CARD, link: "/orders" },
  { title: "Top", icon: ICON.ORGANISATION, link: "/leaderboard" },
];

function Tab({ name, description, showRoutes = true }: ITab) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasOrders } = useOrders();

  const excludeRoutes = ["/marketplace/sell"];

  const handleOrdersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/orders") {
      // If we're already on the orders page, prevent navigation
      return;
    }

    e.preventDefault();
    if (hasOrders) {
      // If user has orders, navigate to OrdersCard view
      router.push("/orders");
    } else {
      // If user has no orders, navigate to empty state view
      router.push("/orders");
    }
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
