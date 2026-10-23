export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  description: string;
  detail: string;
  material: string;
  color: string;
  image: string;
  accent: string;
  accentSoft: string;
  shape: "lamp" | "tray" | "clock" | "vase" | "stand" | "notebook";
};

export const PRODUCTS: Product[] = [
  {
    id: "AG-LMP-101",
    slug: "orbit-desk-lamp",
    name: "Orbit desk lamp",
    category: "lighting",
    categoryName: "Lighting",
    price: 89,
    description: "A focused pool of warm light, balanced on a quiet steel arc.",
    detail: "Orbit turns a work surface into a calm, deliberate place. Its weighted base stays planted while the shade rotates through 120 degrees.",
    material: "Powder-coated steel",
    color: "Ink blue",
    image: "/images/orbit-desk-lamp.png",
    accent: "#3157d5",
    accentSoft: "#dce5ff",
    shape: "lamp",
  },
  {
    id: "AG-TRY-204",
    slug: "fold-catchall-tray",
    name: "Fold catchall tray",
    category: "organization",
    categoryName: "Organization",
    price: 34,
    description: "A soft-edged landing place for keys, cables, and small rituals.",
    detail: "Fold is pressed from a single sheet of recycled aluminium and finished by hand. Four lifted corners keep daily objects in easy reach.",
    material: "Recycled aluminium",
    color: "Saffron",
    image: "/images/fold-catchall-tray.png",
    accent: "#f2733d",
    accentSoft: "#ffe2d4",
    shape: "tray",
  },
  {
    id: "AG-CLK-310",
    slug: "minute-table-clock",
    name: "Minute table clock",
    category: "objects",
    categoryName: "Objects",
    price: 58,
    description: "Time, reduced to two hands and one beautifully weighted circle.",
    detail: "A silent sweep movement keeps the room free of ticking. The solid beech surround is finished with plant-based oil.",
    material: "Solid beech",
    color: "Natural",
    image: "/images/minute-table-clock.png",
    accent: "#a47446",
    accentSoft: "#ead8c2",
    shape: "clock",
  },
  {
    id: "AG-VSE-118",
    slug: "still-bud-vase",
    name: "Still bud vase",
    category: "objects",
    categoryName: "Objects",
    price: 42,
    description: "A small architectural vessel for one branch or a few stems.",
    detail: "Still is wheel-thrown in a family studio. Its matte body and gloss interior make water changes simple while keeping the silhouette soft.",
    material: "Glazed stoneware",
    color: "Moss",
    image: "/images/still-bud-vase.png",
    accent: "#637963",
    accentSoft: "#dbe5d8",
    shape: "vase",
  },
  {
    id: "AG-STD-402",
    slug: "rise-laptop-stand",
    name: "Rise laptop stand",
    category: "organization",
    categoryName: "Organization",
    price: 76,
    description: "A slim lift for better posture and a clearer working surface.",
    detail: "Rise holds laptops up to sixteen inches and leaves room beneath for a keyboard. Cork contact points keep devices steady and unscratched.",
    material: "Bent aluminium and cork",
    color: "Chalk",
    image: "/images/rise-laptop-stand.png",
    accent: "#7668bb",
    accentSoft: "#e6e1ff",
    shape: "stand",
  },
  {
    id: "AG-NBK-225",
    slug: "field-notebook-set",
    name: "Field notebook set",
    category: "stationery",
    categoryName: "Stationery",
    price: 24,
    description: "Three lay-flat notebooks for plans, fragments, and finished thoughts.",
    detail: "Each book uses smooth recycled stock with a different ruling: dot grid, plain, and weekly plan. Thread binding lets every spread lie flat.",
    material: "Recycled paper",
    color: "Cobalt set",
    image: "/images/field-notebook-set.png",
    accent: "#167a83",
    accentSoft: "#d3eef0",
    shape: "notebook",
  },
];

export const findProduct = (slug: string) => PRODUCTS.find((product) => product.slug === slug);

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

