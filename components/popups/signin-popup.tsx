import Image from "next/image";
import Farcaster from "../../assets/images/farcaster.png";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext, useEffect, useState, useCallback } from "react";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "./loading-card";
import CongratsPopup from "./congrats-popup";
import Button from "../../ui/Button";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { sdk } from '@farcaster/miniapp-sdk';

interface SigninPopupProps {
  onCloseModal?: () => void;
  onSignIn: () => void;
}

function SigninPopup({ onCloseModal, onSignIn }: SigninPopupProps) {
  const modalContext = useContext(ModalContext);
  const { setFrameReady } = useMiniKit();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  return (
    <div className="p-8 flex flex-col gap-4 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_3px_3px_rgba(180,0,247,1)]">
      <div className="flex flex-col items-center gap-6">
        <Image
          alt="farcaster-logo"
          className="object-cover"
          width={80}
          height={74}
          src={Farcaster}
        />
        <p className="font-medium text-sm sm:text-lg md:text-xl text-center">
          Sign in with Farcaster to continue to marketplace
        </p>
      </div>
      <button
        className="rounded-full text-gray p-1 text-xs bg-white absolute top-5 left-5 cursor-pointer"
        onClick={onCloseModal}
      >
        <Icon icon={ICON.CLOSE} />
      </button>

      <Button 
        className="font-medium w-[200px] drop-shadow-[0_4px_4px_rgb(65,65,65)] flex items-center justify-center gap-2"
        onClick={async () => {
          try {
            setIsAuthenticating(true);
            modalContext?.open("loading-modal");
            
            // Generate a nonce
            const nonce = crypto.randomUUID();
            
            // Trigger Farcaster sign in using miniapp SDK
            const result = await sdk.actions.signIn({
              nonce,
              acceptAuthAddress: true,
            });

            if (!result) {
              throw new Error('Sign in failed');
            }

            const { signature, message } = result;
            
            // Send to your backend for verification
            const response = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                signature,
                message,
                nonce,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to verify signature');
            }

            // Success! Close loading modal and show congrats
            modalContext?.close("loading-modal");
            modalContext?.open("congrats-modal");
            onSignIn();
          } catch (error: any) {
            console.error('Auth error:', error);
            modalContext?.close("loading-modal");
          } finally {
            setIsAuthenticating(false);
          }
        }}
        disabled={isAuthenticating}
      >
        <Image
          alt="farcaster-icon"
          className="w-5 h-5"
          width={20}
          height={20}
          src={Farcaster}
        />
        Sign in
      </Button>
    </div>
  );
}

export default SigninPopup;
