"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./cards/ProductCard";
import Session from "./Session";
import Phone from "../assets/images/prod1.png"; // Fallback image
import Modal from "../context/ModalContext";
import { StaticImageData } from "next/image";

// const products = [
//   {
//     name: "Iphone 15 Pro max Black | 1TB",
//     unitPrice: 999,
//     img: Phone,
//     location: "United States",
//     seller: "TechSeller",
//     productId: 1,
//   },
//   {
//     name: "Asus Geoforce- RX 4080",
//     unitPrice: 1299,
//     img: Pc,
//     location: "United States",
//     seller: "TechSeller",
//     productId: 2,
//   },
// ];

import { Product as BaseProduct, ProductWithSeller } from '../types/product';

interface APIProduct extends Omit<BaseProduct, 'price'> {
  price: number;
  seller: {
    farcaster_username: string;
    display_name: string;
    rating?: number;
    review_count?: number;
    wallet_address: string;
  };
}

function useProducts() {
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const category = searchParams?.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = category 
          ? `/api/products/list?category=${encodeURIComponent(category)}`
          : "/api/products/list";
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
}

function Products() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log('Raw products from API:', products);

  const searchParams = useSearchParams();
  const category = searchParams?.get('category');

  return (
    <Modal>
      <Session title={category ? `${category} Products` : "Curated for you"} link="See more">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-500 mb-2">No products listed {category ? `in ${category}` : 'here'} yet</p>
            <p className="text-sm text-gray-400">Check back later for new items</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {products.map((apiProduct) => {
            console.log('Processing product:', apiProduct);
            const product: ProductWithSeller = {
              ...apiProduct,
              price: apiProduct.price.toString(),
              seller: {
                username: apiProduct.seller.farcaster_username,
                rating: apiProduct.seller.rating,
                review_count: apiProduct.seller.review_count,
                wallet_address: apiProduct.seller.wallet_address
              }
            };
            return (
              <ProductCard
                key={product.id}
                product={product}
              />
            );
          })}
          </ul>
        )}
      </Session>
    </Modal>
  );
}

export default Products;
