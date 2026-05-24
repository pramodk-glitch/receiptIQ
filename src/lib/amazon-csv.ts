import { parse } from "csv-parse/sync";

export interface AmazonOrderRow {
  orderId: string;
  orderDate: string;
  title: string;
  category: string;
  asin: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  seller: string;
  orderTotal?: number;
}

export interface AmazonOrder {
  orderId: string;
  orderDate: string;
  orderTotal: number;
  items: AmazonOrderItem[];
}

export interface AmazonOrderItem {
  title: string;
  category: string;
  asin: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  seller: string;
}

const AMAZON_CATEGORY_MAP: Record<string, string> = {
  "electronics": "Electronics",
  "computers": "Electronics",
  "cameras": "Electronics",
  "cell phones": "Electronics",
  "video games": "Entertainment",
  "books": "General",
  "kindle books": "General",
  "music": "Entertainment",
  "movies & tv": "Entertainment",
  "toys & games": "Entertainment",
  "sports": "General",
  "outdoors": "General",
  "home & kitchen": "Household",
  "tools & home improvement": "Household",
  "garden & outdoor": "Household",
  "kitchen": "Household",
  "appliances": "Household",
  "grocery": "Groceries",
  "grocery & gourmet food": "Groceries",
  "food": "Groceries",
  "health": "Medicine",
  "health & household": "Medicine",
  "health & personal care": "Personal Care",
  "beauty": "Personal Care",
  "beauty & personal care": "Personal Care",
  "personal care": "Personal Care",
  "clothing": "General",
  "shoes": "General",
  "jewelry": "General",
  "luggage": "Travel",
  "travel": "Travel",
  "automotive": "General",
  "industrial": "General",
  "office products": "General",
  "arts": "General",
  "crafts": "General",
  "baby": "General",
  "pet supplies": "General",
  "software": "Electronics",
  "amazon devices": "Electronics",
  "subscribe & save": "General",
};

export function normalizeAmazonCategory(amazonCategory: string): string {
  if (!amazonCategory) return "General";
  const lower = amazonCategory.toLowerCase().trim();
  for (const [key, value] of Object.entries(AMAZON_CATEGORY_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return "General";
}

function parsePrice(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,\s]/g, "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseQuantity(value: string): number {
  if (!value) return 1;
  const parsed = parseInt(value.trim(), 10);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function parseDate(value: string): string {
  if (!value) return new Date().toISOString().split("T")[0];

  const cleaned = value.trim();

  // Try MM/DD/YYYY
  const mdyMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Try YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return cleaned.substring(0, 10);
  }

  // Try Month DD, YYYY
  const namedMatch = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (namedMatch) {
    const months: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04",
      may: "05", june: "06", july: "07", august: "08",
      september: "09", october: "10", november: "11", december: "12",
    };
    const [, mon, day, year] = namedMatch;
    const monthNum = months[mon.toLowerCase()];
    if (monthNum) {
      return `${year}-${monthNum}-${day.padStart(2, "0")}`;
    }
  }

  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) {
    return fallback.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function normalizeHeaders(headers: string[]): string[] {
  return headers.map((h) => h.toLowerCase().trim().replace(/['"]/g, ""));
}

function getField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()] ?? row[key.toUpperCase()];
    if (value !== undefined && value !== null) return String(value).trim();
  }
  return "";
}

export function parseAmazonCsv(csvContent: string): AmazonOrder[] {
  let records: Record<string, string>[];

  try {
    records = parse(csvContent, {
      columns: (headers: string[]) => normalizeHeaders(headers),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
    }) as Record<string, string>[];
  } catch (err) {
    throw new Error(`CSV parse error: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (records.length === 0) {
    return [];
  }

  const orderMap = new Map<string, AmazonOrder>();

  for (const row of records) {
    // Try both header formats
    const orderId =
      getField(row, "order id", "order-id") ||
      getField(row, "Order ID", "Order-ID");

    if (!orderId) continue;

    const orderDate = parseDate(
      getField(row, "order date", "Order Date", "order-date")
    );

    const title =
      getField(row, "title", "Title", "product name", "Product Name") ||
      "Unknown Item";

    const category = getField(row, "category", "Category");
    const asin = getField(row, "asin/isbn", "asin", "ASIN/ISBN", "ASIN");
    const seller = getField(row, "seller", "Seller", "sold by", "Sold By");

    const quantityStr = getField(row, "quantity", "Quantity");
    const quantity = parseQuantity(quantityStr);

    const unitPriceStr = getField(
      row,
      "purchase price per unit",
      "Purchase Price Per Unit",
      "unit price",
      "Unit Price",
      "item price",
      "Item Price"
    );
    const unitPrice = parsePrice(unitPriceStr);

    const lineTotalStr = getField(
      row,
      "item total",
      "Item Total",
      "line total",
      "total",
      "order total",
      "Order Total"
    );
    const lineTotal = parsePrice(lineTotalStr) || unitPrice * quantity;

    const orderTotalStr = getField(row, "order total", "Order Total");
    const orderTotal = parsePrice(orderTotalStr);

    const item: AmazonOrderItem = {
      title,
      category: normalizeAmazonCategory(category),
      asin,
      quantity,
      unitPrice,
      lineTotal,
      seller,
    };

    if (orderMap.has(orderId)) {
      const existing = orderMap.get(orderId)!;
      existing.items.push(item);
      if (orderTotal > existing.orderTotal) {
        existing.orderTotal = orderTotal;
      }
    } else {
      orderMap.set(orderId, {
        orderId,
        orderDate,
        orderTotal: orderTotal || lineTotal,
        items: [item],
      });
    }
  }

  const orders = Array.from(orderMap.values());

  for (const order of orders) {
    if (order.orderTotal === 0) {
      order.orderTotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
    }
  }

  return orders;
}
