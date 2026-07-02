import type { Banner, Brand, Bundle, Category, Collection, Product, Shade } from "@/types/domain";

const API_BASE =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? "http://localhost:3000/api";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  eyebrow?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
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
  sellableStock: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  isFeatured: boolean;
  tag?: string | null;
  categoryId: string;
  shadeId?: string | null;
  brand?: { id: string; name: string } | null;
  collection?: { id: string; name: string } | null;
  images?: { id: string; url: string; thumbnailUrl?: string | null; sortOrder: number }[];
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
    thumbnailUrl?: string | null;
    isActive: boolean;
    sortOrder: number;
  }[];
};

const CATEGORY_NAME_TRANSLATIONS: Record<string, string> = {
  "Color & Bleach": "สีผมและบลีช",
  "Shampoo & Mask": "แชมพูและมาสก์",
  "Leave In": "ลีฟอิน",
};

const CATEGORY_SUBTITLE_TRANSLATIONS: Record<string, string> = {
  "Select shade first": "เลือกเฉดสีก่อนช้อป",
  "Care essentials": "ดูแลเส้นผมขั้นพื้นฐาน",
  "Finish & shine": "จัดแต่งและเพิ่มความเงางาม",
};

const BANNER_BUTTON_TRANSLATIONS: Record<string, string> = {
  "Shop now": "ช้อปเลย",
  "View all": "ดูทั้งหมด",
};

function translateCategoryName(value: string): string {
  return CATEGORY_NAME_TRANSLATIONS[value] ?? value;
}

function translateCategorySubtitle(value?: string | null): string {
  if (!value) return "";
  return CATEGORY_SUBTITLE_TRANSLATIONS[value] ?? value;
}

function translateBannerButton(value: string): string {
  return BANNER_BUTTON_TRANSLATIONS[value] ?? value;
}

function mapCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    title: translateCategoryName(c.name),
    eyebrow: c.eyebrow ?? "",
    subtitle: translateCategorySubtitle(c.description),
    requiresShadeSelection: c.requiresShadeSelection,
    slug: c.slug,
    imageUrl: c.imageUrl ?? undefined,
    thumbnailUrl: c.thumbnailUrl ?? undefined,
  };
}

function mapProduct(p: ApiProduct): Product {
  const basePrice = parseFloat(p.price) || 0;
  const specialPrice = p.specialPrice ? parseFloat(p.specialPrice) : null;
  const sortedImages = p.images ?? [];
  const images = sortedImages.map((img) => img.url);
  return {
    id: p.id,
    categoryId: p.categoryId,
    shadeId: p.shadeId ?? undefined,
    brandId: p.brand?.id ?? undefined,
    brandName: p.brand?.name ?? undefined,
    collectionId: p.collection?.id ?? undefined,
    collectionName: p.collection?.name ?? undefined,
    name: p.name,
    subtitle: p.description?.split(".")[0]?.trim() ?? "",
    price: specialPrice ?? basePrice,
    originalPrice: specialPrice ? basePrice : undefined,
    description: p.description ?? "",
    accentColor: "#2f7a4f",
    imageUrl: images[0],
    thumbnailUrl: sortedImages[0]?.thumbnailUrl ?? undefined,
    images,
    isFeatured: p.isFeatured ?? false,
    tag: p.tag ?? undefined,
    sellableStock: p.sellableStock,
    totalStock: p.stock,
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
        thumbnailUrl: shade.thumbnailUrl ?? undefined,
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
  thumbnailUrl?: string | null;
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
    buttonLabel: translateBannerButton(b.buttonLabel),
    imageUrl: b.imageUrl ?? undefined,
    thumbnailUrl: b.thumbnailUrl ?? undefined,
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

// ─── Brands ───────────────────────────────────────────────────────────────────

type ApiBrandItem = {
  id: string;
  name: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
};

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE}/brands`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Brands fetch failed: ${res.status}`);
  const data = (await res.json()) as ApiBrandItem[];
  return data
    .filter((b) => b.isActive)
    .map((b) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl ?? null, thumbnailUrl: b.thumbnailUrl ?? null }));
}

// ─── Collections ──────────────────────────────────────────────────────────────

type ApiCollection = {
  id: string;
  name: string;
  isActive: boolean;
};

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_BASE}/collections`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Collections fetch failed: ${res.status}`);
  const data = (await res.json()) as ApiCollection[];
  return data.filter((c) => c.isActive).map((c) => ({ id: c.id, name: c.name }));
}

// ─── Bundles ──────────────────────────────────────────────────────────────────

type ApiBundle = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      sku: string;
      images: { url: string; thumbnailUrl?: string | null }[];
    };
  }[];
};

function mapBundle(b: ApiBundle): Bundle {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    imageUrl: b.imageUrl ?? undefined,
    thumbnailUrl: b.thumbnailUrl ?? undefined,
    items: b.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.images?.[0]?.url ?? undefined,
      },
    })),
  };
}

