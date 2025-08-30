import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext, useState } from "react";
import { sleep } from "../../utils/helpers";
import Modal, { ModalContext } from "../../context/ModalContext";
import { CartContext } from "../../providers/cart";
import GenericPopup from "./generic-popup";
import { useAccount } from "wagmi";
import { ProductWithSeller } from "../../types/product";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/helpers";
import { approveUSDC, createEscrow } from "../../utils/contractHelpers";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface MiniKitContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
}

interface Props {
  onNext: () => void;
  onBack: () => void;
  product: ProductWithSeller;
}

function SecurePaymentPopup({ onNext, onBack, product }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const modalContext = useContext(ModalContext);
  const { address, isConnected } = useAccount();
  const { context } = useMiniKit() as { context: MiniKitContext };
  const cartContext = useContext(CartContext);

  // Calculate total based on cart quantity for this product
  const cartItem = cartContext?.cart.find(item => item.productId === product.id);
  const quantity = cartItem?.quantity || 1;
  const total = parseFloat(product.price) * quantity;

  const handleSecurePayment = async () => {
    setIsLoading(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      if (!context?.user?.fid) {
        const storedUser = localStorage.getItem('farcaster_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user?.fid) {
          throw new Error("Please connect with Farcaster first");
        }
      }

      // First approve USDC spending
      const approved = await approveUSDC(total.toString());
      if (!approved) {
        toast.error("Failed to approve USDC spending");
        return;
      }

      // Check if seller wallet address exists
      if (!product.seller.wallet_address) {
        throw new Error("Seller wallet address not found");
      }

      // Create escrow with the product seller and amount
      const { escrowId } = await createEscrow(
        product.seller.wallet_address,
        total.toString(),
        product.id // Using product ID as order ID
      );

      // Create order with escrow ID
      // Get user from localStorage if context is not available
      const storedUser = localStorage.getItem('farcaster_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.fid) {
        throw new Error('No user FID found');
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'pending',
          product_id: product.id,
          escrow_id: escrowId,
          total_amount: total,
          fid: context?.user?.fid || 0, // Using 0 as fallback for type safety, the API will handle this as an error
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      toast.success("Payment secured in escrow!");
      await sleep(2000);
      modalContext?.open("payment-successful-popup");
      onNext(); // Move to next step
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to process payment");
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
