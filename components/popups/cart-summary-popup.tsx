"use client";

import { useCart } from "../../providers/cart";
import { useState, useContext } from "react";
import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { sleep, formatCurrency } from "../../utils/helpers";
import { ModalContext } from "../../context/ModalContext";

interface CartSummaryPopupProps {
  onCloseModal?: () => void;
}

export default function CartSummaryPopup({ onCloseModal }: CartSummaryPopupProps) {
  const { cart, costBreakDown: { total } } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const modalContext = useContext(ModalContext);
  
  const taxesAndFees = 10;
  const deliveryFee = 5;
  const grandTotal = total + taxesAndFees + deliveryFee;

  const handleNext = async () => {
    setIsLoading(true);
    await sleep(1000);
    setIsLoading(false);
    modalContext?.close("cart-summary-popup");
    modalContext?.open("purchase-product-popup");
  };

  return (
    <div className="rounded-t-2xl px-5 pt-5 pb-10 w-[300px] md:w-[402px] bg-white space-y-10">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray text-sm">Cart Summary</p>
        <Icon
          icon={ICON.CANCEL}
          fontSize={24}
          onClick={onCloseModal}
          className="cursor-pointer"
        />
      </div>

      {/*main content  */}
      <div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
          {/* Cart Items */}
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-x-3">
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

          {/* Cost Breakdown Section */}
          <div className="border-t border-b border-[#989898] py-4">
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

          {/* Payment Protection Notice */}
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Payment Protection</p>
              <p className="text-gray-600 text-xs">
                Your payment is protected by our secure escrow system. Funds will only be released to the seller after you confirm receipt of your order.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              size="xs"
              className="rounded-[10px] font-medium w-full"
              onClick={handleNext}
              disabled={isLoading || cart.length === 0}
            >
              {!isLoading ? (
                "Proceed to Purchase"
              ) : (
                <>
                  <Icon icon={ICON.SPINNER} fontSize={15} className="animate-spin" />
                  Loading...
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
