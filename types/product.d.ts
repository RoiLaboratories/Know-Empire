export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: string;
  photos: string[];
  country: string;
  delivery: string;
  category: string;
  created_at: string;
}

export interface ProductWithSeller extends Product {
  seller: {
    username: string;
    rating?: number;
    review_count?: number;
    wallet_address?: string;
  };
}
