"use client";

import { useCart } from "../../providers/cart";
import { useState } from "react";
import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { sleep } from "../../utils/helpers";

interface CartSummaryPopupProps {
  onCloseModal?: () => void;
}

export default function CartSummaryPopup({ onCloseModal }: CartSummaryPopupProps) {
  const { cart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    // Add logic for next step
  };

  return (
    <div className="space-y-2">
      <p className="font-semibold text-gray text-sm">Cart Summary</p>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-4">
        {cart.map((item) => (
          <div key={item.productId} className="flex gap-x-2 border-b border-[#989898] pb-4">
            <div className="w-9 h-10 relative">
              <Image
                alt={item.name}
                src={item.img}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-light text-sm line-clamp-2">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                Quantity: {item.quantity} × ${item.unitPrice}
              </p>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="rounded-[10px] font-medium w-full"
          onClick={handleNext}
          disabled={isLoading || cart.length === 0}
        >
          {!isLoading ? (
            "Continue to Delivery info"
          ) : (
            <>
              <Icon icon={ICON.SPINNER} fontSize={15} className="animate-spin" />
              Loading...
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
