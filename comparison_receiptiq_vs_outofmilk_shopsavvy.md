# ReceiptIQ vs Out of Milk vs ShopSavvy

A concise side-by-side comparison highlighting how ReceiptIQ differs from Out of Milk and ShopSavvy.

| Feature | Out of Milk | ShopSavvy | ReceiptIQ |
|---|---:|---:|---:|
| Primary focus | Grocery shopping lists & pantry management | Barcode/product scanning and price lookup | Receipt-first transaction parsing, analytics and price history |
| Input method | Manual lists, barcode add | Barcode/product scan (camera) | Receipt photo/PDF upload, OCR, CSV import |
| Core features | Shopping lists, pantry, to-dos, sync | Price comparison, product search, deals, reviews | OCR receipt parsing, line-item extraction, merchant metadata, totals, taxes |
| Data granularity | Item-level (user-entered) | Product-level (barcode) | Transaction-level (line items, quantities, unit prices) |
| Analytics & insights | Minimal (list counts) | Price comparisons per product | Spending dashboards, store comparison, price trends, anomaly detection |
| Best use case | Plan and manage grocery shopping & pantry | Find lowest price while shopping | Track spending, research price history, automate reimbursements and analytics |
| Receipt handling | None (manual) | Limited (barcode lookup only) | Full: OCR, structured data extraction, bulk import and presigned upload API |
| Integrations / Workflows | Account sync, list sharing | Retailer databases, product search | Backend ingestion (presigned uploads), analytics APIs, alerts and imports (Amazon CSV) |
| Alerts / Price tracking | Not primary | Deal alerts per product | Price-anomaly alerts, trend notifications, store-level changes |
| Target user | Consumers planning shopping | Shoppers seeking best deals | Analysts, frequent shoppers, finance teams, price researchers |

**Key differences (short)**

- Input source: Out of Milk/ShopSavvy start from lists or barcodes; ReceiptIQ starts from receipts and extracts full transaction context.
- Granularity: ReceiptIQ captures line-item prices, taxes, totals and merchant metadata; the others focus on items/products without full receipt context.
- Analytics: ReceiptIQ provides historical price trends, store comparisons, anomaly detection and spending dashboards; Out of Milk focuses on lists; ShopSavvy on immediate price lookups.
- Workflows: ReceiptIQ supports bulk imports, presigned uploads and backend analytics pipelines for automation.

**When to choose which**

- Choose Out of Milk: if you need simple shopping lists, pantry tracking and offline list management.
- Choose ShopSavvy: if you want quick barcode scanning to compare prices and find deals in the moment.
- Choose ReceiptIQ: if you want automated receipt capture/OCR, structured spending data, price history and analytics across stores.

Would you like this exported as a README-style file in the repo or converted into a slide-ready Markdown/PPTX?