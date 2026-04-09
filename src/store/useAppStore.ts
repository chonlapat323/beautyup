import { create } from "zustand";

import { mockOrders, products } from "@/mock/catalog";
import type { CartItem, Order, OrderItem, Product } from "@/types/domain";

const gatewayFee = 20;

type AppStore = {
  isAuthenticated: boolean;
  selectedShadeId?: string;
  cart: CartItem[];
  orders: Order[];
  signIn: () => void;
  signOut: () => void;
  setSelectedShade: (shadeId?: string) => void;
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => string;
};

function findProduct(productId: string): Product {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Unknown product: ${productId}`);
  }
  return product;
}

export const useAppStore = create<AppStore>((set, get) => ({
  isAuthenticated: false,
  selectedShadeId: undefined,
  cart: [],
  orders: mockOrders,
  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false }),
  setSelectedShade: (shadeId) => set({ selectedShadeId: shadeId }),
  addToCart: (productId) =>
    set((state) => {
      const existing = state.cart.find((item) => item.productId === productId);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }

      return {
        cart: [...state.cart, { productId, quantity: 1 }],
      };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((item) => item.productId !== productId)
          : state.cart.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
    })),
  clearCart: () => set({ cart: [] }),
  checkout: () => {
    const { cart, orders } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + findProduct(item.productId).price * item.quantity,
      0,
    );
    const total = subtotal + gatewayFee;
    const orderId = `BU-${24000 + orders.length + 1}`;
    const items: OrderItem[] = cart.map((item) => {
      const product = findProduct(item.productId);

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    set({
      cart: [],
      orders: [
        {
          id: orderId,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          total,
          status: "Preparing",
          placedAt: "08 Apr 2026",
          gatewayFee,
          items,
        },
        ...orders,
      ],
    });

    return orderId;
  },
}));

export function getCartSummary(cart: CartItem[]) {
  const subtotal = cart.reduce(
    (sum, item) => sum + findProduct(item.productId).price * item.quantity,
    0,
  );

  return {
    subtotal,
    gatewayFee,
    total: subtotal + gatewayFee,
  };
}
