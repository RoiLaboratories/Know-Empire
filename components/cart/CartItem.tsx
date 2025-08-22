import Image, { StaticImageData } from "next/image";
import Pc from "../../assets/images/prod2.png";
import Phone from "../../assets/images/prod1.png";
import UpdateQuantity from "../UpdateQuantity";
import { formatCurrency } from "../../utils/helpers";

interface CProps {
  img: string | StaticImageData;
  name: string;
  unitPrice: number;
  productId: string;
  quantity: number;
}

function CartItem({ item }: { item: CProps }) {
  return (
    <li className="flex gap-x-4 w-full items-start py-4 border-b border-gray-200">
      <div className="bg-[#d9d9d9] rounded-lg relative w-24 h-24 shrink-0 overflow-hidden">
        <Image
          alt={item.name}
          src={item.img}
          placeholder="blur"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col justify-between flex-1 min-h-24">
        <p className="font-semibold text-gray-700 line-clamp-2 mb-2">
          {item.name}
        </p>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-primary font-semibold">
              {formatCurrency(item.unitPrice)}
            </p>
            <UpdateQuantity quantity={item.quantity} itemId={item.productId} />
          </div>
          <p className="text-primary font-bold">
            {formatCurrency(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}

export default CartItem;
