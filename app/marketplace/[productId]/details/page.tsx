import { Metadata } from 'next';
import ProductDetailsContent from '../../../../components/product/ProductDetailsContent';

interface PageProps {
  params: {
    productId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getProduct(productId: string) {
  const response = await fetch(`/api/products/${productId}`, {
    next: { revalidate: 60 } // Cache for 1 minute
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return response.json();
}

export default async function ProductDetailsPage(props: PageProps) {
  const { params } = props;
  const product = await getProduct(params.productId);
  
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Product not found</p>
      </div>
    );
  }

  return <ProductDetailsContent initialProduct={product} />;
}