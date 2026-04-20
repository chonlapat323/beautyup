import { create } from "zustand";

import { loadCatalogFromApi } from "@/services/api";
import { mockOrders } from "@/mock/catalog";
import type { CartItem, Category, Order, OrderItem, Product } from "@/types/domain";

const gatewayFee = 20;

type AppStore = {
  isAuthenticated: boolean;
  selectedShadeId?: string;
  cart: CartItem[];
  orders: Order[];
  categories: Category[];
  products: Product[];
  isLoadingCatalog: boolean;
  catalogError: boolean;
  signIn: () => void;
  signOut: () => void;
  setSelectedShade: (shadeId?: string) => void;
  loadCatalog: () => Promise<void>;
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => string;
};

export const useAppStore = create<AppStore>((set, get) => ({
  isAuthenticated: false,
  selectedShadeId: undefined,
  cart: [],
  orders: mockOrders,
  categories: [],
  products: [],
  isLoadingCatalog: false,
  catalogError: false,

  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false }),
  setSelectedShade: (shadeId) => set({ selectedShadeId: shadeId }),

  loadCatalog: async () => {
    set({ isLoadingCatalog: true, catalogError: false });
    try {
      const { categories, products } = await loadCatalogFromApi();
      set({ categories, products, catalogError: false });
    } catch {
      set({ catalogError: true });
    } finally {
      set({ isLoadingCatalog: false });
    }
  },

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
      return { cart: [...state.cart, { productId, quantity: 1 }] };
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
    const { cart, orders, products } = get();
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    const total = subtotal + gatewayFee;
    const orderId = `BU-${24000 + orders.length + 1}`;
    const items: OrderItem[] = cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? item.productId,
        quantity: item.quantity,
        price: product?.price ?? 0,
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
          placedAt: new Date().toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
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
  const { products } = useAppStore.getState();
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  return { subtotal, gatewayFee, total: subtotal + gatewayFee };
}
