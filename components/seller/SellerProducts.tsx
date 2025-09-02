"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Product as BaseProduct } from "../../types/product";
import Modal from "../../context/ModalContext";
import EditProductModal from "./EditProductModal";
import Image from "next/image";

interface SellerProduct extends Omit<BaseProduct, 'price'> {
  price: number;
  status: 'active' | 'inactive';
}

export default function SellerProducts() {
  const router = useRouter();
  const { context } = useMiniKit();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);

  const fetchSellerProducts = async () => {
    const fid = context?.user?.fid;
    if (!fid) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching products for seller:', fid);
      const response = await fetch(`/api/seller/products?sellerId=${fid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seller products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: SellerProduct | null) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = async (productId: string, updates: Partial<SellerProduct>) => {
    try {
      console.log('Updating product:', { productId, updates });
      const response = await fetch(`/api/seller/products?productId=${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.error || 'Failed to update product');
      }

      // Refresh the products list
      await fetchSellerProducts();
      setEditingProduct(null);
    } catch (err) {
      console.error('Client error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  // Wrap the component with Modal context
  return (
    <Modal>
      <SellerProductsList 
        products={products}
        loading={loading}
        error={error}
        editingProduct={editingProduct}
        onEditProduct={handleEditProduct}
        onSaveEdit={handleSaveEdit}
        router={router}
      />
    </Modal>
  );
}

function SellerProductsList({
  products,
  loading,
  error,
  editingProduct,
  onEditProduct,
  onSaveEdit,
  router
}: {
  products: SellerProduct[];
  loading: boolean;
  error: string | null;
  editingProduct: SellerProduct | null;
  onEditProduct: (product: SellerProduct | null) => void;
  onSaveEdit: (productId: string, updates: Partial<SellerProduct>) => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {

  if (loading) {
    return <div>Loading your products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!loading && products.length === 0) {
    router.push('/seller/empty-products');
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-lg shadow-md p-4 flex items-start space-x-4"
          >
            <div className="flex-shrink-0 w-24 h-24 relative">
              <Image
                src={product.photos[0] || '/placeholder.png'}
                alt={product.title}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <div className="flex-grow space-y-2">
              <h3 className="text-lg font-medium">{product.title}</h3>
              <p className="text-gray-600">Price: ${product.price}</p>
              <p className={`text-sm ${
                product.status === 'active' ? 'text-green-500' : 'text-red-500'
              }`}>
                Status: {product.status}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditProduct(product)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => onSaveEdit(product.id, { 
                    status: product.status === 'active' ? 'inactive' : 'active' 
                  })}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  {product.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={onSaveEdit}
          onClose={() => onEditProduct(null)}
        />
      )}
    </div>
  );
}
