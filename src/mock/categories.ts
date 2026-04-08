import type { Category } from "@/types/domain";

export const categories: Category[] = [
  {
    id: "color-bleach",
    title: "Color & Bleach",
    subtitle: "Select shade first",
    requiresShadeSelection: true,
  },
  {
    id: "shampoo-mask",
    title: "Shampoo & Mask",
    subtitle: "Care essentials",
    requiresShadeSelection: false,
  },
  {
    id: "leave-in",
    title: "Leave In",
    subtitle: "Finish & shine",
    requiresShadeSelection: false,
  },
];
