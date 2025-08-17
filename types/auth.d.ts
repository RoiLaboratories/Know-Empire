declare interface SellerInput {
  handle: string;
  category: string;
  email: string;
  location: string;
  description: string;
}

declare interface ListingInput {
  country: string;
  description: string;
  title: string;
  price: number;
  delivery: string;
  photos: [];
  category: string;
}
