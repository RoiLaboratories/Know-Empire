import Image, { StaticImageData } from "next/image";
import Phone from "../../assets/images/prod1.png";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import { getStatusColor } from "../../utils/helpers";
import { toast } from "react-hot-toast";

export interface OrdersCardProps {
  status: string;
  name: string;
  img: StaticImageData | string;
  seller: string;
  price: string;
  id: string;
  trackingNumber?: string | null;
  onConfirmDelivery?: () => void;
  escrowId?: string;
}

function OrdersCard({
  status = "shipped",
  name,
  img,
  seller,
  id,
  price,
  trackingNumber,
  onConfirmDelivery,
  escrowId
}: OrdersCardProps) {
  const icon = status === "shipped" ? ICON.TRUCK : ICON.PACKAGE;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  };

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
              width={36}
              height={40}
              {...(typeof img !== 'string' && { placeholder: "blur" })}
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
          <div className="rounded-lg border border-[#989898] p-2 flex justify-between items-center bg-[#f2f2f2] text-[#989898]">
            <span className="text-gray-700">
              {trackingNumber || 'No tracking number yet'}
            </span>
            {trackingNumber && (
              <button
                onClick={() => copyToClipboard(trackingNumber)}
                className="hover:opacity-80 transition-opacity"
              >
                <Icon icon={ICON.COPY} fontSize={16} />
              </button>
            )}
          </div>
        </div>
          {/*dispute */}
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Confirm Delivery Button - Only show for shipped orders when onConfirmDelivery is provided */}
          {(() => {
            // Debug log for Confirm Delivery Button
            console.log("[OrdersCard] Confirm Delivery Button Debug:", {
              status,
              hasTrackingNumber: !!trackingNumber,
              hasOnConfirmDelivery: !!onConfirmDelivery,
              isShipped: status.toLowerCase() === "shipped",
              showButton: status.toLowerCase() === "shipped" && !!onConfirmDelivery
            });
            
            return status.toLowerCase() === "shipped" && onConfirmDelivery && (
              <Button
                variant="success" 
                size="xs" 
                className="rounded-lg w-full"
                onClick={onConfirmDelivery}
                disabled={!trackingNumber}
              >
                <Icon icon={ICON.ARROW_CHECKED} fontSize={16} />
                Confirm Delivery
              </Button>
            );
          })()}

          {/* Dispute Button - Show for all non-completed orders */}
          {status.toLowerCase() !== "completed" && (
            <Button
              variant="warning"
              size="xs"
              className="rounded-lg"
              to={`/raise-dispute?orderId=${id}`}
            >
              <Icon icon={ICON.CAUTION} fontSize={16} />
              Raise a Dispute
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export default OrdersCard;
