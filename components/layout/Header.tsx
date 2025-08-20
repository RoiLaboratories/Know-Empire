"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { ICON } from "../../utils/icon-export";
import User from "../../assets/images/user.svg";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../providers/cart";
import { useProfile } from '@farcaster/auth-kit';

const routes = [
  { title: "Buy Products", icon: ICON.BUY, path: "/marketplace" },
  { title: "Sell Products", icon: ICON.SELL, path: "/marketplace/sell" },
];

function Header() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { profile, isAuthenticated } = useProfile();

  return (
    <div className="space-y-5 mb-3">
      <div className="flex justify-between items-center">
        <Image
          loading="lazy"
          width={40}
          height={24.36}
          sizes="100vw"
          alt="Know Empire Logo"
          src="/group-dark.svg"
        />
        <div className="flex items-center gap-x-2">
          {/* <Icon icon={ICON.HISTORY} fontSize={21} /> */}
          <span className="relative">
            <Link href="/cart">
              <Icon icon={ICON.CART} fontSize={21} />
            </Link>
            <span className="rounded-full bg-primary size-2.5 absolute bottom-1 right-0 grid place-items-center text-white text-[5px]">
              {cart.length}
            </span>
          </span>
          <Link
            href="/profile"
            className="size-[33px] rounded-full bg-gray-300 relative"
          >
            <Image
              loading="lazy"
              fill
              alt={isAuthenticated && profile.username ? profile.username : "User Profile"}
              src={isAuthenticated && profile.pfpUrl ? profile.pfpUrl : User}
              className="rounded-full object-cover"
            />
          </Link>
        </div>
      </div>

      {/*header */}
      <div className="text-gray">
        <p className="font-bold text-[15px]">
          Welcome {isAuthenticated ? profile.displayName : "Guest"}!
        </p>
        <p className="text-xs">
          To your secure market place for physical products
        </p>
      </div>

      {/*tabs */}
      <div className="grid grid-cols-2 text-xs w-[95%] mx-auto">
        {routes.map(({ icon, title, path }, i) => (
          <Link
            href={path}
            className={`relative rounded-t-md font-medium  flex gap-1 md:gap-2 items-center py-2 px-3 focus:outline-none cursor-pointer ${
              pathname === path
                ? "before:absolute before:h-[2px] before:bg-primary before:w-full before:bottom-0 before:left-0 text-primary bg-primary-light"
                : "bg-white hover:bg-primary-light hover:text-primary"
            }`}
            key={i}
          >
            <Icon icon={icon} fontSize={18} />
            {title}
          </Link>
        ))}
        {/* <button className="relative bg-white rounded-t-md font-medium  flex gap-1 md:gap-2 items-center py-2 px-3 focus:outline-none cursor-pointer hover:bg-primary-light">
          <Icon icon={ICON.SELL} fontSize={18} />
          Sell Products
        </button> */}
      </div>
    </div>
  );
}

export default Header;
