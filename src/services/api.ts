import type { Category, Product } from "@/types/domain";

const API_BASE =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? "http://localhost:3000/api";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  imageUrl?: string | null;
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
  categoryId: string;
  images?: { id: string; url: string; sortOrder: number }[];
};

function mapCategory(c: ApiCategory): Category {
  const slug = c.slug.toLowerCase();
  const requiresShadeSelection = slug.includes("color") || slug.includes("bleach");
  return {
    id: c.id,
    title: c.name,
    subtitle: c.description ?? "",
    requiresShadeSelection,
    slug: c.slug,
  };
}

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    subtitle: p.description?.split(".")[0]?.trim() ?? "",
    price: parseFloat(p.price) || 0,
    description: p.description ?? "",
    accentColor: "#C9826F",
    imageUrl: p.images?.[0]?.url,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories?status=active&pageSize=100`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
  const data = await res.json() as { items: ApiCategory[] };
  return data.items.filter((c) => c.isActive).map(mapCategory);
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products?status=active&pageSize=200`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const data = await res.json() as { items: ApiProduct[] };
  return data.items.filter((p) => p.status === "ACTIVE").map(mapProduct);
}

export async function loadCatalogFromApi(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  return { categories, products };
}

