import Image from "next/image";
import Farcaster from "../../assets/images/farcaster.png";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";

interface ISProps {
  onCloseModal?: () => void;
}

function SigninPopup({ onCloseModal }: ISProps) {
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

      <Button className="font-medium w-24 drop-shadow-[0_4px_4px_rgb(65,65,65)]">
        Sign in
      </Button>
    </div>
  );
}

export default SigninPopup;
