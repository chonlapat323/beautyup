import type { Category, Order, Product, Shade } from "@/types/domain";

const milbonOrdeveImage =
  "https://milbon.com.sg/wp-content/uploads/2023/07/Ordeve-1.webp";
const milbonOrdeveAddicthyImage =
  "https://milbon.com.sg/wp-content/uploads/2023/11/Ordeve-Addicthy.jpg";
const milbonOrdeveCrystalImage =
  "https://milbon.com.sg/wp-content/uploads/2023/07/Ordeve-Crystal-High-Bright-1.webp";
const milbonShampooImage =
  "https://milbon.com.sg/wp-content/uploads/2023/06/milbon_smooth_smoothingshampoo-600x600.webp";
const milbonLeaveInImage =
  "https://milbon.com.sg/wp-content/uploads/2024/01/sun-protect-emulsion-600x644-1-300x300-1.jpg";
const milbonBleachCareImage =
  "https://milbon.com.sg/wp-content/uploads/2023/11/bleach-care-gel-600x644-1.jpg";

export const categories: Category[] = [
  {
    id: "color-bleach",
    title: "Color & Bleach",
    subtitle: "Select shade first",
    requiresShadeSelection: true,
    imageUrl: milbonOrdeveImage,
  },
  {
    id: "shampoo-mask",
    title: "Shampoo & Mask",
    subtitle: "Care essentials",
    requiresShadeSelection: false,
    imageUrl: milbonShampooImage,
  },
  {
    id: "leave-in",
    title: "Leave In",
    subtitle: "Finish & shine",
    requiresShadeSelection: false,
    imageUrl: milbonLeaveInImage,
  },
];

