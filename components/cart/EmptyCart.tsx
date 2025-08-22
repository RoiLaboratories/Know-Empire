import Image from "next/image";
import Link from "next/link";
import Button from "@/ui/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ICON } from "@/utils/icon-export";
import Empty from "../../assets/images/empty-cart.svg";

function EmptyCart() {
  return (
    <div className="flex flex-col gap-10 items-center justify-between">
      <Image alt="empty cart" src={Empty} className="" />

      <p className="text-xs font-medium text-center">
        You have no{" "}
        <span className="text-primary font-bold">
          <b>items </b>
        </span>
        <b>in your cart,</b> add items to your cart to see your selected items
        <span className="text-primary font-bold"> here</span>
      </p>

      <Link href="/marketplace">
        <Button className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn w-fit">
          Go to marketplace
          <Icon icon={ICON.ARROW_CIRCLE_RIGHT} className="" />
        </Button>
      </Link>
    </div>
  );
}

export default EmptyCart;
