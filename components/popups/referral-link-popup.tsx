import { Icon } from "@iconify/react";
import ReferFace from "../../assets/images/refer-face.png";
import Copy from "../../assets/images/copy.png";
import FarcasterShare from "../../assets/images/farcaster-share.png";
import Xshare from "../../assets/images/x-share.png";
import Image from "next/image";
import { ICON } from "../../utils/icon-export";
import Modal from "../../context/ModalContext";
import { copyToClipboard } from "../../utils/helpers";
import { useMiniKit, useComposeCast } from '@coinbase/onchainkit/minikit';
import  Button  from "@/ui/Button";

interface ReferralPopupProps {
  onCloseModal?: () => void;
}

function ReferralPopup({ onCloseModal }: ReferralPopupProps) {
  const { context } = useMiniKit();
  const { composeCast } = useComposeCast();
  const fid = context?.user?.fid;
  const referralLink = fid ? `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace?ref=${fid}` : 'https://knowempire.xyz';

  const handleFarcasterShare = async () => {
    try {
      await composeCast({
        text: "I'm trading physical assets securely on @knowempire! 🎯\n\nJoin me and start trading physical assets securely!",
        embeds: [referralLink]
      });

      if (onCloseModal) {
        onCloseModal();
      }
    } catch (error) {
      console.error('Failed to open cast composer:', error);
    }
  };

  return (
    <div className="py-16 flex flex-col gap-5 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_3px_3px_rgba(180,0,247,1)]">
      <button
        className="rounded-full grid place-items-center text-gray-800 absolute -top-12 right-0 btn border-2 border-gray-800 size-8.5"
        onClick={onCloseModal}
      >
        <Icon icon={ICON.CLOSE} fontSize={20} />
      </button>

      <Image src={ReferFace} alt="refer-face" width={110} height={70} />
      <p className="text-center font-medium w-8/10">
        Share this amazing mini app and get rewarded
      </p>

      <div className="flex items-center gap-x-2">
        <div className="bg-[#202020] p-[10px] font-medium text-sm truncate max-w-[200px]">
          {referralLink}
        </div>
        <Modal.Open opens="referral-link-copied-popup">
          <Image
            src={Copy}
            alt="copy"
            width={35}
            height={28}
            className="cursor-pointer"
            onClick={() => copyToClipboard(referralLink)}
          />
        </Modal.Open>
      </div>

      <div className="flex items-center gap-x-5 justify-between">
        <Button
          onClick={handleFarcasterShare}
          className="p-2 bg-[#855DCD] rounded-lg"
        >
          <Image
            src={FarcasterShare}
            alt="farcaster-share"
            width={25}
            height={25}
            className="cursor-pointer"
          />
        </Button>
        <Button
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "I'm trading knowledge assets on @knowempire! 🎯\n\nJoin me and start your journey in the knowledge economy!\n\n" +
                  referralLink
              )}`
            )
          }
          className="p-2 bg-[#1C9BEF] rounded-lg"
        >
          <Image
            src={Xshare}
            alt="x-share"
            width={25}
            height={25}
            className="cursor-pointer"
          />
        </Button>
      </div>

      <span className="w-full bg-[#828282] h-[0.5px]" />

      <div className="flex items-center justify-between w-8/10">
        <div className="space-y-2.5 flex flex-col items-center">
          <p className="text-[#5a5a5a] text-xs font-bold">Total Referals</p>
          <p className="font-semibold text-3xl text-white">0</p>
        </div>
        <div className="space-y-2.5 flex flex-col items-center">
          <p className="text-[#5a5a5a] text-xs font-bold">Total Earned</p>
          <p className="font-semibold text-3xl text-white">0</p>
        </div>
      </div>
    </div>
  );
}

export default ReferralPopup;
