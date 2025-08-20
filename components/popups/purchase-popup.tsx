import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import Phone from "../../assets/images/prod1.png";
import Button from "../../ui/Button";
import Modal from "../../context/ModalContext";
import GenericPopup from "./generic-popup";
import { useState } from "react";
import ProductSummaryPopup from "./product-summary-popup";
import DeliveryInformationPopup from "./delivery-information-popup";
import EscrowProtectionPopup from "./escrow-protection-popup";
import SecurePaymentPopup from "./secure-payment-popup";
import SecurePaymentConfirmed from "./secure-payment-confirmed-popup";

import { ProductWithSeller } from "../../types/product";

interface PurchasePopupProps {
  onCloseModal?: () => void;
  product: ProductWithSeller;
}

function PurchasePopup({ onCloseModal, product }: PurchasePopupProps) {
  const [purchaseStep, setPurchaseStep] = useState(1);

  const handleNextStep = () => {
    console.log({ purchaseStep });
    setPurchaseStep((curr) => curr + 1);
    console.log({ purchaseStep });
  };

  const handleBack = () => {
    setPurchaseStep((curr) => curr - 1);
  };

  return (
    <div className="rounded-t-2xl px-5 pt-5 pb-10 w-[300px] md:w-[402px] bg-white space-y-10">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray text-sm">Secure Purchase</p>
        <Icon
          icon={ICON.CANCEL}
          fontSize={24}
          onClick={onCloseModal}
          className="cursor-pointer"
        />
      </div>

      {/*main content  */}

      <div>
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
          />
        )}

        {purchaseStep === 3 && (
          <EscrowProtectionPopup onNext={handleNextStep} onBack={handleBack} />
        )}

        {purchaseStep === 4 && (
          <SecurePaymentPopup onNext={handleNextStep} onBack={handleBack} />
        )}

        {purchaseStep === 5 && (
          <SecurePaymentConfirmed
            onNext={handleNextStep}
            onCloseModal={onCloseModal ?? (() => {})}
          />
        )}
      </div>
    </div>
  );
}

export default PurchasePopup;
