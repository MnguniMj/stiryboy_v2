export type Product = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  isPrime: boolean;
  isFeatured: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AddressFormValues = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  rating?: string;
  page?: string;
};
