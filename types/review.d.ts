export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    farcaster_username: string;
    display_name: string;
  };
  product?: {
    title: string;
  };
}
