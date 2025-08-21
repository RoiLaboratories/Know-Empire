import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import { useState } from "react";
import { sleep } from "../../utils/helpers";

import { ProductWithSeller } from "../../types/product";

interface IDProps {
  onNext: () => void;
  onBack: () => void;
  product: ProductWithSeller;
}

function DeliveryInformationPopup({ onNext, onBack, product }: IDProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const handleNext = async () => {
    setIsLoading(true);
    // TODO: Store delivery notes in order data
    await sleep(2000);
    setIsLoading(false);
    onNext();
  };

  return (
    <div className="space-y-2">
      <p className="font-semibold text-gray text-sm">Delivery Information</p>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-4">
        <p className="font-medium text-gray text-[13px]">Shipping details</p>

        <div className="flex gap-x-1">
          <Icon icon={ICON.LOCATION} fontSize={16} className="text-[#808080]" />
          <div className=" text-[11px]">
            <p className="font-medium">Shipping from</p>
            <p className=" text-[#808080]">{product.country}</p>
          </div>
        </div>
        <div className="flex gap-x-1">
          <Icon icon={ICON.HISTORY} fontSize={16} className="text-[#808080]" />
          <div className=" text-[11px]">
            <p className="font-medium">Delivery Details</p>
            <p className=" text-[#808080]">{product.delivery}</p>
          </div>
        </div>
        <div className="flex gap-x-1">
          <Icon icon={ICON.FILE} fontSize={16} className="text-[#808080]" />
          <div className=" text-[11px]">
            <p className="font-medium">Delivery Policy</p>
            <p className=" text-[#808080]">
              Sellers are responsible for delivery and must provide tracking information
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray text-sm">Delivery notes*</p>
        <textarea
          className="border border-[#989898] text-gray-700 bg-white h-36 rounded-[10px] p-3 text-xs w-full resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Add any special delivery instructions or address details"
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
        />

        <div className="flex gap-x-6 mt-2">
          <Button
            variant="back"
            size="xs"
            className="rounded-[10px] font-medium mt-2"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            size="xs"
            className="rounded-[10px] font-medium mt-2"
            onClick={handleNext}
            disabled={isLoading}
          >
            {!isLoading ? (
              "Continue to Escrow"
            ) : (
              <>
                <Icon
                  icon={ICON.SPINNER}
                  fontSize={15}
                  className="animate-spin"
                />
                Loading...
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryInformationPopup;
