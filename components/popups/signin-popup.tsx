import Image from "next/image";
import Farcaster from "../../assets/images/farcaster.png";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext } from "react";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "./loading-card";
import CongratsPopup from "./congrats-popup";
import { SignInButton } from '@farcaster/auth-kit';

interface SigninPopupProps {
  onCloseModal?: () => void;
  onSignIn: () => void;
}

function SigninPopup({ onCloseModal, onSignIn }: SigninPopupProps) {
  const modalContext = useContext(ModalContext);

  const handleSuccess = async () => {
    console.log("Sign in successful");
    if (!modalContext) {
      console.log("No modal context available");
      return;
    }

    try {
      // Show loading modal
      modalContext.open("loading-modal");
      
      // Wait for 5 seconds as specified
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      modalContext.close("loading-modal");
      modalContext.open("congrats-modal");
      onSignIn();
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

      <SignInButton
        onSuccess={handleSuccess}
        onError={(error) => {
          console.error('Failed to sign in:', error);
          alert('Failed to sign in. Please try again.');
        }}
      />
    </div>
  );
}

export default SigninPopup;
