import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";

function ReviewsCard() {
  return (
    <li className="space-y-2">
      <div className="flex justify-between">
        <span className="flex gap-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              icon={ICON.STAR}
              // fontSize={26}
              key={i}
            />
          ))}
        </span>
        <p className="text-xs">16-07-2025</p>
      </div>
      <p className="font-semibold text-sm flex items-center">
        Sarah Chen&nbsp;&nbsp;
        <span className="text-[10px] font-light">@sarahweb3</span>
      </p>
      <span className="flex items-center justify-center rounded-full px-1 py-[1px] border-[1.5px] w-fit border-gray-light font-medium text-[10px]">
        Vintage Crypto Poster
      </span>
      {/*review */}
      <div className="flex items-start gap-5 text-[10px]">
        <p className="text-gray-500">
          Amazing seller! Item wasexactly as described and shpped super
          fast.highly reccomended
        </p>
        <p className="text-nowrap flex items-center gap-x-1 text-green-500">
          <span>
            <Icon icon={ICON.ARROW_CHECKED} className="text-green-500" />
          </span>
          Verified Purchase
        </p>
      </div>
    </li>
  );
}

export default ReviewsCard;
