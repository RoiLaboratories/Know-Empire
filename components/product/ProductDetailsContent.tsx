"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { ICON } from '../../utils/icon-export';
import { ProductWithSeller } from '../../types/product';
import Map from '../../assets/icons/map.svg';

export default function ProductDetailsContent({ initialProduct }: { initialProduct: ProductWithSeller }) {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const { photos, title: name, price: unitPrice, country: location, description, seller } = initialProduct;

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
              <span className="text-yellow-300">@{seller.username}</span>
              {seller.is_verified && (
                <span title="Verified trader (6+ successful trades)">
                  <Icon
                    icon={ICON.VERIFIED}
                    className="text-green-500"
                    fontSize={16}
                  />
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-darker whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}