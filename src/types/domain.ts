export type CategoryId = "color-bleach" | "shampoo-mask" | "leave-in";

export type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
  requiresShadeSelection: boolean;
  imageUrl?: string;
};

export type Shade = {
  id: string;
  name: string;
  tone: string;
  swatch: string;
  imageUrl?: string;
};

export type Product = {
  id: string;
  categoryId: CategoryId;
  shadeId?: string;
  name: string;
  subtitle: string;
  price: number;
  description: string;
  accentColor: string;
  imageUrl?: string;
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
  status: "Paid" | "Preparing" | "Delivered";
  placedAt: string;
  gatewayFee: number;
  items: OrderItem[];
};