export async function fetchBundles(): Promise<Bundle[]> {
  const res = await fetch(`${API_BASE}/bundles?active=true`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Bundles fetch failed: ${res.status}`);
  const data = (await res.json()) as ApiBundle[];
  return data.map(mapBundle);
}

// ─── Mobile config ────────────────────────────────────────────────────────────

export type PointTier = { minSpend: number; points: number };

export type MobileConfig = {
  gatewayFee: number;
  pointTiers: PointTier[];
  freeShippingThreshold: number;
  defaultShippingFee: number;
  social?: { youtubeUrl?: string; tiktokUrl?: string; lineOaUrl?: string };
};

export async function fetchMobileConfig(): Promise<MobileConfig> {
  const res = await fetch(`${API_BASE}/mobile/config`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Config fetch failed");
  return res.json() as Promise<MobileConfig>;
}

export type CarrierConfig = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  logoUrl: string | null;
  trackingUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export async function fetchCarriers(): Promise<CarrierConfig[]> {
  try {
    const res = await fetch(`${API_BASE}/carriers?activeOnly=true`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
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
    creditBalance: number;
    referralCode: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    profileImageUrl?: string | null;
    bannerImageUrl?: string | null;
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
  storeName?: string | null;
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
  storeName?: string;
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
  trackingNumber?: string | null;
  items: { productId: string; name: string; quantity: number; unitPrice: string }[];
};

export async function mobileCheckout(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
  omiseToken?: string,
  creditAmount?: number,
  note?: string,
): Promise<ApiOrder> {
  const res = await fetch(`${API_BASE}/mobile/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, omiseToken, creditAmount, note }),
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
  creditAmount?: number,
): Promise<{ chargeId: string; svgContent: string; expiresAt: string }> {
  const res = await fetch(`${API_BASE}/mobile/promptpay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, creditAmount }),
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

export async function mobileInitiateKBankCardPayment(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
  creditAmount?: number,
): Promise<{ redirectURL: string; partnerPaymentID: string }> {
  const res = await fetch(`${API_BASE}/mobile/kbank-card`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, creditAmount }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สร้างคำสั่งชำระเงินบัตรเครดิต KBank ไม่สำเร็จ");
  }
  return res.json() as Promise<{ redirectURL: string; partnerPaymentID: string }>;
}

export async function mobileInitiateKBankQRPayment(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
  creditAmount?: number,
): Promise<{ qrImage: string; partnerPaymentID: string }> {
  const res = await fetch(`${API_BASE}/mobile/kbank-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, creditAmount }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สร้าง KBank QR ไม่สำเร็จ");
  }
  return res.json() as Promise<{ qrImage: string; partnerPaymentID: string }>;
}

export async function mobileCheckKBankPayment(
  token: string,
  partnerPaymentID: string,
): Promise<{ status: string; order?: ApiOrder }> {
  const res = await fetch(`${API_BASE}/mobile/kbank-pay/${encodeURIComponent(partnerPaymentID)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "ตรวจสอบสถานะ KBank ไม่สำเร็จ");
  }
  return res.json() as Promise<{ status: string; order?: ApiOrder }>;
}

export async function mobileInitiateKBankPayment(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
  creditAmount?: number,
): Promise<{ deepLink: string; partnerPaymentID: string }> {
  const res = await fetch(`${API_BASE}/mobile/kbank-pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, creditAmount }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สร้างคำสั่งชำระเงิน KBank ไม่สำเร็จ");
  }
  return res.json() as Promise<{ deepLink: string; partnerPaymentID: string }>;
}

export async function mobileInitiateTrueMoney(
  token: string,
  items: CheckoutItem[],
  shippingName: string,
  shippingPhone: string,
  shippingAddr: string,
  phoneNumber: string,
  creditAmount?: number,
): Promise<{ chargeId: string; authorizeUri: string }> {
  const res = await fetch(`${API_BASE}/mobile/truemoney`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, shippingName, shippingPhone, shippingAddr, phoneNumber, creditAmount }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "สร้างคำสั่งชำระเงินทรูมันนี่ไม่สำเร็จ");
  }
  return res.json() as Promise<{ chargeId: string; authorizeUri: string }>;
}

export async function mobileGetFavorites(token: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/mobile/me/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดรายการถูกใจไม่สำเร็จ");
  return res.json() as Promise<string[]>;
}

