import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext, useState } from "react";
import { sleep } from "../../utils/helpers";
import Modal, { ModalContext } from "../../context/ModalContext";
import GenericPopup from "./generic-popup";
import { useFarcasterAuth } from "../../hooks/useFarcasterAuth";
import { ProductWithSeller } from "../../types/product";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/helpers";

interface Props {
  onNext: () => void;
  onBack: () => void;
  product: ProductWithSeller;
}

function SecurePaymentPopup({ onNext, onBack, product }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const modalContext = useContext(ModalContext);
  const { user } = useFarcasterAuth();

  // Calculate total including fees
  const fees = 10; // Example fees in USDC
  const total = parseFloat(product.price) + fees;

  const simulateWalletCheck = async () => {
    // This is a placeholder for actual wallet balance check
    // Will be replaced with real implementation once smart contract is deployed
    const mockBalance = 1000; // Mock balance for testing
    return mockBalance >= total;
  };

  const handleSecurePayment = async () => {
    setIsLoading(true);
    try {
      // Simulate balance check
      const hasBalance = await simulateWalletCheck();
      if (!hasBalance) {
        toast.error("Insufficient funds, top up your wallet to continue");
        return;
      }

      // TODO: Once smart contract is deployed:
      // 1. Get contract instance
      // 2. Call deposit function with product seller and amount
      // 3. Handle transaction approval and confirmation

      // For now, simulate the process
      await sleep(2000);
      modalContext?.open("payment-successful-popup");
      onNext();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="font-semibold text-gray text-sm">Secure Payment</p>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-3">
        <div className="border-b border-[#989898] pb-5 space-y-3">
          <p className="font-medium text-gray text-sm">Order summary</p>

          <div className="flex gap-x-2">
            <div className="w-9 h-10 relative">
              <Image
                alt={product.title}
                src={product.photos[0]}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <p className="font-semibold text-gray-light text-sm line-clamp-2">
              {product.title}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex items-center justify-between">
            <span className="font-medium text-gray text-sm">
              Product Price
            </span>
            <span className="text-gray-600 text-sm">{formatCurrency(parseFloat(product.price))}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="font-medium text-gray text-sm">
              Escrow Fee
            </span>
            <span className="text-gray-600 text-sm">{formatCurrency(fees)}</span>
          </p>
          <div className="border-t border-[#989898] pt-2">
            <p className="flex items-center justify-between">
              <span className="font-medium text-gray text-sm">
                Total Amount
              </span>
              <span className="font-semibold text-[#16a34a] text-sm">{formatCurrency(total)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray text-sm">Payment Authorization</p>
        <div className="border border-blue-500 text-blue-600 bg-blue-100 h-36 rounded-[10px] items-center text-xs justify-center flex flex-col gap-2.5 p-5">
          <Icon
            icon={ICON.WALLET}
            fontSize={30}
          />
          <p className="text-center text-[10px]">
            Authorize payment from your Farcaster wallet to our secure escrow contract
          </p>
          <Button
            variant="secondary"
            size="xs"
            className="rounded-[10px] font-medium"
            onClick={handleSecurePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon 
                  icon={ICON.SPINNER} 
                  fontSize={15} 
                  className="animate-spin mr-2"
                />
                Processing...
              </>
            ) : (
              "Authorize Payment"
            )}
          </Button>
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
