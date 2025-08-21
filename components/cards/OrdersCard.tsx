import Image, { StaticImageData } from "next/image";
import Phone from "../../assets/images/prod1.png";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import { getStatusColor } from "../../utils/helpers";

export interface OrdersCardProps {
  status: string;
  name: string;
  img: StaticImageData;
  seller: string;
  price: string;
  id: string;
}

function OrdersCard({
  status = "shipped",
  name,
  img,
  seller,
  id,
  price,
}: OrdersCardProps) {
  const icon = status === "shipped" ? ICON.TRUCK : ICON.PACKAGE;

  return (
    <li className="flex flex-col justify-between gap-y-2 bg-white rounded-lg p-4 border border-[#989898] ">
      {/*product */}
      <div className="flex justify-between items-start gap-x-2">
        {/*item */}
        <div className="flex gap-x-2">
          <div className="w-9 h-10">
            <Image
              alt={name}
              src={img}
              placeholder="blur"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="font-bold text-gray-light line-clamp-2">{name}</p>
        </div>
        {/*status */}
        <span
          className={`rounded-full text-[11px] py-1 px-2  flex items-center capitalize justify-center gap-1 ${getStatusColor(
            status
          )}`}
        >
          <Icon icon={icon} fontSize={15} />
          {status}
        </span>
      </div>
      {/*info */}
      <div className="divide-y-1 space-y-3 divide-[#989898]  text-xs">
        <div className="flex gap-x-10 text-gray pb-3">
          <p className="flex flex-col gap-1">
            <span>Seller</span>
            <span className="font-medium">@{seller}</span>
          </p>
          <p className="flex flex-col gap-1">
            <span>Amount</span>
            <span className="font-medium text-green-600">${price}</span>
          </p>
        </div>
        {/*tracking details */}
        <div className="flex flex-col text-gray gap-1 pb-4">
          <p className="text-[#6b88b5]">Tracking ID:</p>
          <p className="rounded-lg border border-[#989898] p-2 flex justify-between items-center bg-[#f2f2f2] text-[#989898]">
            <span>{id}</span>
            <Icon icon={ICON.COPY} />
          </p>
        </div>
        {/*dispute */}
        {status === "shipped" ? (
          <>
            <Button
              variant="warning"
              size="xs"
              className="rounded-lg"
              to="/raise-dispute"
            >
              <Icon icon={ICON.CAUTION} fontSize={16} />
              Raised a Dispute
            </Button>

            <Button variant="success" size="xs" className="rounded-lg">
              <Icon icon={ICON.ARROW_CHECKED} fontSize={16} />
              Confirmed
            </Button>
          </>
        ) : (
          <Button variant="warning" size="xs" className="rounded-lg">
            <Icon icon={ICON.CAUTION} fontSize={16} />
            Raised a Dispute
          </Button>
        )}
      </div>
    </li>
  );
}

export default OrdersCard;
