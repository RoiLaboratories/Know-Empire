import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { sleep } from "../../utils/helpers";
import { useState } from "react";
import { ProductWithSeller } from "../../types/product";

interface ProductSummaryPopupProps {
  onNext: () => void;
  product: ProductWithSeller;
}

function ProductSummaryPopup({ onNext, product }: ProductSummaryPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleNext = async () => {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    onNext();
  };

  return (
    <div className="space-y-2">
      <p className="font-semibold text-gray text-sm">Product Summary</p>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-4">
        <div className="space-y-4">
          <div className="flex gap-x-3">
            <div className="w-20 h-20 relative">
              <Image
                alt={product.title}
                src={product.photos[0]}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-gray-light text-sm line-clamp-2">
                {product.title}
              </p>
              <p className="text-sm text-primary font-bold">
                ${product.price}
              </p>
              <p className="text-xs text-gray-500">
                From {product.country}
              </p>
            </div>
          </div>

          <div className="border-t border-b border-[#989898] py-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Seller</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[13px]">@{product.seller.username}</span>
                <div className="flex items-center gap-2">
                  <span className="flex gap-x-1 text-xs items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon
                        icon={ICON.STAR}
                        className={i < Math.floor(product.seller.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                        key={i}
                        fontSize={14}
                      />
                    ))}
                  </span>
                  <p className="text-xs font-medium text-gray-500">
                    ({product.seller.rating?.toFixed(1) || "No"} • {product.seller.review_count || 0})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Description</p>
              <p className="text-gray-600 text-xs">{product.description}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Delivery Details</p>
              <p className="text-gray-600 text-xs">{product.delivery}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold text-gray text-sm">
            Product Reviews ({product.seller.review_count || 0})
          </p>
          <div className="border border-[#989898] text-[#989898] bg-[#f3f3f3] h-36 rounded-[10px] flex items-center text-xs justify-center">
            <p>
              {product.seller.review_count 
                ? `${product.seller.review_count} reviews with average rating of ${product.seller.rating?.toFixed(1)}`
                : "No review for this product yet"
              }
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="xs"
            className="rounded-[10px] font-medium mt-2"
            onClick={handleNext}
            disabled={isLoading}
          >
            {!isLoading ? (
              "Continue to Delivery info"
            ) : (
              <>
                <Icon
                  icon={ICON.SPINNER}
                  fontSize={15}
                  className="animate-spin"
                />
                Loading...
              </>
            )}
          </Button>
          {/* </Modal.Open> */}
        </div>
      </div>
    </div>
  );
}

export default ProductSummaryPopup;
