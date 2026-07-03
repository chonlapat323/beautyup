import { create } from "zustand";
import { persist } from "zustand/middleware";

import { storage } from "./storage";

import { fetchBanners, fetchBrands, fetchBundles, fetchCarriers, fetchCollections, fetchMobileConfig, loadCatalogFromApi, mapApiOrder, mobileGetFavorites, mobileGetOrders, mobileGetProfile, mobileToggleFavorite } from "@/services/api";
import type { CarrierConfig, MobileConfig, PointTier } from "@/services/api";
import type { Banner, Brand, Bundle, CartItem, Category, Collection, Order, Product } from "@/types/domain";

type MemberInfo = { id: string; fullName: string; email: string | null; phone: string | null; memberType: string; pointBalance: number; creditBalance: number; referralCode: string | null; bankName: string | null; bankAccountNumber: string | null; bankAccountName: string | null; profileImageUrl?: string | null; profileThumbnailUrl?: string | null; bannerThumbnailUrl?: string | null; facebook?: string | null; tiktok?: string | null; shopee?: string | null; lazada?: string | null };

type AppStore = {
  isAuthenticated: boolean;
  token: string | null;
  member: MemberInfo | null;
  cart: CartItem[];
  orders: Order[];
  categories: Category[];
  products: Product[];
  banners: Banner[];
  brands: Brand[];
  bundles: Bundle[];
  collections: Collection[];
  carriers: CarrierConfig[];
  gatewayFee: number;
  pointTiers: PointTier[];
  freeShippingThreshold: number;
  defaultShippingFee: number;
  social: { youtubeUrl?: string; tiktokUrl?: string; lineOaUrl?: string };
  isLoadingCatalog: boolean;
  isLoadingOrders: boolean;
  catalogError: boolean;
  signIn: (token: string, member: MemberInfo) => void;
  signOut: () => void;
  updateMemberPoints: (delta: number) => void;
  refreshProfile: () => Promise<void>;
  loadCatalog: () => Promise<void>;
  loadOrders: () => Promise<void>;
  favoriteIds: string[];
  toggleFavorite: (productId: string) => Promise<void>;
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
      cart: [],
      orders: [],
      categories: [],
      products: [],
      banners: [],
      brands: [],
      bundles: [],
      collections: [],
      carriers: [],
      gatewayFee: 20,
      pointTiers: [{ minSpend: 3000, points: 300 }, { minSpend: 5000, points: 500 }, { minSpend: 10000, points: 1000 }],
      freeShippingThreshold: 1000,
      defaultShippingFee: 50,
      social: {},
      favoriteIds: [],
      isLoadingCatalog: false,
      isLoadingOrders: false,
      catalogError: false,

      signIn: (token, member) => set({ isAuthenticated: true, token, member }),
      signOut: () => set({ isAuthenticated: false, token: null, member: null, orders: [], cart: [] }),
      updateMemberPoints: (delta) =>
        set((state) => ({
          member: state.member ? { ...state.member, pointBalance: state.member.pointBalance + delta } : null,
        })),
      refreshProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const [fresh, favoriteIds] = await Promise.all([
            mobileGetProfile(token),
            mobileGetFavorites(token).catch(() => get().favoriteIds),
          ]);
          set((state) => ({ member: state.member ? { ...state.member, ...fresh } : null, favoriteIds }));
        } catch {
          // keep existing member data on error
        }
      },
      loadCatalog: async () => {
        set({ isLoadingCatalog: true, catalogError: false });
        try {
          const defaultConfig: MobileConfig = { gatewayFee: 20, pointTiers: [{ minSpend: 3000, points: 300 }, { minSpend: 5000, points: 500 }, { minSpend: 10000, points: 1000 }], freeShippingThreshold: 1000, defaultShippingFee: 50, social: {} };
          const [{ categories, products }, banners, brands, bundles, collections, config, carriers] = await Promise.all([
            loadCatalogFromApi(),
            fetchBanners().catch(() => [] as Banner[]),
            fetchBrands().catch(() => [] as Brand[]),
            fetchBundles().catch(() => [] as Bundle[]),
            fetchCollections().catch(() => [] as Collection[]),
            fetchMobileConfig().catch(() => defaultConfig),
            fetchCarriers().catch(() => [] as CarrierConfig[]),
          ]);
          set({ categories, products, banners, brands, bundles, collections, carriers, gatewayFee: config.gatewayFee, pointTiers: config.pointTiers ?? defaultConfig.pointTiers, freeShippingThreshold: config.freeShippingThreshold ?? 1000, defaultShippingFee: config.defaultShippingFee ?? 50, social: config.social ?? {}, catalogError: false });
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

      toggleFavorite: async (productId) => {
        const { token } = get();
        const wasIncluded = get().favoriteIds.includes(productId);
        set((state) => ({
          favoriteIds: wasIncluded
            ? state.favoriteIds.filter((id) => id !== productId)
            : [...state.favoriteIds, productId],
        }));
        if (!token) return;
        try {
          await mobileToggleFavorite(token, productId);
        } catch {
          set((state) => ({
            favoriteIds: wasIncluded
              ? [...state.favoriteIds, productId]
              : state.favoriteIds.filter((id) => id !== productId),
          }));
        }
      },

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
  const { products, gatewayFee, pointTiers, freeShippingThreshold, defaultShippingFee } = useAppStore.getState();
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
  const sorted = [...pointTiers].sort((a, b) => b.minSpend - a.minSpend);
  const pointsPreview = sorted.find((t) => subtotal >= t.minSpend)?.points ?? 0;
  return { subtotal, shippingFee, gatewayFee, total: subtotal + shippingFee, pointsPreview, freeShippingThreshold };
}
