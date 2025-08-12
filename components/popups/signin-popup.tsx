import Image from "next/image";
import Farcaster from "../../assets/images/farcaster.png";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useContext } from "react";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "./loading-card";
import CongratsPopup from "./congrats-popup";

interface SigninPopupProps {
  onCloseModal?: () => void;
  onSignIn: () => void;
}

function SigninPopup({ onCloseModal, onSignIn }: SigninPopupProps) {
  const modalContext = useContext(ModalContext);

  const handleSignIn = () => {
    console.log("Sign in button clicked");
    if (!modalContext) {
      console.log("No modal context available");
      return;
    }

    // Open loading modal immediately
    modalContext.open("loading-modal");
    
    // After 5 seconds, show congrats
    setTimeout(() => {
      modalContext.close(); // Close signin modal
      modalContext.close(); // Close loading modal
      modalContext.open("congrats-modal");
    }, 5000);
  };

  return (
    <div className="p-8 flex flex-col gap-4 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_3px_3px_rgba(180,0,247,1)]">
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
      <button
        className="rounded-full text-gray p-1 text-xs bg-white absolute top-5 left-5 cursor-pointer"
        onClick={onCloseModal}
      >
        <Icon icon={ICON.CLOSE} />
      </button>

      <Button 
        className="font-medium w-24 drop-shadow-[0_4px_4px_rgb(65,65,65)]" 
        onClick={handleSignIn}
      >
        Sign in
      </Button>
    </div>
  );
}

export default SigninPopup;