export async function mobileToggleFavorite(token: string, productId: string): Promise<{ favorited: boolean }> {
  const res = await fetch(`${API_BASE}/mobile/me/favorites/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("อัปเดตรายการถูกใจไม่สำเร็จ");
  return res.json() as Promise<{ favorited: boolean }>;
}

export async function mobileGetCommissionSummary(token: string): Promise<{
  pendingAmount: number;
  pendingCount: number;
  paidAmount: number;
  paidCount: number;
}> {
  const res = await fetch(`${API_BASE}/mobile/me/commissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดข้อมูล commission ไม่สำเร็จ");
  return res.json() as Promise<{ pendingAmount: number; pendingCount: number; paidAmount: number; paidCount: number }>;
}

export type CreditTransaction = {
  id: string;
  type: "EARN" | "USE" | "WITHDRAW";
  amount: string;
  note: string | null;
  refId: string | null;
  createdAt: string;
};

export type WithdrawalRequest = {
  id: string;
  amount: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  processedAt: string | null;
  createdAt: string;
};

export type WithdrawalPayload = {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

export async function mobileGetCreditTransactions(token: string): Promise<CreditTransaction[]> {
  const res = await fetch(`${API_BASE}/mobile/me/credit-transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดประวัติเครดิตไม่สำเร็จ");
  return res.json() as Promise<CreditTransaction[]>;
}

export async function mobileRequestWithdrawal(token: string, payload: WithdrawalPayload): Promise<WithdrawalRequest> {
  const res = await fetch(`${API_BASE}/mobile/me/withdraw`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "ขอถอนเครดิตไม่สำเร็จ");
  }
  return res.json() as Promise<WithdrawalRequest>;
}

export async function mobileGetWithdrawals(token: string): Promise<WithdrawalRequest[]> {
  const res = await fetch(`${API_BASE}/mobile/me/withdrawals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดรายการถอนไม่สำเร็จ");
  return res.json() as Promise<WithdrawalRequest[]>;
}

// ─── Mobile rewards ───────────────────────────────────────────────────────────

export type RewardProduct = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  images?: { id: string; url: string; thumbnailUrl?: string | null; sortOrder: number }[];
  pointCost: number;
  stock: number;
};

export async function mobileGetProfile(token: string): Promise<{
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  memberType: string;
  pointBalance: number;
  creditBalance: number;
  referralCode: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  profileImageUrl?: string | null;
  profileThumbnailUrl?: string | null;
  bannerImageUrl?: string | null;
  bannerThumbnailUrl?: string | null;
}> {
  const res = await fetch(`${API_BASE}/mobile/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดข้อมูลสมาชิกไม่สำเร็จ");
  return res.json();
}

export async function mobileUpdateBankAccount(
  token: string,
  bankName: string,
  bankAccountNumber: string,
  bankAccountName: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/mobile/me/bank-account`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ bankName, bankAccountNumber, bankAccountName }),
  });
  if (!res.ok) throw new Error("บันทึกบัญชีธนาคารไม่สำเร็จ");
}

export async function mobileGetRewardProducts(token: string): Promise<RewardProduct[]> {
  const res = await fetch(`${API_BASE}/mobile/rewards`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดสินค้าแลกแต้มไม่สำเร็จ");
  return res.json() as Promise<RewardProduct[]>;
}

export async function mobileRedeemReward(token: string, rewardProductId: string, addressId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/mobile/rewards/${rewardProductId}/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ addressId }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "แลกแต้มไม่สำเร็จ");
  }
}

export type MyRedemption = {
  id: string;
  pointsSpent: number;
  status: "PENDING" | "PREPARING" | "SHIPPED" | "DELIVERED";
  rewardProduct: { id: string; name: string; imageUrl: string | null; thumbnailUrl?: string | null };
  createdAt: string;
};

export type MyRedemptionDetail = MyRedemption & {
  trackingNumber: string | null;
  carrierId: string | null;
  shippingRecipient: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  statusUpdatedAt: string | null;
};

export async function mobileGetMyRedemptions(token: string): Promise<MyRedemption[]> {
  const res = await fetch(`${API_BASE}/mobile/me/redemptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดรายการของรางวัลไม่สำเร็จ");
  return res.json() as Promise<MyRedemption[]>;
}

export async function mobileGetMyRedemption(token: string, id: string): Promise<MyRedemptionDetail> {
  const res = await fetch(`${API_BASE}/mobile/me/redemptions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดรายละเอียดของรางวัลไม่สำเร็จ");
  return res.json() as Promise<MyRedemptionDetail>;
}

export async function mobileUploadProfileImage(token: string, imageUri: string): Promise<{ profileImageUrl: string }> {
  const filename = imageUri.split("/").pop() ?? "profile.jpg";
  const ext = (filename.split(".").pop() ?? "jpg").toLowerCase();
  const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  // React Native FormData — must NOT set Content-Type manually
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as unknown as File);

  const res = await fetch(`${API_BASE}/mobile/me/profile-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
  }
  return res.json() as Promise<{ profileImageUrl: string; profileThumbnailUrl: string | null }>;
}

export async function mobileRegisterPushToken(token: string, expoPushToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/mobile/me/push-token`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ expoPushToken }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "ลงทะเบียน push token ไม่สำเร็จ");
  }
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
    trackingNumber: o.trackingNumber ?? undefined,
    carrierId: (o as any).carrierId ?? null,
  };
}
