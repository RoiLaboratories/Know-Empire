import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useEffect } from "react";

interface Props {
  onCloseModal?: () => void;
  onMount?: () => void;
  onUnmount?: () => void;
}

export default function LoadingSellerCard({ onCloseModal, onMount, onUnmount }: Props) {
  useEffect(() => {
    onMount?.();
    return () => onUnmount?.();
  }, [onMount, onUnmount]);
  return (
    <div className="p-8 flex flex-col gap-4 bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl drop-shadow-[0_4px_4px_rgba(180,0,247,1)]">
        <Icon icon={ICON.SPINNER} fontSize={64} className="animate-spin" />
        <p className="font-medium text-sm sm:text-lg md:text-xl text-center">
          Creating account...
        </p>
    </div>
  );
}
