"use client";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { usePathname } from "next/navigation";
import Link from "next/link";

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

  const excludeRoutes = ["/marketplace/sell"];

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
          {tabs.map(({ title, icon, link }, i) => (
            <Link
              key={i}
              href={link}
              className={`rounded-t-md font-medium  flex gap-x-1 items-center py-2 px-3 ${
                pathname === link
                  ? "text-primary"
                  : "text-gray-500 hover:bg-primary-light hover:text-primary"
              }`}
            >
              <Icon icon={icon} fontSize={18} />
              <p
                className={`relative  ${
                  pathname === link
                    ? "text-primary before:h-[1px] before:bg-primary before:w-8/10 before:-translate-x-1/2  before:-bottom-1 before:left-1/2 before:absolute"
                    : ""
                }`}
              >
                {title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tab;
