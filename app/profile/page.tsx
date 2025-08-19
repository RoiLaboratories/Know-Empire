"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Wallet from "../../assets/icons/wallet.svg";
import Verified from "../../assets/icons/verified.svg";
import ReviewsCard from "../../components/cards/ReviewsCard";
import BackButton from "../../ui/BackButton";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Modal from "../../context/ModalContext";
import GenericPopup from "../../components/popups/generic-popup";
import ReferralPopup from "../../components/popups/referral-link-popup";

function Profile() {
  const { user, loading, signOut } = useFarcasterAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-lg flex flex-1 flex-col relative">
        <div className="absolute top-5 left-5 z-10">
          <BackButton className="text-white" />
        </div>
        <div className="bg-primary h-50 flex justify-between items-center p-5 text-white relative">
          <Image alt="wallet" src={Wallet} />

          <Modal>
            <Modal.Open opens="share-referral-modal">
              <Icon
                icon={ICON.SHARE}
                fontSize={30}
                className="cursor-pointer"
              />
            </Modal.Open>
            <Modal.Window name="share-referral-modal" showBg={false}>
              <ReferralPopup />
            </Modal.Window>
            <Modal.Window name="referral-link-copied-popup" showBg={false}>
              <GenericPopup
                iconStyle="text-green-600"
                icon={ICON.CHECK_CIRCLE}
                text="Your referal link has been copied"
              />
            </Modal.Window>
          </Modal>

          <div className="absolute rounded-full size-24 border-3 border-white bottom-0 translate-y-1/2">
            <Image
              alt={user.displayName || "User profile"}
              src={user.pfp}
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/*user details */}
        <div className="px-5 py-12 bg-white space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-2xl">{user.displayName}</p>

            <div className="text-sm text-[#5a5a5a] font-medium space-y-1">
              <p>@{user.username}</p>
              <p>{user.fid} FID</p>
            </div>
          </div>

          <div className="text-xs text-[#5a5a5a] space-y-1">
            <p className="font-bold">BADGES</p>
            <div className="flex items-center gap-x-3">
              <button className="flex items-center justify-center rounded-full py-1 px-4 border border-gray-light font-medium btn">
                Both
              </button>
              <button className="flex items-center justify-center gap-x-1 rounded-full py-1 px-3 bg-green-500 font-medium btn text-white border border-green-500">
                <Image alt="wallet" src={Verified} />
                Verified
              </button>
            </div>
          </div>

          <p className="font-bold flex items-center text-xs text-[#5a5a5a] gap-1">
            Summary Stats
            <span className="bg-gray-200 h-[1px] flex-1" />
          </p>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon icon={ICON.PACKAGE} fontSize={26} className="text-orange" />
              <p className="text-[10px] font-medium">24</p>
              <p className="text-[7px] text-nowrap">items sold</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon icon={ICON.BUY} fontSize={26} className="text-green-500" />
              <p className="text-[10px] font-medium">12</p>
              <p className="text-[7px] text-nowrap">items Bought</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon
                icon={ICON.STAR_ROUNDED}
                fontSize={26}
                className="text-yellow-500"
              />
              <p className="text-[10px] font-medium">4.8</p>
              <p className="text-[7px]">Rating</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon
                icon={ICON.PEOPLE}
                fontSize={26}
                className="text-purple-500"
              />
              <p className="text-[10px] font-medium">8</p>
              <p className="text-[7px]">Referrals</p>
            </div>
          </div>

          <p className="font-bold flex items-center text-xs text-[#5a5a5a] gap-1 mb-5">
            Reviews (3)
            <span className="bg-gray-200 h-[1px] flex-1" />
          </p>

          {/*reviews */}
          <ul className="text-[#5a5a5a] space-y-5">
            <ReviewsCard />
            <li className="space-y-2">
              <div className="flex justify-between">
                <span className="flex gap-x-1 items-center">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Icon
                      icon={ICON.STAR}
                      // fontSize={26}
                      key={i}
                    />
                  ))}
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Icon icon={ICON.STAR_EMPTY} key={i} />
                  ))}
                </span>
                <p className="text-xs">12-06-2025</p>
              </div>
              <p className="font-semibold text-sm flex items-center">
                Mike Rodriguez&nbsp;&nbsp;
                <span className="text-[10px] font-light">@mikecollector</span>
              </p>
              <span className="flex items-center justify-center rounded-full px-1 py-[1px] border-[1.5px] w-fit border-gray-light font-medium text-[10px]">
                NFT Sticker Pack
              </span>
              {/*review */}
              <div className="flex items-start gap-5 text-[10px]">
                <p className="text-gray-500">
                  Good transaction overall. Item condition was great. Packaging
                  could be better
                </p>
                <p className="text-nowrap flex items-center gap-x-1 text-green-500">
                  <span>
                    <Icon
                      icon={ICON.ARROW_CHECKED}
                      className="text-green-500"
                    />
                  </span>
                  Verified Purchase
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Profile;
