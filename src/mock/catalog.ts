import type { Category, Order, Product, Shade } from "@/types/domain";

export const categories: Category[] = [
  {
    id: "color-bleach",
    title: "Color & Bleach",
    subtitle: "Select shade first",
    requiresShadeSelection: true,
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "shampoo-mask",
    title: "Shampoo & Mask",
    subtitle: "Care essentials",
    requiresShadeSelection: false,
    imageUrl:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "leave-in",
    title: "Leave In",
    subtitle: "Finish & shine",
    requiresShadeSelection: false,
    imageUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
];

export const shades: Shade[] = [
  {
    id: "espresso",
    name: "Espresso",
    tone: "Deep neutral",
    swatch: "#4B332C",
    imageUrl:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "honey-blonde",
    name: "Honey Blonde",
    tone: "Warm golden",
    swatch: "#C99652",
    imageUrl:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    tone: "Soft iridescent",
    swatch: "#D59A92",
    imageUrl:
      "https://images.unsplash.com/photo-1523263685509-57c1d050d19b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "chestnut",
    name: "Chestnut",
    tone: "Rich auburn",
    swatch: "#7B4A36",
    imageUrl:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
  },
];

export const products: Product[] = [
  {
    id: "velvet-hair-oil",
    categoryId: "leave-in",
    name: "Velvet Hair Oil",
    subtitle: "Weightless shine",
    price: 42,
    description: "A lightweight finishing oil for softness, shine, and a polished everyday finish.",
    accentColor: "#D8A799",
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ceramide-mask",
    categoryId: "shampoo-mask",
    name: "Ceramide Mask",
    subtitle: "Repair ritual",
    price: 58,
    description: "A restorative mask that helps smooth texture and replenish dry, stressed strands.",
    accentColor: "#C9826F",
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "botanical-wash",
    categoryId: "shampoo-mask",
    name: "Botanical Wash",
    subtitle: "Cleanse & soften",
    price: 34,
    description: "A clean daily shampoo with a gentle lather and a salon-soft finish.",
    accentColor: "#8DA27E",
    imageUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "espresso-color-cream",
    categoryId: "color-bleach",
    shadeId: "espresso",
    name: "Espresso Color Cream",
    subtitle: "Deep neutral tone",
    price: 49,
    description: "Professional color cream for rich brunette results with balanced depth and shine.",
    accentColor: "#5C3B33",
    imageUrl:
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "honey-blonde-lift",
    categoryId: "color-bleach",
    shadeId: "honey-blonde",
    name: "Honey Blonde Lift",
    subtitle: "Warm golden blonde",
    price: 54,
    description: "A brightening color essential created for soft golden blonde outcomes.",
    accentColor: "#D4AC67",
    imageUrl:
      "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "rose-gold-toner",
    categoryId: "color-bleach",
    shadeId: "rose-gold",
    name: "Rose Gold Toner",
    subtitle: "Soft iridescent finish",
    price: 52,
    description: "A tone-refining formula for pastel warmth with a premium glossy finish.",
    accentColor: "#D79A96",
    imageUrl:
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "chestnut-bleach-care",
    categoryId: "color-bleach",
    shadeId: "chestnut",
    name: "Chestnut Bleach Care",
    subtitle: "Rich auburn support",
    price: 51,
    description: "After-color care for warm brunette results that stay smooth and vibrant.",
    accentColor: "#8E5B49",
    imageUrl:
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "silk-finish-mist",
    categoryId: "leave-in",
    name: "Silk Finish Mist",
    subtitle: "Soft thermal shield",
    price: 29,
    description: "A leave-in mist with heat protection and airy softness for daily styling.",
    accentColor: "#B7B0C8",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
];

export const mockOrders: Order[] = [
  {
    id: "BU-24031",
    itemCount: 2,
    total: 120,
    status: "Paid",
    placedAt: "08 Apr 2026",
    gatewayFee: 20,
    items: [
      {
        productId: "velvet-hair-oil",
        name: "Velvet Hair Oil",
        quantity: 1,
        price: 42,
      },
      {
        productId: "ceramide-mask",
        name: "Ceramide Mask",
        quantity: 1,
        price: 58,
      },
    ],
  },
  {
    id: "BU-24018",
    itemCount: 1,
    total: 49,
    status: "Delivered",
    placedAt: "04 Apr 2026",
    gatewayFee: 20,
    items: [
      {
        productId: "espresso-color-cream",
        name: "Espresso Color Cream",
        quantity: 1,
        price: 29,
      },
    ],
  },
];
