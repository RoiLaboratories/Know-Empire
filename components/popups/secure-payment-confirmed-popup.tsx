import { Icon } from "@iconify/react";
import Button from "../../ui/Button";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import Phone from "../../assets/images/prod1.png";
import { useEffect, useState } from "react";

interface Props {
  onNext: () => void;
  onCloseModal: () => void;
}

function SecurePaymentConfirmed({ onNext, onCloseModal }: Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsConfirmed(true);
    }, 2000);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-gray text-sm">Secure Payment</p>
      <div
        className={`rounded-[10px] border  border-[#989898] p-5 flex flex-col items-center justify-center gap-1 ${
          isConfirmed ? "bg-white" : "bg-blue-50"
        }`}
      >
        <Icon
          icon={!isConfirmed ? ICON.HISTORY : ICON.PACKAGE}
          fontSize={39}
          className={` ${!isConfirmed ? "text-blue-600" : "text-[#ee7435]!"}`}
        />
        <p className="text-gray font-medium text-[15px]">
          {!isConfirmed ? "Payment Confirmed" : "Item Shipped"}
        </p>
        <p className="text-xs text-[#989898] text-center">
          {!isConfirmed
            ? "Waiting for seller to mark as shipped..."
            : "Track your order and confirm when received"}
        </p>
        <span className="bg-[#f4f2f8] px-4 py-1 rounded-full">
          <p className="text-[#925f21] text-[10px] font-medium">Order #3</p>
        </span>
      </div>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-3 mt-2">
        <p className="font-medium text-gray text-sm">Order summary</p>

        <div className="border-b border-[#989898] pb-3 flex justify-between items-end gap-x-2">
          <div className="flex gap-x-2 ">
            <div className="w-9 h-10">
              <Image
                alt="phone"
                src={Phone}
                placeholder="blur"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-semibold text-gray-light text-sm line-clamp-2">
              Iphone 15 Pro max Black | 1TB
            </p>
          </div>
          <p className="text-[#414141] font-semibold text-[15px]">$999</p>
        </div>

        <p className="text-[#989898] text-[13px]">
          Transaction: <span className="italic">0x80b8c4ab46a9a...</span>
        </p>
      </div>

      <div className="mt-2">
        {!isConfirmed ? (
          <>
            <Button
              variant="tertiary"
              size="xs"
              className="rounded-[10px] font-medium"
              onClick={onCloseModal}
              //   onClick={onNext}
            >
              Request Cancellation
            </Button>
            <p className="text-[8px] text-[#989898]">
              You can cancel this order if the seller doesn’t ship within the
              expected timeframe
            </p>
          </>
        ) : (
          <Button
            variant="back"
            size="xs"
            className="rounded-[10px] font-medium"
            onClick={onCloseModal}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default SecurePaymentConfirmed;
