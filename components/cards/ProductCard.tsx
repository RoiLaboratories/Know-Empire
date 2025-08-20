"use client";
import Image, { StaticImageData } from "next/image";
import Map from "../../assets/icons/map.svg";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import PurchasePopup from "../popups/purchase-popup";
import Modal from "../../context/ModalContext";
import { useCart } from "../../providers/cart";
import toast from 'react-hot-toast';
import { ReactElement } from 'react';

interface PProps {
  img: string | StaticImageData;
  location: string;
  name: string;
  seller: string;
  unitPrice: number;
  productId: string;
  photos?: string[]; // Array of image URLs from Supabase
}

function ProductCard({ product }: { product: PProps }): ReactElement {
  const { addToCart } = useCart();
  const { img, name, unitPrice, productId, location, seller } = product;
  const handleAddToCart = () => {
    const newItem = {
      productId,
      name,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice * 1,
      img,
    };

    addToCart(newItem);
    toast.success('Item added to cart');
  };

  return (
    <li className="flex flex-col p-1.5 gap-1 rounded-md border border-gray-medium">
      <div className="h-28 bg-gray-medium aspect-square rounded-md">
        <Image
          alt={product.name}
          src={product.photos?.[0] || img}
          width={112}
          height={112}
          placeholder={typeof product.img !== "string" ? "blur" : "empty"}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between gap-3">
        <p className="font-semibold text-sm md:text-base">{name}</p>

        <p className="flex items-center justify-between gap-x-1.5 truncate">
          <span className="font-semibold text-primary text-xs">
            ${unitPrice}
          </span>
          <span className="text-[10px] text-yellow-300">{seller}</span>
          <span className="text-gray-lighter text-[8px] flex items-center gap-x-1">
            <Image alt="phone" src={Map} />
            {location}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-x-2 w-full">
          <Modal.Open opens="purchase-product-popup">
            <Button
              variant="primary_gradient"
              size="xs"
              className="text-gray-medium"
            >
              <Icon icon={ICON.BUY2} fontSize={16} />
              Buy now
            </Button>
          </Modal.Open>
          <Button
            variant="primary_outline"
            size="xs"
            className="font-semibold"
            onClick={handleAddToCart}
          >
            <Icon icon={ICON.ADD_OUTLINE} fontSize={16} />
            Cart it
          </Button>
        </div>
      </div>

      {/*all purchase modals */}
      <Modal.Window
        name="purchase-product-popup"
        // allowOutsideClick
        showBg={false}
      >
        <PurchasePopup />
      </Modal.Window>
    </li>
  );
}

export default ProductCard;
