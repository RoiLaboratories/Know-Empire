"use client";

import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface IBProps {
  onCloseModal?: () => void;
  onMount?: () => void;
  onUnmount?: () => void;
}

function BuyerCongratsPopup({ onCloseModal, onMount, onUnmount }: IBProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    onMount?.();
    return () => onUnmount?.();
  }, [onMount, onUnmount]);

  const handleNavigation = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    if (onCloseModal) {
      onCloseModal();
    }
    
    // Use a short timeout to ensure modal state is cleaned up
    setTimeout(() => {
      router.replace("/marketplace");
    }, 100);
  }, [isNavigating, onCloseModal, router]);

  return (
    <div className="p-8 flex flex-col gap-4 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_4px_4px_rgba(180,0,247,1)]">
      <h2 className="sr-only">Buyer Account Created Successfully</h2>
      <Icon icon={ICON.CELEBRATE} fontSize={74} />

      <p className="font-medium text-sm sm:text-lg md:text-xl text-center">
        Congratulations, you can now start shopping on KnowEmpire
      </p>

      <button
        onClick={handleNavigation}
        disabled={isNavigating}
        className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn"
      >
        Start Shopping
        <Icon icon={ICON.ARROW_RIGHT} className="text-lg" />
      </button>
    </div>
  );
}

export default BuyerCongratsPopup;
