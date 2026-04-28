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
  tag?: string | null;
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
  const basePrice = parseFloat(p.price) || 0;
  const specialPrice = p.specialPrice ? parseFloat(p.specialPrice) : null;
  const images = (p.images ?? []).map((img) => img.url);
  return {
    id: p.id,
    categoryId: p.categoryId,
    shadeId: p.shadeId ?? undefined,
    name: p.name,
    subtitle: p.description?.split(".")[0]?.trim() ?? "",
    price: specialPrice ?? basePrice,
    originalPrice: specialPrice ? basePrice : undefined,
    description: p.description ?? "",
    accentColor: "#2f7a4f",
    imageUrl: images[0],
    images,
    isFeatured: p.isFeatured ?? false,
    tag: p.tag ?? undefined,
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
  tag?: string | null;
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
    tag: b.tag ?? undefined,
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

// ─── Mobile config ────────────────────────────────────────────────────────────

export async function fetchMobileConfig(): Promise<{ gatewayFee: number }> {
  const res = await fetch(`${API_BASE}/mobile/config`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Config fetch failed");
  return res.json() as Promise<{ gatewayFee: number }>;
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
  salonCode?: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/mobile/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      email: email || undefined,
      phone: phone || undefined,
      password,
      ...(referralCode ? { referralCode } : {}),
      ...(salonCode ? { salonCode } : {}),
    }),
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

// ─── Mobile addresses ─────────────────────────────────────────────────────────

export type MemberAddress = {
  id: string;
  label?: string | null;
  recipient: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  isDefault: boolean;
};

type AddressPayload = {
  label?: string;
  recipient: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export async function mobileGetAddresses(token: string): Promise<MemberAddress[]> {
  const res = await fetch(`${API_BASE}/mobile/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดที่อยู่ไม่สำเร็จ");
  return res.json() as Promise<MemberAddress[]>;
}

export async function mobileAddAddress(token: string, payload: AddressPayload): Promise<MemberAddress> {
  const res = await fetch(`${API_BASE}/mobile/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "เพิ่มที่อยู่ไม่สำเร็จ");
  }
  return res.json() as Promise<MemberAddress>;
}

export async function mobileUpdateAddress(
  token: string,
  id: string,
  payload: Partial<AddressPayload>,
): Promise<MemberAddress> {
  const res = await fetch(`${API_BASE}/mobile/addresses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "แก้ไขที่อยู่ไม่สำเร็จ");
  }
  return res.json() as Promise<MemberAddress>;
}

export async function mobileDeleteAddress(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/mobile/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "ลบที่อยู่ไม่สำเร็จ");
  }
}

export async function mobileSetDefaultAddress(token: string, id: string): Promise<MemberAddress> {
  const res = await fetch(`${API_BASE}/mobile/addresses/${id}/default`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("ตั้งที่อยู่หลักไม่สำเร็จ");
  return res.json() as Promise<MemberAddress>;
}

// ─── Mobile checkout ──────────────────────────────────────────────────────────

type CheckoutItem = { productId: string; quantity: number };

type ApiOrder = {
  id: string;
  orderNumber: string;
  subtotalAmount: string;
  shippingAmount: string;
  gatewayFee: string;
  totalAmount: string;
  pointEarned: number;
  status: string;
  createdAt: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddr?: string;
  items: { productId: string; name: string; quantity: number; unitPrice: string }[];
};

export async function mobileCheckout(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
  omiseToken: string,
): Promise<ApiOrder> {
  const res = await fetch(`${API_BASE}/mobile/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, omiseToken }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สั่งซื้อไม่สำเร็จ");
  }
  return res.json() as Promise<ApiOrder>;
}

export async function mobileGetOrderDocuments(
  token: string,
  orderId: string,
): Promise<{ taxInvoiceUrl: string | null; receiptUrl: string | null }> {
  const res = await fetch(`${API_BASE}/mobile/orders/${orderId}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("ไม่พบเอกสารสำหรับคำสั่งซื้อนี้");
  return res.json() as Promise<{ taxInvoiceUrl: string | null; receiptUrl: string | null }>;
}

export async function mobileInitiatePromptPay(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
): Promise<{ chargeId: string; svgContent: string; expiresAt: string }> {
  const res = await fetch(`${API_BASE}/mobile/promptpay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สร้าง QR ไม่สำเร็จ");
  }
  return res.json() as Promise<{ chargeId: string; svgContent: string; expiresAt: string }>;
}

export async function mobileCheckPromptPay(
  token: string,
  chargeId: string,
): Promise<{ status: string; order?: ApiOrder }> {
  const res = await fetch(`${API_BASE}/mobile/promptpay/${chargeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("ตรวจสอบสถานะไม่สำเร็จ");
  return res.json() as Promise<{ status: string; order?: ApiOrder }>;
}

export async function mobileGetOrders(token: string): Promise<ApiOrder[]> {
  const res = await fetch(`${API_BASE}/mobile/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดคำสั่งซื้อไม่สำเร็จ");
  return res.json() as Promise<ApiOrder[]>;
}

const STATUS_MAP: Record<string, import("@/types/domain").Order["status"]> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

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
    status: STATUS_MAP[o.status] ?? "Paid",
    placedAt: new Date(o.createdAt).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    gatewayFee: parseFloat(o.gatewayFee) || 0,
    pointEarned: o.pointEarned ?? 0,
    items,
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    shippingAddr: o.shippingAddr,
  };
}
