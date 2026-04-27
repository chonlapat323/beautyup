import { create } from "zustand";

import { fetchBanners, fetchMobileConfig, loadCatalogFromApi, mapApiOrder, mobileGetOrders } from "@/services/api";
import type { Banner, CartItem, Category, Order, Product } from "@/types/domain";

type MemberInfo = { id: string; fullName: string; email: string | null; phone: string | null; memberType: string; pointBalance: number; referralCode: string | null };

type AppStore = {
  isAuthenticated: boolean;
  token: string | null;
  member: MemberInfo | null;
  selectedShadeId?: string;
  cart: CartItem[];
  orders: Order[];
  categories: Category[];
  products: Product[];
  banners: Banner[];
  gatewayFee: number;
  isLoadingCatalog: boolean;
  isLoadingOrders: boolean;
  catalogError: boolean;
  signIn: (token: string, member: MemberInfo) => void;
  signOut: () => void;
  setSelectedShade: (shadeId?: string) => void;
  loadCatalog: () => Promise<void>;
  loadOrders: () => Promise<void>;
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useAppStore = create<AppStore>((set, get) => ({
  isAuthenticated: false,
  token: null,
  member: null,
  selectedShadeId: undefined,
  cart: [],
  orders: [],
  categories: [],
  products: [],
  banners: [],
  gatewayFee: 20,
  isLoadingCatalog: false,
  isLoadingOrders: false,
  catalogError: false,

  signIn: (token, member) => set({ isAuthenticated: true, token, member }),
  signOut: () => set({ isAuthenticated: false, token: null, member: null, orders: [] }),
  setSelectedShade: (shadeId) => set({ selectedShadeId: shadeId }),

  loadCatalog: async () => {
    set({ isLoadingCatalog: true, catalogError: false });
    try {
      const [{ categories, products }, banners, config] = await Promise.all([
        loadCatalogFromApi(),
        fetchBanners().catch(() => [] as Banner[]),
        fetchMobileConfig().catch(() => ({ gatewayFee: 20 })),
      ]);
      set({ categories, products, banners, gatewayFee: config.gatewayFee, catalogError: false });
    } catch {
      set({ catalogError: true });
    } finally {
      set({ isLoadingCatalog: false });
    }
  },

  loadOrders: async () => {
    const { token } = get();
    if (!token) return;
    set({ isLoadingOrders: true });
    try {
      const apiOrders = await mobileGetOrders(token);
      set({ orders: apiOrders.map(mapApiOrder) });
    } catch {
      // keep existing orders on error
    } finally {
      set({ isLoadingOrders: false });
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
}));

export function getCartSummary(cart: CartItem[]) {
  const { products, gatewayFee } = useAppStore.getState();
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  return { subtotal, gatewayFee, total: subtotal + gatewayFee };
}
