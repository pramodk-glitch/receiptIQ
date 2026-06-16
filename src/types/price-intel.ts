export interface StorePrice {
  storeChain: string;
  avgPrice: number;
  minPrice: number;
  purchases: number;
  isCheapest: boolean;
}

// ── Legacy (kept for backward compat) ────────────────────────────────────────
export interface CategoryItem {
  itemNameNormalized: string;
  category: string;
  stores: StorePrice[];
  bestPrice: number;
  multiStore: boolean;
}

export interface CategoryGroup {
  category: string;
  items: CategoryItem[];
}

// ── New 3-level tree types ────────────────────────────────────────────────────

export type TrendDirection = "up" | "down" | "stable" | "new";

export interface PriceTrend {
  direction: TrendDirection;
  pct: number;           // % change (positive = up)
  currentPrice: number;
  previousPrice: number | null;
  currentDate: string;
  previousDate: string | null;
}

export interface ProductVariant {
  itemNameNormalized: string;
  itemName: string;          // display (title-cased)
  storeChain: string;
  unitPrice: number;
  unit?: string | null;
  capturedAt: string;
  isCheapest: boolean;
}

export interface ProductGroup {
  productGroup: string;      // e.g. "Milk", "Chicken Breast"
  subCategory: string;       // e.g. "Dairy & Eggs", "Produce — Vegetables"
  category: string;
  variantCount: number;
  storeCount: number;
  minPrice: number;
  maxPrice: number;
  bestStore: string;
  trend: PriceTrend;
  variants: ProductVariant[];
}

export interface SubCategoryNode {
  subCategory: string;
  productCount: number;
  products: ProductGroup[];
}

export interface CategoryNode {
  category: string;
  icon: string;
  productCount: number;
  subCategories: SubCategoryNode[];
}
