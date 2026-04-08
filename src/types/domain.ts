export type CategoryId = "color-bleach" | "shampoo-mask" | "leave-in";

export type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
  requiresShadeSelection: boolean;
};
