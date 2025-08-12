import Image, { StaticImageData } from "next/image";
// import User from "../../assets/images/user.svg";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";

interface LeadersCardProps {
  isYou?: boolean;
  name: string;
  username: string;
  rank: number;
  num_package: number;
  rating: string;
  isTopSeller?: boolean;
  avatar: StaticImageData;
}

function LeadersCard({
  isYou = false,
  name,
  username,
  rank,
  num_package,
  rating,
  isTopSeller = false,
  avatar,
}: LeadersCardProps) {
  return (
    <li
      className={`rounded-[13px] p-4 border border-[#989898]  flex justify-between items-center gap-x-2 bg-blue-light text-gray-700 text-xs`}
    >
      <div className="flex items-center gap-x-2">
        {isTopSeller && (
          <span className="relative ">
            <Icon icon={ICON.AWARD} fontSize={24} className="text-yellow-500" />
            <p className="absolute top-1 left-1/2 -translate-x-1/2 text-white text-[9px] font-medium">
              {rank}
            </p>
          </span>
        )}
        <span className="size-7 rounded-full bg-gray-medium ">
          <Image
            alt={`${username}`}
            src={avatar}
            // placeholder="blur"
            className="rounded-full w-full h-full object-cover"
          />
        </span>
        <div className="font-semibold">
          <p>{isYou ? "YOU" : name}</p>
          <p>
            <span className="font-medium">
              {isYou ? `Rank: #${rank}` : username}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-x-3">
        <span className="flex gap-x-2">
          <Icon icon={ICON.PACKAGE} fontSize={16} className="text-orange" />
          {num_package}
        </span>
        <span className="flex gap-x-2">
          <Icon icon={ICON.STAR} fontSize={16} className="text-orange" />
          {rating}
        </span>
        <Icon icon={ICON.TRIANGLE} fontSize={16} className="text-brown" />
      </div>
    </li>
  );
}

export default LeadersCard;
