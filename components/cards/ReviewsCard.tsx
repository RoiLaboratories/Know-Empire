import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { Review } from "../../types/review";
import { format } from "date-fns";

interface ReviewsCardProps {
  review: Review;
}

function ReviewsCard({ review }: ReviewsCardProps) {
  return (
    <li className="space-y-2">
      <div className="flex justify-between">
        <span className="flex gap-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              icon={ICON.STAR}
              className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
              key={i}
            />
          ))}
        </span>
        <p className="text-xs">{format(new Date(review.created_at), 'dd-MM-yyyy')}</p>
      </div>
      <p className="font-semibold text-sm flex items-center">
        {review.reviewer?.display_name || 'Anonymous'}&nbsp;&nbsp;
        <span className="text-[10px] font-light">@{review.reviewer?.farcaster_username}</span>
      </p>
      <span className="flex items-center justify-center rounded-full px-1 py-[1px] border-[1.5px] w-fit border-gray-light font-medium text-[10px]">
        {review.product?.title || 'Product'}
      </span>
      {/*review */}
      <div className="flex items-start gap-5 text-[10px]">
        <p className="text-gray-500">
          {review.comment}
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
