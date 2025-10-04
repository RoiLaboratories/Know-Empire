"use client";

import { useRouter } from "next/navigation";
import GenericPopup from "./generic-popup";
import { ICON } from "../../utils/icon-export";

interface Props {
  onCloseModal?: () => void;
}

function SecurePaymentConfirmed({ onCloseModal }: Props) {
  const router = useRouter();
  
  const handleViewOrder = () => {
    // First close the modal
    onCloseModal?.();
    // Then navigate after a small delay to ensure modal closes properly
    setTimeout(() => {
      router.push('/buyer/order_management');
    }, 100);
  };

  return (
    <GenericPopup
      text="Your payment was successful and your item is on the way"
      icon={ICON.CHECK_CIRCLE}
      iconStyle="text-green-500"
      onClickFn={handleViewOrder}
      onCloseModal={onCloseModal}
    />
  );
}

export default SecurePaymentConfirmed;
        