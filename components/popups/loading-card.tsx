import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";

interface LoadingCardProps {
  message?: string;
}

export default function LoadingCard({ message }: LoadingCardProps) {
  return (
    <div className="p-8 flex flex-col gap-4 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_4px_4px_rgba(180,0,247,1)]">
      <div className="flex flex-col items-center justify-center">
        <Icon icon={ICON.SPINNER} fontSize={64} className="animate-spin" />
        <p className="font-medium text-sm sm:text-lg md:text-xl text-center mt-4">
          {message || "Signing you in..."}
        </p>
      </div>
    </div>
  );
}