const milbonShadeFamilies = [
  { family: "NB", levels: [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], swatches: ["#F3E5DA", "#EED8C8", "#DFC2AB", "#CFA787", "#B88A69", "#9A6F53", "#7A5842", "#624433", "#51372A", "#422D22", "#38261D", "#2D1F19", "#221814"] },
  { family: "CB", levels: [13, 12, 11, 10, 9, 8, 7, 6, 5], swatches: ["#F1E1D7", "#E8D0C2", "#D9B5A2", "#C89A82", "#B17E67", "#95654E", "#7A513E", "#654334", "#54392D"] },
  { family: "10", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#F3E7D8", "#E8D7C0", "#D5BC96", "#C2A175", "#A9865F", "#8D6E4E", "#765A41"] },
  { family: "15", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#F0E5D9", "#E5D2C2", "#D1B29C", "#BC977F", "#A47F69", "#896A58", "#755849"] },
  { family: "20", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#F4E8E0", "#EAD5C9", "#D7B6A7", "#C59B8E", "#B08376", "#936C62", "#7A5A52"] },
  { family: "30", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#EFE6DB", "#E4D4C0", "#D0B899", "#BA9D7E", "#9D8368", "#856E58", "#6D5B4A"] },
  { family: "40", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#F3E2D8", "#EACDBE", "#DAAA8E", "#C8896E", "#B47058", "#945945", "#78493B"] },
  { family: "50", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#F3DEE1", "#E8C5CB", "#D99AA5", "#C97A88", "#B25E6E", "#934A57", "#7A3D47"] },
  { family: "55", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#F2E1E7", "#E7CBD5", "#D7A3B2", "#C18498", "#A9687F", "#8A5367", "#704454"] },
  { family: "60", levels: [13, 11, 9, 8, 7, 6, 5], swatches: ["#EEE3EF", "#E2D0E4", "#C6A8CE", "#AC87B7", "#946C9D", "#7C5981", "#66496A"] },
  { family: "sAS", levels: [13, 11, 9, 8, 7], swatches: ["#E7E5E1", "#D7D5D1", "#B9B6B1", "#A39F9A", "#89847F"] },
  { family: "sMA", levels: [13, 11, 9, 8, 7], swatches: ["#E9E5E0", "#D8D1C8", "#BBB1A4", "#A49788", "#8D8072"] },
  { family: "wAS", levels: [13, 11, 9, 8, 7], swatches: ["#EFE7DD", "#E1D3C1", "#C6B096", "#B09179", "#967762"] },
  { family: "hCN", levels: [13, 11, 9, 8, 7, 6], swatches: ["#F0E5DC", "#E4D1C1", "#D0B195", "#BA9379", "#A17A62", "#866550"] },
  { family: "hHZ", levels: [13, 11, 9, 8, 7, 6], swatches: ["#EFE6DE", "#E2D3C3", "#C9B29A", "#B3947B", "#9A7A63", "#816550"] },
  { family: "fAP", levels: [13, 11, 9, 8, 7, 6], swatches: ["#F5E1DC", "#EDCAC0", "#E19E8F", "#D67F6F", "#C76557", "#A85247"] },
  { family: "fPK", levels: [13, 11, 9, 8, 7, 6], swatches: ["#F4E0E7", "#EBC7D2", "#DB9EB3", "#CB7C97", "#B85F7F", "#974C68"] },
] as const;

export const shadeGroups = milbonShadeFamilies.map((group) => ({
  id: group.family,
  title: group.family.startsWith("f") || group.family.startsWith("h") || group.family.startsWith("s") || group.family.startsWith("w")
    ? group.family
    : `-${group.family}`.replace("--", "-").replace("-NB", "NB").replace("-CB", "CB"),
  family: group.family,
  imageUrl: `https://milbon.com.sg/wp-content/uploads/2023/07/${group.levels[0]}-${group.family}.webp`,
}));

export const shades: Shade[] = milbonShadeFamilies.flatMap((group) =>
  group.levels.map((level, index) => ({
    id: `${level}-${group.family}`,
    name: `${level}-${group.family}`,
    tone: `Ordeve ${group.family}`,
    swatch: group.swatches[index],
    imageUrl: `https://milbon.com.sg/wp-content/uploads/2023/07/${level}-${group.family}.webp`,
  })),
);

const curatedProducts: Product[] = [
  {
    id: "elujuda-sun-protect-emulsion",
    categoryId: "leave-in",
    name: "ELUJUDA Sun Protect Emulsion",
    subtitle: "Hydrating UV care",
    price: 42,
    description: "A leave-in treatment that conditions hair while helping protect it from sunlight.",
    accentColor: "#D8A799",
    imageUrl: milbonLeaveInImage,
  },
  {
    id: "elujuda-bleach-care-gel-serum",
    categoryId: "leave-in",
    name: "ELUJUDA Bleach Care Gel Serum",
    subtitle: "Bleached hair support",
    price: 37,
    description: "A leave-in gel serum designed to keep bleached hair supple and manageable.",
    accentColor: "#D9B18F",
    imageUrl: milbonBleachCareImage,
  },
  {
    id: "elujuda-sun-protect-serum",
    categoryId: "leave-in",
    name: "ELUJUDA Sun Protect Serum",
    subtitle: "Glossy soft finish",
    price: 35,
    description: "A leave-in serum that gives smooth, tangle-free results with a soft glossy finish.",
    accentColor: "#C99E8F",
    imageUrl: milbonLeaveInImage,
  },
  {
    id: "global-milbon-smooth-shampoo",
    categoryId: "shampoo-mask",
    name: "GLOBAL MILBON Smooth Smoothing Shampoo",
    subtitle: "Shiny smooth finish",
    price: 58,
    description: "A smoothing shampoo that gently wraps hair cuticles for a silky finish.",
    accentColor: "#C9826F",
    imageUrl: milbonShampooImage,
  },
  {
    id: "global-milbon-reawaken-shampoo",
    categoryId: "shampoo-mask",
    name: "GLOBAL MILBON Reawaken Renewing Oil Shampoo",
    subtitle: "Restore shine",
    price: 34,
    description: "A rich shampoo for dry, dull hair that helps restore moisture and glossy softness.",
    accentColor: "#8DA27E",
    imageUrl: milbonShampooImage,
  },
  {
    id: "plarmia-clear-spa-foam",
    categoryId: "shampoo-mask",
    name: "PLARMIA Clear Spa Foam",
    subtitle: "Scalp cleanse",
    price: 39,
    description: "A concentrated foam cleanser that deeply refreshes the scalp and supports healthy hair.",
    accentColor: "#B5765B",
    imageUrl: milbonShampooImage,
  },
  {
    id: "global-milbon-smooth-treatment",
    categoryId: "shampoo-mask",
    name: "GLOBAL MILBON Smooth Treatment",
    subtitle: "Daily smoothing care",
    price: 56,
    description: "A smoothing treatment paired with the shampoo routine for polished salon-soft results.",
    accentColor: "#A56257",
    imageUrl: milbonShampooImage,
  },
  {
    id: "developer-cream",
    categoryId: "color-bleach",
    name: "Color Developer Cream",
    subtitle: "Salon support base",
    price: 31,
    description: "A mock developer essential shown alongside shade-led color products in the demo flow.",
    accentColor: "#A48D79",
    imageUrl: milbonOrdeveCrystalImage,
  },
  {
    id: "post-color-treatment",
    categoryId: "color-bleach",
    name: "Post Color Treatment",
    subtitle: "After-color care",
    price: 33,
    description: "A soft after-color treatment to support tone longevity and a smooth salon finish.",
    accentColor: "#8E6B61",
    imageUrl: milbonOrdeveAddicthyImage,
  },
  {
    id: "espresso-color-cream",
    categoryId: "color-bleach",
    shadeId: "8-NB",
    name: "ORDEVE 8-NB",
    subtitle: "Natural brown tone",
    price: 49,
    description: "Professional color cream for rich brunette results with balanced depth and shine.",
    accentColor: "#5C3B33",
    imageUrl: milbonOrdeveImage,
  },
  {
    id: "honey-blonde-lift",
    categoryId: "color-bleach",
    shadeId: "9-CB",
    name: "ORDEVE 9-CB",
    subtitle: "Cool beige tone",
    price: 54,
    description: "A brightening color essential created for soft golden blonde outcomes.",
    accentColor: "#D4AC67",
    imageUrl: milbonOrdeveAddicthyImage,
  },
  {
    id: "rose-gold-toner",
    categoryId: "color-bleach",
    shadeId: "11-10",
    name: "ORDEVE 11-10",
    subtitle: "Ash mist finish",
    price: 52,
    description: "A tone-refining formula for pastel warmth with a premium glossy finish.",
    accentColor: "#D79A96",
    imageUrl: milbonOrdeveCrystalImage,
  },
  {
    id: "chestnut-bleach-care",
    categoryId: "color-bleach",
    shadeId: "8-55",
    name: "ORDEVE 8-55",
    subtitle: "Rose brown support",
    price: 51,
    description: "After-color care for warm brunette results that stay smooth and vibrant.",
    accentColor: "#8E5B49",
    imageUrl: milbonOrdeveImage,
  },
  {
    id: "elujuda-extra-repair-milky-serum",
    categoryId: "leave-in",
    name: "ELUJUDA Extra Repair Milky Serum",
    subtitle: "Moisturizing smooth touch",
    price: 29,
    description: "A leave-in treatment for frizzy and damaged hair that leaves a soft moisturizing feel.",
    accentColor: "#B7B0C8",
    imageUrl: milbonLeaveInImage,
  },
  {
    id: "elujuda-extra-repair-serum",
    categoryId: "leave-in",
    name: "ELUJUDA Extra Repair Serum",
    subtitle: "Smooth untamed ends",
    price: 32,
    description: "A repairing serum for tangled damaged ends that helps make hair smoother and more manageable.",
    accentColor: "#B8998F",
    imageUrl: milbonBleachCareImage,
  },
];

const featuredColorShadeIds = new Set(["8-NB", "9-CB", "11-10", "8-55"]);

const generatedColorProducts: Product[] = shades
  .filter((shade) => !featuredColorShadeIds.has(shade.id))
  .map((shade, index) => {
    const level = Number(shade.id.split("-")[0]);
    const lightTone = level >= 10;

    return {
      id: `milbon-${shade.id.toLowerCase()}`,
      categoryId: "color-bleach" as const,
      shadeId: shade.id,
      name: `${shade.name} Color Cream`,
      subtitle: `${shade.tone} match`,
      price: 44 + (index % 8),
      description: `Mock salon color SKU aligned to the Milbon ${shade.name} tone family for presentation and browsing.`,
      accentColor: shade.swatch,
      imageUrl: lightTone ? milbonOrdeveAddicthyImage : milbonOrdeveImage,
    };
  });

export const products: Product[] = [...curatedProducts, ...generatedColorProducts];

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
