import { create } from "zustand";
import { persist } from "zustand/middleware";

import { storage } from "./storage";

import { fetchBanners, fetchMobileConfig, loadCatalogFromApi, mapApiOrder, mobileGetOrders, mobileGetProfile } from "@/services/api";
import type { PointTier } from "@/services/api";
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
  pointTiers: PointTier[];
  isLoadingCatalog: boolean;
  isLoadingOrders: boolean;
  catalogError: boolean;
  signIn: (token: string, member: MemberInfo) => void;
  signOut: () => void;
  updateMemberPoints: (delta: number) => void;
  refreshProfile: () => Promise<void>;
  setSelectedShade: (shadeId?: string) => void;
  loadCatalog: () => Promise<void>;
  loadOrders: () => Promise<void>;
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
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
      pointTiers: [{ minSpend: 3000, points: 300 }, { minSpend: 5000, points: 500 }, { minSpend: 10000, points: 1000 }],
      favoriteIds: [],
      isLoadingCatalog: false,
      isLoadingOrders: false,
      catalogError: false,

      signIn: (token, member) => set({ isAuthenticated: true, token, member }),
      signOut: () => set({ isAuthenticated: false, token: null, member: null, orders: [] }),
      updateMemberPoints: (delta) =>
        set((state) => ({
          member: state.member ? { ...state.member, pointBalance: state.member.pointBalance + delta } : null,
        })),
      refreshProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const fresh = await mobileGetProfile(token);
          set((state) => ({ member: state.member ? { ...state.member, ...fresh } : null }));
        } catch {
          // keep existing member data on error
        }
      },
      setSelectedShade: (shadeId) => set({ selectedShadeId: shadeId }),

      loadCatalog: async () => {
        set({ isLoadingCatalog: true, catalogError: false });
        try {
          const defaultConfig = { gatewayFee: 20, pointTiers: [{ minSpend: 3000, points: 300 }, { minSpend: 5000, points: 500 }, { minSpend: 10000, points: 1000 }] };
          const [{ categories, products }, banners, config] = await Promise.all([
            loadCatalogFromApi(),
            fetchBanners().catch(() => [] as Banner[]),
            fetchMobileConfig().catch(() => defaultConfig),
          ]);
          set({ categories, products, banners, gatewayFee: config.gatewayFee, pointTiers: config.pointTiers ?? defaultConfig.pointTiers, catalogError: false });
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

      toggleFavorite: (productId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(productId)
            ? state.favoriteIds.filter((id) => id !== productId)
            : [...state.favoriteIds, productId],
        })),

      addToCart: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find((item) => item.productId === productId);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
          }
          return { cart: [...state.cart, { productId, quantity }] };
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
    }),
    {
      name: "beautyup-store",
      storage,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        member: state.member,
        favoriteIds: state.favoriteIds,
        cart: state.cart,
      }),
    },
  ),
);

export function getCartSummary(cart: CartItem[]) {
  const { products, gatewayFee, pointTiers } = useAppStore.getState();
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const sorted = [...pointTiers].sort((a, b) => b.minSpend - a.minSpend);
  const pointsPreview = sorted.find((t) => subtotal >= t.minSpend)?.points ?? 0;
  return { subtotal, gatewayFee, total: subtotal + gatewayFee, pointsPreview };
}
