import Image from "next/image";
import Phone from "../../assets/images/prod1.png";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext, useState } from "react";
import { sleep } from "../../utils/helpers";
import Modal, { ModalContext } from "../../context/ModalContext";
import GenericPopup from "./generic-popup";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

function SecurePaymentPopup({ onNext, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const modalContext = useContext(ModalContext);

  const handleNext = async () => {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    setIsConnected(true);
    modalContext?.open("wallet-connected-popup");
    // onNext();
  };

  const handleProcessPayment = async () => {
    setIsConnecting(true);
    await sleep(2000);
    setIsConnecting(false);
    setIsConnected(false);
    modalContext?.open("payment-successful-popup");
    // onNext();
  };

  return (
    <div className="space-y-2">
      <p className="font-semibold text-gray text-sm">Secure Payment</p>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-3">
        <div className="border-b border-[#989898] pb-5 space-y-3">
          <p className="font-medium text-gray text-sm">Order summary</p>

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
        </div>

        <p className="flex items-center justify-between">
          <span className="font-medium text-gray text-sm">
            Total ( Including fees)
          </span>
          <span className="font-semibold text-[#16a34a] text-sm">$999</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray text-sm">Delivery notes*</p>
        <div
          className={`border  h-36 rounded-[10px] items-center text-xs justify-center flex flex-col gap-2.5 p-5 ${
            isConnected
              ? "border-green-500 text-green-600 bg-green-100"
              : "border-blue-500 text-blue-600 bg-blue-100"
          }`}
        >
          <Icon
            icon={!isConnected ? ICON.WALLET : ICON.PADLOCK}
            fontSize={30}
          />
          <p className="text-center text-[10px]">
            {!isConnected
              ? "Connect Your Wallet to proceed with secure payment"
              : "Connect Your Wallet to proceed with secure payment"}
          </p>
          {!isConnected ? (
            <Button
              variant="secondary"
              size="xs"
              className="rounded-[10px] font-medium"
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
          ) : (
            <Button
              variant="success"
              size="xs"
              className="rounded-[10px] font-medium"
              onClick={handleProcessPayment}
              disabled={isConnecting}
            >
              {!isConnecting ? (
                "Pay $999 (Escrow)"
              ) : (
                <>
                  <Icon
                    icon={ICON.SPINNER}
                    fontSize={15}
                    className="animate-spin"
                  />
                  Processing payment...
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          variant="back"
          size="xs"
          className="rounded-[10px] font-medium mt-2"
          onClick={onBack}
        >
          Back
        </Button>

        {/*modals */}
        <Modal.Window name="wallet-connected-popup" showBg={false}>
          <GenericPopup
            iconStyle="text-green-600"
            icon={ICON.CHECK_CIRCLE}
            text="Your wallet is connected successfully"
          />
        </Modal.Window>
        <Modal.Window name="payment-successful-popup" showBg={false}>
          <GenericPopup
            iconStyle="text-green-600"
            icon={ICON.CHECK_CIRCLE}
            text="Your payment was successful and your item is on the way"
            onClickFn={onNext}
          />
        </Modal.Window>
      </div>
    </div>
  );
}

export default SecurePaymentPopup;
