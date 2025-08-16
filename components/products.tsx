"use client";
import { useEffect, useState } from "react";
import ProductCard from "./cards/ProductCard";
import Session from "./Session";
import Phone from "../assets/images/prod1.png"; // Fallback image
import Modal from "../context/ModalContext";

interface Product {
  id: string;
  title: string;
  price: number;
  photos: string[];
  country: string;
  seller: {
    farcaster_username: string;
    display_name: string;
  };
}

function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/list');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  return (
    <Modal>
      <Session title="Curated for you" link="See more">
        <ul className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                name: product.title,
                price: product.price.toString(),
                img: product.photos[0] || Phone,
                location: product.country,
                seller: product.seller.farcaster_username,
                photos: product.photos
              }}
            />
          ))}
        </ul>
      </Session>
    </Modal>
  );
}

export default Products;
