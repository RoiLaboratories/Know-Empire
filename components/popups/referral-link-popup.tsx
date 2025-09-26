import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import ReferFace from "../../assets/images/refer-face.png";
import Copy from "../../assets/images/copy.png";
import FarcasterShare from "../../assets/images/farcaster-share.png";
import Xshare from "../../assets/images/x-share.png";
import Image from "next/image";
import { ICON } from "../../utils/icon-export";
import Modal from "../../context/ModalContext";
import { copyToClipboard } from "../../utils/helpers";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface ReferralPopupProps {
  onCloseModal?: () => void;
}

function ReferralPopup({ onCloseModal }: ReferralPopupProps) {
  const { context } = useMiniKit();
  const fid = context?.user?.fid;
  const referralLink = fid ? `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace?ref=${fid}` : 'https://knowempire.com';
  
  const handleFarcasterShare = () => {
    if (!fid) return;
    const farcasterUrl = `https://warpcast.com/~/compose?text=I'm%20trading%20knowledge%20assets%20on%20@knowempire!%20🎯%0A%0AJoin%20me%20and%20start%20trading%20physical%20assets%20securely!&embeds[]=${referralLink}`;
    window.open(farcasterUrl, '_blank');
  };
  return (
    <div className=" py-16 flex flex-col gap-5 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_3px_3px_rgba(180,0,247,1)]">
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
        <button
          onClick={handleFarcasterShare}
          className="hover:opacity-80 transition-opacity"
        >
          <Image
            src={FarcasterShare}
            alt="farcaster-share"
            width={126}
            height={46}
            className="cursor-pointer"
          />
        </button>
        <Image
          src={Xshare}
          alt="x-share"
          width={126}
          height={46}
          className="cursor-pointer"
        />
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
