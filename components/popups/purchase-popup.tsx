import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import Phone from "../../assets/images/prod1.png";
import Button from "../../ui/Button";
import Modal, { useModal } from "../../context/ModalContext";
import GenericPopup from "./generic-popup";
import { useState, useEffect } from "react";
import ProductSummaryPopup from "./product-summary-popup";
import DeliveryInformationPopup from "./delivery-information-popup";
import EscrowProtectionPopup from "./escrow-protection-popup";
import SecurePaymentPopup from "./secure-payment-popup";
import SecurePaymentConfirmed from "./secure-payment-confirmed-popup";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ProductWithSeller } from "../../types/product";

interface PurchasePopupProps {
  onCloseModal?: () => void;
  product: ProductWithSeller;
}

function PurchasePopup({ onCloseModal, product }: PurchasePopupProps) {
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { context } = useMiniKit() as { context: { user?: { fid: number } } };
  
  // Safety check: prevent purchasing own products
  if (context?.user && product.seller.farcaster_id === context.user.fid.toString()) {
    onCloseModal?.();
    return null;
  }

  const { close, open } = useModal();

  // Check for order ID when moving to confirmation step
  useEffect(() => {
    if (purchaseStep === 5) {
      const lastOrderId = localStorage.getItem('last_order_id');
      if (lastOrderId) {
        setOrderId(lastOrderId);
        // Clear the stored ID
        localStorage.removeItem('last_order_id');
      }
    }
  }, [purchaseStep]);
  
  const handleNextStep = () => {
    const nextStep = purchaseStep + 1;
    setPurchaseStep(nextStep);
    } else {
      setPurchaseStep(nextStep);
    }
  };

  const handleBack = () => {
    setPurchaseStep((curr) => curr - 1);
  };

  return (
    <div className="rounded-t-2xl px-5 pt-5 pb-10 w-[300px] md:w-[402px] bg-white space-y-10" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray text-sm">Secure Purchase</p>
        <div onClick={() => close()}>
          <Icon
            icon={ICON.CANCEL}
            fontSize={24}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/*main content  */}

      <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
        {purchaseStep === 1 && (
          <ProductSummaryPopup 
            onNext={handleNextStep}
            product={product}
          />
        )}

        {purchaseStep === 2 && (
          <DeliveryInformationPopup
            onNext={handleNextStep}
            onBack={handleBack}
            product={product}
          />
        )}

        {purchaseStep === 3 && (
          <EscrowProtectionPopup onNext={handleNextStep} onBack={handleBack} />
        )}

        {purchaseStep === 4 && (
          <SecurePaymentPopup onNext={handleNextStep} onBack={handleBack} product={product} />
        )}
      </div>
    </div>
  );
}

// Add confirmation modal window
const ConfirmationModalWindow = () => {
  const { close } = useModal();
  return (
    <Modal.Window name="secure-payment-confirmed">
      <SecurePaymentConfirmed onCloseModal={close} />
    </Modal.Window>
  );
};

export default PurchasePopup;
