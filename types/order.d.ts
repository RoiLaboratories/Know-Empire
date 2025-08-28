interface Seller {
  farcaster_username: string;
  display_name: string;
  avatar_url: string;
}

interface Product {
  title: string;
  photos: string[];
  description: string;
}

interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  price: number;
  created_at: string;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  escrow_id: string;
  product: Product;
  seller: Seller;
}
