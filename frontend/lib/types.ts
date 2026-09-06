export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role:
    | 'ADMIN'
    | 'CUSTOMER';
};


export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?:
    string | null;
  description?:
    string | null;
};


export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand?:
    string | null;
  description: string;
  price: number;
  compareAtPrice?:
    number | null;
  stock: number;
  imageUrl: string;
  images?: string[];
  featured: boolean;
  bestseller: boolean;
  rating: number;
  reviewCount: number;
  category: Category;
};


export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};


export type WishlistItem = {
  id: string;
  product: Product;
  createdAt?: string;
};


export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
};


export type Order = {
  id: string;
  orderNumber: string;
  transactionId?:
    string | null;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postcode?:
    string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod:
    | 'COD'
    | 'SSLCOMMERZ';
  paymentStatus:
    | 'UNPAID'
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'CANCELLED';
  status:
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
  items: OrderItem[];
  user?: User;
  createdAt: string;
  updatedAt: string;
};


export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
};
