import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useRouter } from "next/navigation";

interface CongratsPopupProps {
  onEnterMarketplace: () => void;
  children?: React.ReactNode;
}

function CongratsPopup({ onEnterMarketplace, children }: CongratsPopupProps) {
  return (
    <div className="p-8 flex flex-col gap-4 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_4px_4px_rgba(180,0,247,1)]">
      <Icon icon={ICON.CELEBRATE} fontSize={74} />

      <p className="font-medium text-sm sm:text-lg md:text-xl text-center">
        Congratulations, you are successfully signed in to KnowEmpire
      </p>

      <button
        onClick={onEnterMarketplace}
        className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn"
      >
        Enter marketplace
        <Icon icon={ICON.ARROW_CIRCLE_RIGHT} />
      </button>
    </div>
  );
}

export default CongratsPopup;
