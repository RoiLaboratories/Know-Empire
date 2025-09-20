"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Product as BaseProduct } from "../../types/product";
import Modal, { useModal } from "../../context/ModalContext";
import EditProductModal from "./EditProductModal";
import Image from "next/image";
import Button  from "../../ui/Button";

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
    try {
      console.log('[handleEditProduct] Opening modal for product:', product?.id);
      if (product) {
        // Validate product data before setting
        if (!product.id || !product.title) {
          throw new Error('Invalid product data received');
        }
        console.log('[handleEditProduct] Product data validated, setting editingProduct');
      }
      setEditingProduct(product);
      console.log('[handleEditProduct] Successfully set editing product state');
    } catch (err) {
      console.error('[handleEditProduct] Error setting edit mode:', err);
      setError(err instanceof Error ? err.message : 'Failed to enter edit mode');
    }
  };

  const handleSaveEdit = async (productId: string, updates: Partial<SellerProduct>) => {
    try {
      setError(null); // Clear any previous errors
      console.log('[handleSaveEdit] Starting product update:', { productId, updates });
      
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Validate updates object
      if (Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
      }

      console.log('[handleSaveEdit] Sending PATCH request to API');
      const response = await fetch(`/api/seller/products?productId=${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      // Log the raw response for debugging
      console.log('[handleSaveEdit] API Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('[handleSaveEdit] API Response data:', data);
      } catch (parseError) {
        console.error('[handleSaveEdit] Error parsing response:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      if (!response.ok) {
        console.error('[handleSaveEdit] Server error:', data);
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      // Only refresh and clear edit mode if update was successful
      await fetchSellerProducts();
      setEditingProduct(null);
    } catch (err) {
      console.error('Client error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
      // Don't clear edit mode on error so user can try again
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

    return (
      <Modal>
        <div>
          <SellerProductsList 
            products={products}
            loading={loading}
            error={error}
            editingProduct={editingProduct}
            onEditProduct={handleEditProduct}
            onSaveEdit={handleSaveEdit}
            router={router}
          />
          <ModalWrapper 
            editingProduct={editingProduct}
            onClose={handleEditProduct}
            onSave={handleSaveEdit}
          />
        </div>
      </Modal>
    );
}

// Client-side modal wrapper component
function ModalWrapper({
  editingProduct,
  onClose,
  onSave,
}: {
  editingProduct: SellerProduct | null;
  onClose: (product: SellerProduct | null) => void;
  onSave: (productId: string, updates: Partial<SellerProduct>) => Promise<void>;
}) {
  const { open, close } = useModal();
  const [modalError, setModalError] = useState<string | null>(null);

  // Open the modal when editingProduct changes
  useEffect(() => {
    try {
      console.log('[ModalWrapper] EditingProduct changed:', editingProduct?.id);
      if (editingProduct) {
        console.log('[ModalWrapper] Attempting to open modal');
        open('edit-product');
        console.log('[ModalWrapper] Modal opened successfully');
      } else {
        console.log('[ModalWrapper] Closing modal');
        close('edit-product');
      }
    } catch (err) {
      console.error('[ModalWrapper] Error managing modal:', err);
      setModalError(err instanceof Error ? err.message : 'Failed to manage modal state');
    }
  }, [editingProduct, open, close]);

  // Always render the Modal.Window with valid content
  return (
    <Modal.Window name="edit-product" showBg={true}>
      <div className="modal-content">
        {editingProduct ? (
          <EditProductModal
            product={editingProduct}
            onSave={onSave}
            onClose={() => {
              console.log('[ModalWrapper] Closing modal and clearing editingProduct');
              onClose(null);
              close('edit-product');
            }}
          />
        ) : (
          // Render an empty div when no product is being edited
          <div style={{ display: 'none' }} />
        )}
      </div>
    </Modal.Window>
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
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('[SellerProductsList] Edit button clicked for product:', product.id);
                    onEditProduct(product);
                  }}
                  variant="primary_outline"
                  size="sm"
                >
                  Edit Product
                </Button>
                <Button
                  onClick={() => onSaveEdit(product.id, { 
                    status: product.status === 'active' ? 'inactive' : 'active' 
                  })}
                  variant="secondary"
                  size="sm"
                >
                  {product.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal is handled in parent component */}
    </div>
  );
}
