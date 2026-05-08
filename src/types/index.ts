export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category?: string;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

export type OrderStatus = 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: OrderItem[];
  total: number;
  paymentScreenshot?: string;
  status: OrderStatus;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
}
