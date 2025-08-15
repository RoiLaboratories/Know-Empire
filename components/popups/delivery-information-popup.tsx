import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import { useState } from "react";
import { sleep } from "../../utils/helpers";

interface IDProps {
  onNext: () => void;
  onBack: () => void;
}

function DeliveryInformationPopup({ onNext, onBack }: IDProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleNext = async () => {
    setIsLoading(true);
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
            <p className=" text-[#808080]">United States</p>
          </div>
        </div>
        <div className="flex gap-x-1">
          <Icon icon={ICON.HISTORY} fontSize={16} className="text-[#808080]" />
          <div className=" text-[11px]">
            <p className="font-medium">Expected delivery</p>
            <p className=" text-[#808080]">5-10 business days</p>
          </div>
        </div>
        <div className="flex gap-x-1">
          <Icon icon={ICON.FILE} fontSize={16} className="text-[#808080]" />
          <div className=" text-[11px]">
            <p className="font-medium">5-10 business days</p>
            <p className=" text-[#808080]">
              Sellers are responsible for delivery
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray text-sm">Delivery notes*</p>
        <div className="border border-[#989898] text-[#989898] bg-[#f3f3f3] h-36 rounded-[10px] flex items-center text-xs justify-center text-center">
          <p>Add any special delivery instructions or address details </p>
        </div>

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
