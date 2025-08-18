import Image from "next/image";
import Farcaster from "../../assets/images/farcaster.png";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext, useEffect } from "react";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "./loading-card";
import CongratsPopup from "./congrats-popup";
import Button from "../../ui/Button";
import { useMiniKit, useAuthenticate } from '@coinbase/onchainkit/minikit';

interface SigninPopupProps {
  onCloseModal?: () => void;
  onSignIn: () => void;
}

function SigninPopup({ onCloseModal, onSignIn }: SigninPopupProps) {
  const modalContext = useContext(ModalContext);
  const { setFrameReady } = useMiniKit();
  const { signIn } = useAuthenticate();

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handleSuccess = async () => {
    console.log("Sign in initiated");
    if (!modalContext) {
      console.log("No modal context available");
      return;
    }

    try {
      // Close any existing modals first
      modalContext.close();
      modalContext.open("loading-modal");

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("Sign in timed out");
        modalContext.close("loading-modal");
      }, 30000); // 30 second timeout

      try {
        // Trigger SIWF authentication
        const result = await signIn();

        clearTimeout(timeoutId);

        if (result) {
          // Short delay to ensure the auth flow is complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          modalContext.close("loading-modal");
          modalContext.open("congrats-modal");
          onSignIn();
        } else {
          console.error('Authentication failed');
          modalContext.close("loading-modal");
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Failed to complete sign in flow:', error);
      modalContext.close("loading-modal");
    }
  };

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
        onClick={handleSuccess}
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
