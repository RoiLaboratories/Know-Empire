"use client";
import Image, { StaticImageData } from "next/image";
import Map from "../../assets/icons/map.svg";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import PurchasePopup from "../popups/purchase-popup";
import Modal from "../../context/ModalContext";

interface PProps {
  img: StaticImageData;
  location: string;
  name: string;
  seller: string;
  price: string;
}

function ProductCard({ product }: { product: PProps }) {
  return (
    <li className="flex flex-col p-1.5 gap-1 rounded-md border border-gray-medium">
      <div className="h-28 bg-gray-medium aspect-square rounded-md">
        <Image
          alt="phone"
          src={product.img}
          placeholder="blur"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between gap-3">
        <p className="font-semibold text-sm md:text-base">{product.name}</p>

        <p className="flex items-center justify-between gap-x-1.5 truncate">
          <span className="font-semibold text-primary text-xs">
            ${product.price}
          </span>
          <span className="text-[10px] text-yellow-300">{product.seller}</span>
          <span className="text-gray-lighter text-[8px] flex items-center gap-x-1">
            <Image alt="phone" src={Map} />
            {product.location}
          </span>
        </p>

        <Modal.Open opens="purchase-product-popup">
          <Button
            variant="primary_gradient"
            size="xs"
            className="text-gray-medium w-8/10 mx-auto"
          >
            <Icon icon={ICON.BUY2} fontSize={16} />
            Buy now
          </Button>
        </Modal.Open>
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
