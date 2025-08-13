import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import Phone from "../../assets/images/prod1.png";
import Button from "../../ui/Button";

interface IPProps {
  onCloseModal?: () => void;
}

function PurchasePopup({ onCloseModal }: IPProps) {
  return (
    <div className="rounded-t-2xl px-5 pt-5 pb-10 w-[300px] md:w-[402px] bg-white space-y-10">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray text-sm">Secure Purchase</p>
        <Icon
          icon={ICON.CANCEL}
          fontSize={24}
          onClick={onCloseModal}
          className="cursor-pointer"
        />
      </div>

      {/*main content  */}

      <div>
        {/*PRODUCT SUMMARY ------1 */}
        <div className="space-y-2">
          <p className="font-semibold text-gray text-sm">Product Summary</p>
          <div className="rounded-[10px] border border-[#989898] p-5 space-y-4">
            <div className="flex gap-x-2 ">
              <div className="w-9 h-10">
                <Image
                  alt="phone"
                  src={Phone}
                  placeholder="blur"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold text-gray-light text-sm line-clamp-2">
                Iphone 15 Pro max Black | 1TB
              </p>
            </div>
            <div className="flex items-center gap-x-10 text-gray pb-4 border-b border-[#989898]">
              <p className="flex flex-col gap-1">
                <span className="text-xs">Seller</span>
                <span className="font-medium text-[13px]">Ratings</span>
              </p>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[13px]">@Techseller</span>
                <div className="flex justify-between">
                  <span className="flex gap-x-1 text-xs md:text-sm items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon
                        icon={ICON.STAR}
                        // fontSize={26}
                        key={i}
                      />
                    ))}
                  </span>
                  <p className="text-xs line-clamp-1 font-medium text-[#808080]">
                    (4.8 •24 reviews)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray text-sm">
                Product Reviews (0)
              </p>
              <div className="border border-[#989898] text-[#989898] bg-[#f3f3f3] h-36 rounded-[10px] flex items-center text-xs justify-center">
                <p>No review for this product yet</p>
              </div>

              <Button
                variant="secondary"
                size="xs"
                className="rounded-[10px] font-medium mt-2"
              >
                Continue to Delivery info
              </Button>
            </div>
          </div>
        </div>
        {/*------------------------- */}

        {/*DELIVERY INFORMATION------2 */}
        {/* <div className="space-y-2">
          <p className="font-semibold text-gray text-sm">
            Delivery Information
          </p>
          <div className="rounded-[10px] border border-[#989898] p-5 space-y-4">
            <p className="font-medium text-gray text-[13px]">
              Shipping details
            </p>

            <div className="flex gap-x-1">
              <Icon
                icon={ICON.LOCATION}
                fontSize={16}
                className="text-[#808080]"
              />
              <div className=" text-[11px]">
                <p className="font-medium">Shipping from</p>
                <p className=" text-[#808080]">United States</p>
              </div>
            </div>
            <div className="flex gap-x-1">
              <Icon
                icon={ICON.HISTORY}
                fontSize={16}
                className="text-[#808080]"
              />
              <div className=" text-[11px]">
                <p className="font-medium">Expected delivery</p>
                <p className=" text-[#808080]">5-10 business days</p>
              </div>
            </div>
            <div className="flex gap-x-1">
              <Icon icon={ICON.FILE} fontSize={16} className="text-[#808080]" />
              <div className=" text-[11px]">
                <p className="font-medium">5-10 business days</p>
                <p className=" text-[#808080]">
                  Sellers are responsible for delivery
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray text-sm">Delivery notes*</p>
            <div className="border border-[#989898] text-[#989898] bg-[#f3f3f3] h-36 rounded-[10px] flex items-center text-xs justify-center text-center">
              <p>Add any special delivery instructions or address details </p>
            </div>

            <div className="flex gap-x-6 mt-2">
              <Button
                variant="back"
                size="xs"
                className="rounded-[10px] font-medium mt-2"
              >
                Back
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className="rounded-[10px] font-medium mt-2"
              >
                Continue to Delivery info
              </Button>
            </div>
          </div>
        </div> */}
        {/*------------------------- */}

        {/*ESCROW PROTECTION------3*/}
        {/* <div className="space-y-2">
          <p className="font-semibold text-gray text-sm">Escrow Protection</p>
          <div className="rounded-[10px] bg-[#f0fdf4] border border-[#bbf7d0] p-5 space-y-3">
            <p className="flex items-center gap-x-1 font-medium text-gray text-[13px]">
              <Icon
                icon={ICON.VERIFIED}
                className="text-green-600"
                fontSize={15}
              />
              Your payment is protected
            </p>
            <p className="text-green-600 italic font-medium text-[10px]">
              Your payment will be held in escrow until you confirm you’ve
              received the item.
            </p>

            <div className="flex gap-x-1.5">
              <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
                1
              </span>
              <div className=" text-[11px]">
                <p className="font-medium">Pay into Escrow</p>
                <p className=" text-[#808080]">Your payment is secured</p>
              </div>
            </div>
            <div className="flex gap-x-1.5">
              <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
                2
              </span>
              <div className=" text-[11px]">
                <p className="font-medium">Seller ships item</p>
                <p className=" text-[#808080]">Tracking info provided</p>
              </div>
            </div>
            <div className="flex gap-x-1.5">
              <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
                3
              </span>
              <div className=" text-[11px]">
                <p className="font-medium">Confirm delivery</p>
                <p className=" text-[#808080]">You release the funds</p>
              </div>
            </div>
            <div className="flex gap-x-1.5">
              <span className="font-medium rounded-full bg-green-600 text-[10px] text-white size-[17px] grid place-items-center">
                4
              </span>
              <div className=" text-[11px]">
                <p className="font-medium">Leave a review</p>
                <p className=" text-[#808080]">Rate your experience</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] flex items-center gap-1">
            <Icon
              icon={ICON.CONFIRM}
              className="text-[#2d69ec]"
              fontSize={12}
            />
            <p className="font-medium">Buyer Protection</p>
            <Icon icon={ICON.INFO} className="text-[#989898]" />
          </div>

          <div className="flex gap-x-6 mt-2">
            <Button
              variant="back"
              size="xs"
              className="rounded-[10px] font-medium"
            >
              Back
            </Button>
            <Button
              variant="secondary"
              size="xs"
              className="rounded-[10px] font-medium"
            >
              Continue to Delivery info
            </Button>
          </div>
        </div> */}
        {/*------------------------- */}

        {/*SECURE PAYMENT ------4 */}
        {/*change just color of btn under delivery notes for SUCCESS*/}
        {/* <div className="space-y-2">
          <p className="font-semibold text-gray text-sm">Secure Payment</p>
          <div className="rounded-[10px] border border-[#989898] p-5 space-y-3">
            <div className="border-b border-[#989898] pb-5 space-y-3">
              <p className="font-medium text-gray text-sm">Order summary</p>

              <div className="flex gap-x-2 ">
                <div className="w-9 h-10">
                  <Image
                    alt="phone"
                    src={Phone}
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-gray-light text-sm line-clamp-2">
                  Iphone 15 Pro max Black | 1TB
                </p>
              </div>
            </div>

            <p className="flex items-center justify-between">
              <span className="font-medium text-gray text-sm">
                Total ( Including fees)
              </span>
              <span className="font-semibold text-[#16a34a] text-sm">$999</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray text-sm">Delivery notes*</p>
            <div className="border border-blue-500 text-blue-600 bg-blue-100 h-36 rounded-[10px] items-center text-xs justify-center flex flex-col gap-2.5 p-5">
              <Icon icon={ICON.WALLET} fontSize={30} />
              <p className="text-center text-[10px]">
                Connect Your Wallet to proceed with secure payment
              </p>
              <Button
                variant="secondary"
                size="xs"
                className="rounded-[10px] font-medium"
              >
                Continue to Escrow
              </Button>
            </div>

            <Button
              variant="back"
              size="xs"
              className="rounded-[10px] font-medium mt-2"
            >
              Back
            </Button>
          </div>
        </div> */}
        {/*------------------------- */}

        {/*SECURE PAYMENT ----- confirmed && shipped */}
        {/*change just the icon and btn when confirm */}
        {/* <div className="flex flex-col gap-2">
          <p className="font-semibold text-gray text-sm">Secure Payment</p>
          <div className="rounded-[10px] border bg-blue-50 border-[#989898] p-5 flex flex-col items-center justify-center gap-1">
            <Icon icon={ICON.HISTORY} fontSize={39} className="text-blue-600" />
            <p className="text-gray font-medium text-[15px]">
              Payment Confirmed
            </p>
            <p className="text-xs text-[#989898] text-center">
              Waiting for seller to mark as shipped...
            </p>
            <span className="bg-[#f4f2f8] px-4 py-1 rounded-full">
              <p className="text-[#925f21] text-[10px] font-medium">Order #3</p>
            </span>
          </div>
          <div className="rounded-[10px] border border-[#989898] p-5 space-y-3 mt-2">
            <p className="font-medium text-gray text-sm">Order summary</p>

            <div className="border-b border-[#989898] pb-3 flex justify-between items-end gap-x-2">
              <div className="flex gap-x-2 ">
                <div className="w-9 h-10">
                  <Image
                    alt="phone"
                    src={Phone}
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-gray-light text-sm line-clamp-2">
                  Iphone 15 Pro max Black | 1TB
                </p>
              </div>
              <p className="text-[#414141] font-semibold text-[15px]">$999</p>
            </div>

            <p className="text-[#989898] text-[13px]">
              Transaction: <span className="italic">0x80b8c4ab46a9a...</span>
            </p>
          </div>

          <div className="mt-2">
            <Button
              variant="tertiary"
              size="xs"
              className="rounded-[10px] font-medium"
            >
              Request Cancellation
            </Button>
            <p className="text-[8px] text-[#989898]">
              You can cancel this order if the seller doesn’t ship within the
              expected timeframe
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default PurchasePopup;
