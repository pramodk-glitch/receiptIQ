export interface StorePrice {
  storeChain: string;
  avgPrice: number;
  minPrice: number;
  purchases: number;
  isCheapest: boolean;
}

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
