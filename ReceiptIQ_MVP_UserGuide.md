# ReceiptIQ MVP — User Guide

**Live URL:** http://54.235.196.79

---

## What is ReceiptIQ?

ReceiptIQ is a personal expense tracker that lets you capture, organise, and analyse receipts. The MVP supports three ways to get your spending into the system — manual entry, image upload with AI extraction, and Amazon order history import — and shows your data as a visual dashboard.

---

## Getting Started

### Create an account

1. Open http://54.235.196.79 in your browser.
2. Click **Register** (or go to `/register`).
3. Enter your email address and choose a password.
4. You are taken straight to the dashboard on success.

### Sign in

1. Go to http://54.235.196.79 (redirects to `/login` when not signed in).
2. Enter your email and password.
3. Click **Sign in**.

### Sign out

Click **Sign out** in the top-right corner of the navigation bar.

---

## Navigation

The top navigation bar contains five links:

| Link | Page | What it does |
|---|---|---|
| **Dashboard** | `/dashboard` | Spending overview and charts |
| **Receipts** | `/receipts` | Full list of all your receipts |
| **Upload** | `/receipts/upload` | Upload a receipt photo for AI extraction |
| **Import Amazon** | `/import` | Import your Amazon order history CSV |
| **Manual Entry** | `/manual-entry` | Add a receipt by typing the details yourself |

---

## Features

### 1. Dashboard

The dashboard is your spending overview at a glance. It shows:

- **This Month** — total spending for the current calendar month.
- **Receipts** — total number of receipts tracked across all time.
- **Top Category** — the category you have spent the most in.
- **Monthly Spending chart** — a bar chart of your spending per month over recent history.
- **Spending by Category chart** — a pie chart breaking down your spending into categories.
- **Recent Receipts** — a quick list of your most recent receipts with links to their detail pages.

The dashboard refreshes its data on every page load (no caching).

---

### 2. Receipts List

The receipts page (`/receipts`) shows a card grid of all your receipts, sorted newest first (up to 50 at a time). Each card shows:

- Store name
- Date of purchase
- Total amount
- Source badge (`Manual Entry`, `Image Upload`, `Amazon CSV Import`, or `AI OCR`)
- Item count
- A **Needs Review** badge if the AI flagged the receipt as low-confidence

Click any card to open the full receipt detail.

**Buttons in the header:**
- **Upload Receipt** → goes to the upload page
- **Manual Entry** → goes to the manual entry form

When no receipts exist, the empty state shows direct links to upload and Amazon import.

---

### 3. Receipt Detail

Clicking a receipt card opens `/receipts/[id]`, which shows:

- Store name, date, total amount, source badge
- Receipt image (if one was uploaded)
- A metadata grid: store, chain, date, total, source, item count, date added
- A **Line Items table** with columns: Item Name, Qty, Unit Price, Line Total, Category
- Raw OCR text (only visible if the receipt was processed by AI)
- A **Delete** button at the bottom — this permanently removes the receipt and all its line items

---

### 4. Upload Receipt (AI OCR)

> **Note:** This feature requires an Anthropic API key to be configured in AWS Secrets Manager. The receipt image is uploaded to S3 and an AWS Lambda function calls Claude Vision to extract data. If the API key is not set, the upload will still store the image but OCR will not run.

1. Go to **Upload** in the nav bar.
2. Drag and drop a receipt image onto the upload area, or click to open a file picker.
3. Supported formats: JPEG, PNG, WebP (any clear photo of a physical or digital receipt).
4. The image is uploaded securely to S3 via a presigned URL — it never passes through the app server.
5. The Lambda function is triggered automatically and runs Claude Vision OCR in the background.
6. When processing completes, the receipt appears in your Receipts list with source `AI OCR`.
7. The AI extracts: store name, date, total, line items (name, quantity, unit price, category).

**Tips for best results:**
- Take the photo in good lighting with the receipt flat.
- Make sure all text is in frame and in focus.
- Works with printed till receipts, email receipts screenshotted, and handwritten receipts.

---

### 5. Manual Entry

1. Go to **Manual Entry** in the nav bar.
2. Fill in the **Store Name** (required) and **Date** (defaults to today).
3. Add line items — each item needs at least a name and a price:
   - **Item Name** — what you bought
   - **Qty** — quantity (default 1, supports decimals)
   - **Price ($)** — unit price in dollars
   - **Category** — choose from the 9 categories below
4. Click **Add Item** (dashed button) to add more rows.
5. Click the trash icon on any row to remove it (you must keep at least one row).
6. The **Total** at the bottom of the items section auto-calculates as you type.
7. Click **Save Receipt** — you are taken straight to the receipt detail page.

**Available categories:**

| Category | Typical use |
|---|---|
| Groceries | Supermarket, fresh food |
| Electronics | Tech, gadgets, accessories |
| Dining | Restaurants, cafes, takeaway |
| Medicine | Pharmacy, health products |
| Household | Cleaning, appliances, furniture |
| Personal Care | Toiletries, cosmetics, haircuts |
| Travel | Transport, hotels, fuel |
| Entertainment | Cinema, streaming, events |
| General | Anything that doesn't fit above |

---

### 6. Amazon CSV Import

This lets you bulk-import your complete Amazon order history in seconds, with no AI cost — it reads structured CSV data directly.

**Step 1 — Download your Amazon order history:**

1. Go to [amazon.com](https://amazon.com) and click **Returns & Orders**.
2. Click **Download order reports** at the top of the page.
3. Select your date range (you can go back years).
4. Click **Request Report** — Amazon emails you a download link within a few minutes.
5. Download the `.csv` file from that email.

**Step 2 — Import into ReceiptIQ:**

1. Go to **Import Amazon** in the nav bar.
2. Click the upload area and select your downloaded CSV file.
3. Click **Import** — orders appear in your Receipts list immediately.

**What gets imported:**
- Each Amazon order becomes one receipt with source `Amazon CSV Import`.
- Line items are populated with item name, ASIN, quantity, and unit price.
- Duplicate orders (same Order ID) are automatically skipped, so you can safely re-upload older files or files with overlapping date ranges.
- The import is free — no AI processing is used for structured CSV data.

---

## Data Model

Each receipt stores the following:

| Field | Description |
|---|---|
| Store Name | Where the purchase was made |
| Store Chain | Normalised chain name (e.g. "Whole Foods Market") |
| Date | Date of the transaction |
| Total Amount | Full receipt total |
| Currency | Default USD |
| Source | How it was added (manual / upload / amazon_csv / lambda_ocr) |
| Image URL | CloudFront URL to the receipt photo (if uploaded) |
| Needs Review | Flag set by AI when confidence is low |

Each line item stores: item name, normalised item name (for price history), quantity, unit, unit price, line total, category, brand, ASIN (Amazon items only).

---

## Known Limitations (MVP)

- **No pagination** — the receipts list shows a maximum of 50 receipts. Oldest receipts beyond 50 are not displayed (they are still in the database).
- **AI OCR requires Anthropic API key** — without it the image is stored but not processed. Contact the admin to enable it.
- **No email or OAuth login** — only email + password accounts.
- **No mobile app** — the web app is responsive and works on mobile browsers, but there is no native iOS or Android app.
- **No export** — there is no CSV or PDF export of your data yet.
- **No search or filter** — you cannot search receipts by store, date range, or category from the UI yet.
- **Single currency** — amounts are displayed in USD regardless of the original currency on the receipt.
