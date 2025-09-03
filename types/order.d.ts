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
  created_at: string;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  total_amount: number;
  escrow_id: string;
  product: {
    id: string;
    title: string;
    description: string;
    photos: string[];
    price: number;
    seller: {
      farcaster_username: string;
    };
  };
}
