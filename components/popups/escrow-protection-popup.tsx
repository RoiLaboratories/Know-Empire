import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import { useContext, useEffect, useState } from "react";
import { sleep } from "../../utils/helpers";
import Modal, { ModalContext } from "../../context/ModalContext";
import GenericPopup from "./generic-popup";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

function EscrowProtectionPopup({ onNext, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const modalContext = useContext(ModalContext);

  useEffect(() => {
    setTimeout(() => {
      modalContext?.open("escrow-protection-popup");
    }, 1000);
  }, []);

  const handleNext = async () => {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    onNext();
  };

  return (
    <div className="space-y-2">
      <p className="font-semibold text-gray text-sm">Escrow Protection</p>
      <div className="rounded-[10px] bg-[#f0fdf4] border border-[#bbf7d0] p-5 space-y-3">
        <p className="flex items-center gap-x-1 font-medium text-gray text-[13px]">
          <Icon icon={ICON.VERIFIED} className="text-green-600" fontSize={15} />
          Your payment is protected
        </p>
        <p className="text-green-600 italic font-medium text-[10px]">
          Your payment will be held in escrow until you confirm you’ve received
          the item.
        </p>

        <div className="flex gap-x-1.5">
          <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
            1
          </span>
          <div className=" text-[11px]">
            <p className="font-medium">Pay into Escrow</p>
            <p className=" text-[#808080]">Your payment is secured</p>
          </div>
        </div>
        <div className="flex gap-x-1.5">
          <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
            2
          </span>
          <div className=" text-[11px]">
            <p className="font-medium">Seller ships item</p>
            <p className=" text-[#808080]">Tracking info provided</p>
          </div>
        </div>
        <div className="flex gap-x-1.5">
          <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
            3
          </span>
          <div className=" text-[11px]">
            <p className="font-medium">Confirm delivery</p>
            <p className=" text-[#808080]">You release the funds</p>
          </div>
        </div>
        <div className="flex gap-x-1.5">
          <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
            4
          </span>
          <div className=" text-[11px]">
            <p className="font-medium">Leave a review</p>
            <p className=" text-[#808080]">Rate your experience</p>
          </div>
        </div>
      </div>

      <div className="text-[11px] flex items-center gap-1">
        <Icon icon={ICON.CONFIRM} className="text-[#2d69ec]" fontSize={12} />
        <p className="font-medium">Buyer Protection</p>
        <Icon icon={ICON.INFO} className="text-[#989898]" />
      </div>

      <div className="flex gap-x-6 mt-2">
        <Button
          variant="back"
          size="xs"
          className="rounded-[10px] font-medium"
          onClick={onBack}
        >
          Back
        </Button>

        <Button
          variant="secondary"
          size="xs"
          className="rounded-[10px] font-medium"
          onClick={handleNext}
          disabled={isLoading}
        >
          {!isLoading ? (
            "Proceed to payment"
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

        {/*modals */}
        <Modal.Window name="escrow-protection-popup" showBg={false}>
          <GenericPopup
            icon={ICON.SECURITY}
            text="If there’s an issue with your order, our dispute resolution system ensures fair outcomes for all parties"
          />
        </Modal.Window>
      </div>
    </div>
  );
}

export default EscrowProtectionPopup;
