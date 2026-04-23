import type { Banner, Category, Product, Shade } from "@/types/domain";

const API_BASE =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? "http://localhost:3000/api";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  eyebrow?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  requiresShadeSelection: boolean;
  isActive: boolean;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  specialPrice?: string | null;
  stock: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  isFeatured: boolean;
  categoryId: string;
  shadeId?: string | null;
  images?: { id: string; url: string; sortOrder: number }[];
};

type ApiShadeGroup = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  shades: {
    id: string;
    name: string;
    imageUrl?: string | null;
    isActive: boolean;
    sortOrder: number;
  }[];
};

function mapCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    title: c.name,
    eyebrow: c.eyebrow ?? "",
    subtitle: c.description ?? "",
    requiresShadeSelection: c.requiresShadeSelection,
    slug: c.slug,
    imageUrl: c.imageUrl ?? undefined,
  };
}

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    categoryId: p.categoryId,
    shadeId: p.shadeId ?? undefined,
    name: p.name,
    subtitle: p.description?.split(".")[0]?.trim() ?? "",
    price: parseFloat(p.price) || 0,
    description: p.description ?? "",
    accentColor: "#C9826F",
    imageUrl: p.images?.[0]?.url,
    isFeatured: p.isFeatured ?? false,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories?status=active&pageSize=100`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
  const data = (await res.json()) as { items: ApiCategory[] };
  return data.items.filter((c) => c.isActive).map(mapCategory);
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products?status=active&pageSize=200`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const data = (await res.json()) as { items: ApiProduct[] };
  return data.items.filter((p) => p.status === "ACTIVE").map(mapProduct);
}

export async function fetchShades(categoryId: string): Promise<Shade[]> {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/shade-groups`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Shades fetch failed: ${res.status}`);
  const groups = (await res.json()) as ApiShadeGroup[];
  const shades: Shade[] = [];
  for (const group of groups) {
    if (!group.isActive) continue;
    for (const shade of group.shades) {
      if (!shade.isActive) continue;
      shades.push({
        id: shade.id,
        name: shade.name,
        groupName: group.name,
        imageUrl: shade.imageUrl ?? undefined,
      });
    }
  }
  return shades;
}

type ApiBanner = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string | null;
  buttonLabel: string;
  imageUrl?: string | null;
  linkType: string;
  linkId?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function fetchBanners(): Promise<Banner[]> {
  const res = await fetch(`${API_BASE}/banners?active=true`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Banners fetch failed: ${res.status}`);
  const data = (await res.json()) as ApiBanner[];
  return data.map((b) => ({
    id: b.id,
    eyebrow: b.eyebrow,
    title: b.title,
    body: b.body ?? undefined,
    buttonLabel: b.buttonLabel,
    imageUrl: b.imageUrl ?? undefined,
    linkType: (b.linkType as Banner["linkType"]) ?? "none",
    linkId: b.linkId ?? undefined,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
  }));
}

export async function loadCatalogFromApi(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  return { categories, products };
}

// ─── Mobile auth ──────────────────────────────────────────────────────────────

type AuthResponse = {
  token: string;
  member: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    memberType: string;
    pointBalance: number;
    referralCode: string | null;
  };
};

export async function mobileRegister(
  fullName: string,
  email: string,
  phone: string,
  password: string,
  referralCode?: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/mobile/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email: email || undefined, phone: phone || undefined, password, ...(referralCode ? { referralCode } : {}) }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สมัครสมาชิกไม่สำเร็จ");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function mobileLogin(
  identifier: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/mobile/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "อีเมล/รหัสผ่านไม่ถูกต้อง");
  }
  return res.json() as Promise<AuthResponse>;
}

// ─── Mobile checkout ──────────────────────────────────────────────────────────

type CheckoutItem = { productId: string; quantity: number };

type ApiOrder = {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: { productId: string; name: string; quantity: number; unitPrice: string }[];
};

export async function mobileCheckout(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
): Promise<ApiOrder> {
  const res = await fetch(`${API_BASE}/mobile/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สั่งซื้อไม่สำเร็จ");
  }
  return res.json() as Promise<ApiOrder>;
}

export async function mobileGetOrders(token: string): Promise<ApiOrder[]> {
  const res = await fetch(`${API_BASE}/mobile/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดคำสั่งซื้อไม่สำเร็จ");
  return res.json() as Promise<ApiOrder[]>;
}

export function mapApiOrder(o: ApiOrder): import("@/types/domain").Order {
  const items = o.items.map((i) => ({
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    price: parseFloat(i.unitPrice) || 0,
  }));
  const total = parseFloat(o.totalAmount) || 0;
  return {
    id: o.orderNumber,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    total,
    status: "Paid" as const,
    placedAt: new Date(o.createdAt).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    gatewayFee: 0,
    items,
  };
}
