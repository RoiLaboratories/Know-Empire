"use client";

import { useCart } from "../../providers/cart";
import { useState } from "react";
import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { sleep, formatCurrency } from "../../utils/helpers";

interface CartSummaryPopupProps {
  onCloseModal?: () => void;
}

export default function CartSummaryPopup({ onCloseModal }: CartSummaryPopupProps) {
  const { cart, costBreakDown: { total } } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  
  const taxesAndFees = 10;
  const deliveryFee = 5;
  const grandTotal = total + taxesAndFees + deliveryFee;

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
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {cart.map((item) => (
            <div key={item.productId} className="flex gap-x-3 pb-4 border-b border-[#989898] last:border-b-0">
              <div className="w-20 h-20 relative shrink-0">
                <Image
                  alt={item.name}
                  src={item.img}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-gray-light text-sm line-clamp-2">
                  {item.name}
                </p>
                <p className="text-sm text-primary font-bold">
                  {formatCurrency(item.unitPrice)}
                </p>
                <p className="text-xs text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#989898] pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-medium">{formatCurrency(taxesAndFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-dashed border-[#989898]">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

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
