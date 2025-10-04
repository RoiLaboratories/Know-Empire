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
    router.push('/buyer/order_management');
    onCloseModal?.();
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
        