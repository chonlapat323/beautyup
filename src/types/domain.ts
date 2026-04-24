export type CategoryId = string;

export type Category = {
  id: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  requiresShadeSelection: boolean;
  slug: string;
  imageUrl?: string;
};

export type Shade = {
  id: string;
  name: string;
  groupName: string;
  imageUrl?: string;
};

export type Product = {
  id: string;
  categoryId: string;
  shadeId?: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  description: string;
  accentColor: string;
  imageUrl?: string;
  images?: string[];
  isFeatured?: boolean;
  tag?: string;
};

export type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  tag?: string;
  buttonLabel: string;
  imageUrl?: string;
  linkType: "none" | "product" | "category";
  linkId?: string;
  sortOrder: number;
  isActive: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  itemCount: number;
  total: number;
  status: "Pending" | "Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  placedAt: string;
  gatewayFee: number;
  items: OrderItem[];
  shippingName?: string;
  shippingPhone?: string;
  shippingAddr?: string;
};
