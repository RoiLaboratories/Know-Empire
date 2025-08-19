import Image, { StaticImageData } from "next/image";
import Pc from "../../assets/images/prod2.png";
import Phone from "../../assets/images/prod1.png";
import UpdateQuantity from "../UpdateQuantity";
import { formatCurrency } from "../../utils/helpers";

interface CProps {
  img: StaticImageData;
  name: string;
  unitPrice: number;
  productId: number;
  quantity: number;
}

function CartItem({ item }: { item: CProps }) {
  return (
    <li className="flex gap-x-4">
      <div className="bg-[#d9d9d9] rounded-lg grid place-items-center size-24 shrink-0">
        <Image
          alt="phone"
          src={item.img}
          placeholder="blur"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col justify-between">
        <p className="font-semibold text-gray-light line-clamp-2">
          {item.name}
        </p>
        <div className="space-y-1">
          <p className="text-[#5b5b5b] text-xs md:text-sm">
            {formatCurrency(item.unitPrice)}
          </p>
          <UpdateQuantity quantity={item.quantity} itemId={item.productId} />
        </div>
      </div>
    </li>
  );
}

export default CartItem;
