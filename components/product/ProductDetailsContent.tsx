"use client";
import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { ICON } from '../../utils/icon-export';
import { ProductWithSeller } from '../../types/product';
import Map from '../../assets/icons/map.svg';
import Button from '../../ui/Button';
import { useCart } from '../../providers/cart';
import { useMiniKit, useComposeCast } from '@coinbase/onchainkit/minikit';
import toast from 'react-hot-toast';
import Modal from '../../context/ModalContext';
import PurchasePopup from '../../components/popups/purchase-popup';

export default function ProductDetailsContent({ initialProduct: product }: { initialProduct: ProductWithSeller }) {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState<ProductWithSeller | null>(null);
  const { photos, title: name, price: unitPrice, country: location, description, id: productId } = product;
  const { addToCart } = useCart();
  const { context } = useMiniKit() as { context: { user?: { fid: number } } };
  const { composeCast } = useComposeCast();
  const isOwnProduct = context?.user?.fid?.toString() === product.seller.farcaster_id;

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
    toast.success('Added to cart');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-medium">
            <Image
              src={photos[selectedImage]}
              alt={`${name} - Image ${selectedImage + 1}`}
              fill
              className="object-contain"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                className={`aspect-square relative rounded border ${
                  selectedImage === index ? 'border-primary' : 'border-gray-medium'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={photo}
                  alt={`${name} - Thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold text-primary">${unitPrice}</span>
              <span className="flex items-center gap-2 text-gray-lighter">
                <Image src={Map} alt="Location" width={16} height={16} />
                {location}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Seller</h2>
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 flex items-center gap-1">
                @{product.seller.username}
                {product.seller.is_verified && (
                  <span title="Verified trader (6+ successful trades)">
                    <Icon
                      icon={ICON.VERIFIED}
                      className="text-green-500"
                      fontSize={16}
                    />
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-darker whitespace-pre-wrap">{description}</p>
          </div>

          <div className="flex gap-4 mt-8">
            {isOwnProduct ? (
              <Button
                variant="primary_gradient"
                size="lg"
                className="flex-1 hover:opacity-80 transition-opacity"
                onClick={handleShare}
              >
                <Icon icon={ICON.SHARE} fontSize={20} />
                <span className="ml-2">Share Listing</span>
              </Button>
            ) : (
              <>
                <Modal.Open opens={`purchase-product-popup-${productId}`}>
                  <Button
                    variant="primary_gradient"
                    size="lg"
                    className="flex-1"
                    onClick={fetchUpdatedProduct}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Icon icon={ICON.SPINNER} className="animate-spin" fontSize={20} />
                    ) : (
                      <>
                        <Icon icon={ICON.BUY2} fontSize={20} />
                        <span className="ml-2">Buy Now</span>
                      </>
                    )}
                  </Button>
                </Modal.Open>
                <Button
                  variant="primary_outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <Icon icon={ICON.ADD_OUTLINE} fontSize={20} />
                  <span className="ml-2">Add to Cart</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal.Window
        name={`purchase-product-popup-${productId}`}
        showBg={false}
      >
        <PurchasePopup product={updatedProduct || product} />
      </Modal.Window>
      </div>
  );
}