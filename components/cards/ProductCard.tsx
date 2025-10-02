"use client";
import Image from "next/image";
import Map from "../../assets/icons/map.svg";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import PurchasePopup from "../popups/purchase-popup";
import Modal from "../../context/ModalContext";
import { useMiniKit, useComposeCast } from '@coinbase/onchainkit/minikit';
import { useCart } from "../../providers/cart";
import toast from 'react-hot-toast';
import { ReactElement, useState } from 'react';
import { ProductWithSeller } from "../../types/product";

function ProductCard({ product }: { product: ProductWithSeller }): ReactElement {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState<ProductWithSeller | null>(null);
  const { photos, title: name, price: unitPrice, id: productId, country: location } = product;
  const { context } = useMiniKit() as { context: { user?: { fid: number } } };
  const { composeCast } = useComposeCast();
  const isOwnProduct = context?.user?.fid?.toString() === product.seller.farcaster_id;

  const handleShare = async () => {
    try {
      const productDetailsUrl = `https://knowempire.xyz/marketplace/${productId}/details`;
      
      await composeCast({
        text: `🛍️ Check out this listing on @knowempire!\n\n${name}\n💰 $${unitPrice}\n📍 ${location}\n\nSecure trading of physical assets on Farcaster! View details ⬇️`,
        embeds: [productDetailsUrl]
      });
    } catch (error) {
      console.error('Failed to open cast composer:', error);
      toast.error('Failed to share listing');
    }
  };
  
  const handleAddToCart = () => {
    const numericPrice = parseFloat(unitPrice);
    const newItem = {
      productId,
      name,
      quantity: 1,
      unitPrice: numericPrice,
      totalPrice: numericPrice,
      img: photos[0]
    };

    addToCart(newItem);
  };

  const fetchUpdatedProduct = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching product with ID:', productId);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched product data:', data);
      
      if (!data) {
        throw new Error('No data received from the server');
      }

      setUpdatedProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch latest product data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <li className="flex flex-col p-1.5 gap-1 rounded-md border border-gray-medium cursor-pointer transition-all hover:shadow-md" onClick={() => window.location.href = `/marketplace/${productId}/details`}>
      <div className="h-28 bg-gray-medium aspect-square rounded-md">
        <Image
          alt={name}
          src={photos[0]}
          width={112}
          height={112}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between gap-3">
        <p className="font-semibold text-sm md:text-base">{name}</p>

        <p className="flex items-center justify-between gap-x-1.5 truncate">
          <span className="font-semibold text-primary text-xs">
            ${unitPrice}
          </span>
          <span className="text-[10px] text-yellow-300 font-semibold flex items-center gap-1">
            @{product.seller.username}
            {product.seller.is_verified && (
              <span title="Verified trader (6+ successful trades)">
                <Icon
                  icon={ICON.VERIFIED}
                  className="text-green-500"
                  fontSize={12}
                />
              </span>
            )}
          </span>
          <span className="text-gray-lighter text-[8px] flex items-center gap-x-1">
            <Image alt="location" src={Map} />
            {location}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-x-2 w-full">
          {isOwnProduct ? (
            <Button
              variant="primary_gradient"
              size="xs"
              className="!p-2 col-span-2 hover:opacity-80 transition-opacity"
              onClick={handleShare}
            >
              <span>Share Listing</span>
            </Button>
          ) : (
            <>
              <Modal.Open opens={`purchase-product-popup-${productId}`}>
                <Button
                  variant="primary_gradient"
                  size="xs"
                  className="text-gray-medium"
                  onClick={fetchUpdatedProduct}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Icon icon={ICON.SPINNER} className="animate-spin" fontSize={16} />
                  ) : (
                    <>
                      <Icon icon={ICON.BUY2} fontSize={16} />
                      Buy now
                    </>
                  )}
                </Button>
              </Modal.Open>
              <Button
                variant="primary_outline"
                size="xs"
                className="font-semibold"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <Icon icon={ICON.ADD_OUTLINE} fontSize={16} />
                Cart it
              </Button>
            </>
          )}
        </div>
      </div>

      {/*all purchase modals */}
      <Modal.Window
        name={`purchase-product-popup-${productId}`}
        // allowOutsideClick
        showBg={false}
      >
        <PurchasePopup product={updatedProduct || product} />
      </Modal.Window>
    </li>
  );
}

export default ProductCard;
