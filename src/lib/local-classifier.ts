/**
 * Local classification engine — no API calls.
 *
 * Tier 1: Exact DB lookup  — reuses previous classifications instantly
 * Tier 2: Keyword rules    — covers 90%+ of grocery/retail items
 *
 * Falls back to Claude Haiku ONLY for items that pass through both tiers
 * without a match. Over time this should be < 5% of items.
 */

import type { ClassificationResult } from "./product-classifier";

// ── Keyword rules ──────────────────────────────────────────────────────────────
// Each entry: [keywords[], productGroup, subCategory]
// Checked in order — first match wins. Keywords are checked against the
// lowercased, brand-stripped item name.

type Rule = [string[], string, string];

const RULES: Rule[] = [
  // ── Produce — Fruits ─────────────────────────────────────────────────────
  [["banana"],                                      "Banana",             "Produce — Fruits"],
  [["plantain"],                                    "Plantain",           "Produce — Fruits"],
  [["apple", "gala", "fuji", "granny smith", "cosmic crisp", "honeycrisp"], "Apple", "Produce — Fruits"],
  [["orange", "clementine", "mandarin", "tangerine", "satsuma"], "Oranges", "Produce — Fruits"],
  [["grape", "raisin"],                             "Grapes",             "Produce — Fruits"],
  [["strawberr"],                                   "Strawberries",       "Produce — Fruits"],
  [["blueberr"],                                    "Blueberries",        "Produce — Fruits"],
  [["raspberr"],                                    "Raspberries",        "Produce — Fruits"],
  [["blackberr"],                                   "Blackberries",       "Produce — Fruits"],
  [["watermelon"],                                  "Watermelon",         "Produce — Fruits"],
  [["cantaloupe", "honeydew", "melon"],             "Melon",              "Produce — Fruits"],
  [["mango"],                                       "Mango",              "Produce — Fruits"],
  [["pineapple"],                                   "Pineapple",          "Produce — Fruits"],
  [["papaya"],                                      "Papaya",             "Produce — Fruits"],
  [["guava"],                                       "Guava",              "Produce — Fruits"],
  [["kiwi"],                                        "Kiwi",               "Produce — Fruits"],
  [["lemon"],                                       "Lemons",             "Produce — Fruits"],
  [["lime"],                                        "Limes",              "Produce — Fruits"],
  [["pear"],                                        "Pear",               "Produce — Fruits"],
  [["peach", "nectarine"],                          "Peaches",            "Produce — Fruits"],
  [["plum", "prune"],                               "Plums",              "Produce — Fruits"],
  [["cherry", "cherries"],                          "Cherries",           "Produce — Fruits"],
  [["avocado"],                                     "Avocado",            "Produce — Fruits"],
  [["coconut"],                                     "Coconut",            "Produce — Fruits"],
  [["pomegranate"],                                 "Pomegranate",        "Produce — Fruits"],
  [["fig"],                                         "Figs",               "Produce — Fruits"],
  [["date fruit", "medjool"],                       "Dates",              "Produce — Fruits"],
  [["jackfruit"],                                   "Jackfruit",          "Produce — Fruits"],
  [["passion fruit"],                               "Passion Fruit",      "Produce — Fruits"],
  [["dragon fruit"],                                "Dragon Fruit",       "Produce — Fruits"],
  [["lychee", "litchi"],                            "Lychee",             "Produce — Fruits"],
  [["chiku", "sapota"],                             "Chikoo",             "Produce — Fruits"],

  // ── Produce — Vegetables ─────────────────────────────────────────────────
  [["broccoli"],                                    "Broccoli",           "Produce — Vegetables"],
  [["spinach", "palak"],                            "Spinach",            "Produce — Vegetables"],
  [["kale"],                                        "Kale",               "Produce — Vegetables"],
  [["lettuce", "romaine", "arugula", "mixed green"], "Salad Greens",      "Produce — Vegetables"],
  [["cabbage"],                                     "Cabbage",            "Produce — Vegetables"],
  [["cauliflower", "gobi"],                         "Cauliflower",        "Produce — Vegetables"],
  [["carrot", "gajar"],                             "Carrots",            "Produce — Vegetables"],
  [["celery"],                                      "Celery",             "Produce — Vegetables"],
  [["cucumber", "kakdi"],                           "Cucumber",           "Produce — Vegetables"],
  [["zucchini", "courgette"],                       "Zucchini",           "Produce — Vegetables"],
  [["tomato"],                                      "Tomatoes",           "Produce — Vegetables"],
  [["potato", "aloo"],                              "Potatoes",           "Produce — Vegetables"],
  [["sweet potato", "yam"],                         "Sweet Potatoes",     "Produce — Vegetables"],
  [["onion", "pyaz"],                               "Onions",             "Produce — Vegetables"],
  [["garlic", "lahsun"],                            "Garlic",             "Produce — Vegetables"],
  [["ginger", "adrak"],                             "Ginger",             "Produce — Vegetables"],
  [["pepper", "capsicum", "jalapeno", "chilli", "chili"], "Peppers",      "Produce — Vegetables"],
  [["eggplant", "brinjal", "baingan"],              "Eggplant",           "Produce — Vegetables"],
  [["mushroom"],                                    "Mushrooms",          "Produce — Vegetables"],
  [["green bean", "french bean"],                   "Green Beans",        "Produce — Vegetables"],
  [["peas", "matar"],                               "Peas",               "Produce — Vegetables"],
  [["corn", "maize"],                               "Corn",               "Produce — Vegetables"],
  [["asparagus"],                                   "Asparagus",          "Produce — Vegetables"],
  [["beetroot", "beet"],                            "Beets",              "Produce — Vegetables"],
  [["radish", "mooli"],                             "Radish",             "Produce — Vegetables"],
  [["turnip", "shalgam"],                           "Turnips",            "Produce — Vegetables"],
  [["pumpkin", "squash", "butternut"],              "Squash",             "Produce — Vegetables"],
  [["bitter gourd", "karela"],                      "Bitter Gourd",       "Produce — Vegetables"],
  [["bottle gourd", "lauki", "doodhi"],             "Bottle Gourd",       "Produce — Vegetables"],
  [["ridge gourd", "turai"],                        "Ridge Gourd",        "Produce — Vegetables"],
  [["drumstick", "moringa"],                        "Drumstick",          "Produce — Vegetables"],
  [["okra", "bhindi", "lady finger"],               "Okra",               "Produce — Vegetables"],
  [["fenugreek", "methi"],                          "Fenugreek",          "Produce — Vegetables"],
  [["curry leave", "curry leaf"],                   "Curry Leaves",       "Produce — Vegetables"],
  [["coleslaw"],                                    "Coleslaw",           "Produce — Vegetables"],
  [["sugar snap pea", "snap pea"],                  "Snap Peas",          "Produce — Vegetables"],
  [["winter melon", "ash gourd"],                   "Winter Melon",       "Produce — Vegetables"],
  [["taro", "arbi", "colocasia"],                   "Taro",               "Produce — Vegetables"],
  [["yuca", "cassava", "tapioca"],                  "Cassava",            "Produce — Vegetables"],

  // ── Dairy & Eggs ─────────────────────────────────────────────────────────
  [["milk", "whole milk", "2% milk", "skim milk", "oat milk", "almond milk", "soy milk"], "Milk", "Dairy & Eggs"],
  [["egg", "eggs"],                                 "Eggs",               "Dairy & Eggs"],
  [["butter"],                                      "Butter",             "Dairy & Eggs"],
  [["cheese", "paneer", "mozzarella", "cheddar", "parmesan"], "Cheese",   "Dairy & Eggs"],
  [["yogurt", "curd", "dahi"],                      "Yogurt",             "Dairy & Eggs"],
  [["cream", "creamer"],                            "Cream",              "Dairy & Eggs"],
  [["ghee"],                                        "Ghee",               "Dairy & Eggs"],
  [["sour cream"],                                  "Sour Cream",         "Dairy & Eggs"],

  // ── Meat & Poultry ────────────────────────────────────────────────────────
  [["chicken breast", "chicken thigh", "chicken wing", "chicken leg", "chicken drumstick"], "Chicken", "Meat & Poultry"],
  [["ground chicken", "ground turkey", "ground beef", "ground pork"], "Ground Meat", "Meat & Poultry"],
  [["chicken"],                                     "Chicken",            "Meat & Poultry"],
  [["turkey"],                                      "Turkey",             "Meat & Poultry"],
  [["beef", "steak", "brisket"],                    "Beef",               "Meat & Poultry"],
  [["pork", "bacon", "ham", "sausage"],             "Pork",               "Meat & Poultry"],
  [["lamb", "mutton"],                              "Lamb",               "Meat & Poultry"],
  [["goat", "chevon"],                              "Goat",               "Meat & Poultry"],

  // ── Seafood ───────────────────────────────────────────────────────────────
  [["salmon"],                                      "Salmon",             "Seafood"],
  [["tuna"],                                        "Tuna",               "Seafood"],
  [["shrimp", "prawn"],                             "Shrimp",             "Seafood"],
  [["tilapia", "cod", "haddock", "pompano", "fish fillet", "fish"], "Fish", "Seafood"],
  [["crab", "lobster", "clam", "oyster", "mussel", "scallop"], "Shellfish", "Seafood"],

  // ── Dairy & Beverages ─────────────────────────────────────────────────────
  [["juice", "orange juice", "apple juice"],        "Juice",              "Beverages"],
  [["coffee", "espresso"],                          "Coffee",             "Beverages"],
  [["tea", "chai"],                                 "Tea",                "Beverages"],
  [["water", "sparkling water", "mineral water"],   "Water",              "Beverages"],
  [["soda", "cola", "sprite", "pepsi"],             "Soda",               "Beverages"],
  [["ginger beer", "kombucha"],                     "Ginger Beer",        "Beverages"],
  [["energy drink", "red bull"],                    "Energy Drink",       "Beverages"],

  // ── Cereals & Grains ─────────────────────────────────────────────────────
  [["rice", "basmati", "jasmine rice", "brown rice"], "Rice",             "Cereals & Grains"],
  [["idly rice", "idli rice"],                      "Idly Rice",          "Cereals & Grains"],
  [["oat", "oatmeal", "granola"],                   "Oats",               "Cereals & Grains"],
  [["pasta", "spaghetti", "noodle", "macaroni"],    "Pasta",              "Cereals & Grains"],
  [["flour", "atta", "maida", "besan", "chickpea flour"], "Flour",        "Cereals & Grains"],
  [["bread", "toast", "baguette", "sourdough", "chapati", "roti", "pita"], "Bread", "Bakery & Bread"],
  [["tortilla", "wrap"],                            "Tortillas",          "Bakery & Bread"],
  [["lentil", "dal", "dhal", "toor", "urad", "chana", "moong", "masoor"], "Lentils", "Cereals & Grains"],
  [["quinoa", "millet", "ragi", "sorghum", "bajra"], "Whole Grains",      "Cereals & Grains"],
  [["semolina", "suji", "rava"],                    "Semolina",           "Cereals & Grains"],
  [["poha", "flattened rice"],                      "Poha",               "Cereals & Grains"],

  // ── Bakery & Bread ────────────────────────────────────────────────────────
  [["cake", "cupcake", "muffin"],                   "Cake",               "Bakery & Bread"],
  [["cookie", "biscuit"],                           "Cookies",            "Bakery & Bread"],
  [["donut", "doughnut"],                           "Donuts",             "Bakery & Bread"],
  [["croissant", "pastry"],                         "Pastry",             "Bakery & Bread"],
  [["bagel"],                                       "Bagels",             "Bakery & Bread"],

  // ── Snacks & Chips ────────────────────────────────────────────────────────
  [["chip", "crisp", "pringles", "doritos", "cheeto", "cheez-it"], "Chips", "Snacks & Chips"],
  [["popcorn"],                                     "Popcorn",            "Snacks & Chips"],
  [["pretzel"],                                     "Pretzels",           "Snacks & Chips"],
  [["cracker"],                                     "Crackers",           "Snacks & Chips"],
  [["peanut", "almond", "cashew", "walnut", "pistachio", "mixed nut"], "Nuts", "Snacks & Chips"],
  [["chocolate", "candy", "sweet", "gummy"],        "Candy",              "Snacks & Chips"],
  [["murukku", "chakli", "chekkalu", "chekodilu", "boondhi", "mixture"], "Indian Snacks", "Snacks & Chips"],

  // ── Condiments & Spices ───────────────────────────────────────────────────
  [["oil", "olive oil", "sunflower oil", "vegetable oil", "coconut oil"], "Cooking Oil", "Condiments & Spices"],
  [["salt"],                                        "Salt",               "Condiments & Spices"],
  [["sugar", "jaggery", "gur"],                     "Sugar",              "Condiments & Spices"],
  [["honey"],                                       "Honey",              "Condiments & Spices"],
  [["vinegar"],                                     "Vinegar",            "Condiments & Spices"],
  [["ketchup", "catsup"],                           "Ketchup",            "Condiments & Spices"],
  [["sauce", "pasta sauce", "tomato sauce", "hot sauce", "soy sauce"], "Sauce", "Condiments & Spices"],
  [["spice", "masala", "cumin", "coriander", "turmeric", "pepper", "paprika", "oregano", "basil", "thyme"], "Spices", "Condiments & Spices"],
  [["mustard"],                                     "Mustard",            "Condiments & Spices"],
  [["mayonnaise", "mayo"],                          "Mayo",               "Condiments & Spices"],

  // ── Frozen Foods ─────────────────────────────────────────────────────────
  [["ice cream", "gelato", "sorbet"],               "Ice Cream",          "Frozen Foods"],
  [["frozen pizza"],                                "Frozen Pizza",       "Frozen Foods"],
  [["frozen vegetable", "frozen pea", "frozen corn", "frozen broccoli"], "Frozen Vegetables", "Frozen Foods"],
  [["frozen fruit", "frozen berry", "frozen mango"], "Frozen Fruit",      "Frozen Foods"],
  [["hash brown"],                                  "Hash Browns",        "Frozen Foods"],
  [["frozen dumpling", "frozen dim sum", "frozen gyoza"], "Frozen Dumplings", "Frozen Foods"],
  [["frozen"],                                      "Frozen Foods",       "Frozen Foods"],

  // ── Canned & Packaged ────────────────────────────────────────────────────
  [["canned tomato", "diced tomato", "crushed tomato", "tomato paste"], "Canned Tomatoes", "Canned & Packaged"],
  [["canned bean", "baked bean", "chickpea", "kidney bean"], "Canned Beans", "Canned & Packaged"],
  [["canned soup", "soup", "broth", "stock"],       "Soup",               "Canned & Packaged"],
  [["coconut milk"],                                "Coconut Milk",       "Canned & Packaged"],

  // ── International Foods ───────────────────────────────────────────────────
  [["vada", "wada"],                                "Vada",               "International Foods"],
  [["idli", "idly"],                                "Idli",               "International Foods"],
  [["dosa"],                                        "Dosa",               "International Foods"],
  [["samosa"],                                      "Samosa",             "International Foods"],
  [["puff", "veg puff", "kachori"],                 "Puff Pastry",        "International Foods"],
  [["batter", "idli batter", "dosa batter"],        "Batter",             "International Foods"],
  [["chapati", "roti", "paratha", "naan"],          "Chapati",            "International Foods"],
  [["halwa", "ladoo", "barfi", "mithai", "sweet"],  "Indian Sweets",      "International Foods"],
  [["papad", "papadum"],                            "Papad",              "International Foods"],
  [["pickle", "achar"],                             "Pickle",             "International Foods"],
  [["chutney"],                                     "Chutney",            "International Foods"],
  [["soy sauce", "teriyaki", "miso", "kimchi", "ramen"], "Asian Foods",   "International Foods"],

  // ── Household ────────────────────────────────────────────────────────────
  [["detergent", "laundry", "tide", "gain", "persil"], "Laundry Detergent", "Laundry"],
  [["dish soap", "dishwasher"],                     "Dish Soap",          "Cleaning"],
  [["toilet paper", "tissue", "paper towel", "napkin"], "Paper Products", "Paper Products"],
  [["broom", "mop", "vacuum"],                      "Cleaning Tools",     "Cleaning"],
  [["trash bag", "garbage bag"],                    "Trash Bags",         "Cleaning"],
  [["cleaner", "disinfectant", "bleach", "wipe"],   "Cleaning Supplies",  "Cleaning"],
  [["storage", "container", "bag"],                 "Storage",            "Storage & Organization"],

  // ── Personal Care ────────────────────────────────────────────────────────
  [["shampoo", "conditioner"],                      "Shampoo",            "Hair Care"],
  [["toothpaste", "toothbrush", "mouthwash", "dental", "floss"], "Dental Care", "Oral Care"],
  [["soap", "body wash", "shower gel"],             "Body Wash",          "Skin Care"],
  [["lotion", "moisturizer", "sunscreen"],          "Skin Care",          "Skin Care"],
  [["deodorant", "antiperspirant"],                 "Deodorant",          "Skin Care"],
  [["face mask", "mask"],                           "Face Mask",          "Medicine & Health"],
  [["vitamin", "supplement", "probiotic"],          "Supplements",        "Medicine & Health"],
  [["pain reliever", "ibuprofen", "tylenol", "aspirin", "advil"], "Pain Relief", "Medicine & Health"],
];

// ── Brand names to strip before matching ──────────────────────────────────────
const BRANDS = [
  "good & gather", "market pantry", "threshold", "simply balanced", "up & up",
  "open nature", "kirkland", "great value", "equate", "sam's choice",
  "365 by whole foods", "365 everyday", "favorite day", "laxmi", "swad",
  "ptdr", "patidar", "grb", "vijay", "perdue", "tyson", "kerrygold",
  "pepperidge farm", "cape cod", "new york bakery", "outshine", "madegood",
  "p.f. chang", "maruchan", "nestlé", "nestle", "general mills", "puglisi",
  "famland", "telugu", "ks ", "brio", "grb",
];

function stripBrands(name: string): string {
  let n = name.toLowerCase().replace(/[™®©]/g, "");
  for (const b of BRANDS) n = n.replace(b, " ");
  // Strip sizes/weights
  n = n.replace(/\d+(\.\d+)?\s*(oz|lb|lbs|g|kg|ml|l|pk|ct|pc|pcs|gal|pint|qt|fl oz)\b/gi, " ");
  return n.replace(/\s{2,}/g, " ").trim();
}

// Words that signal a packaged/processed product — their presence means the
// item is not raw produce even if a fruit/vegetable keyword also appears.
const PACKAGED_SIGNALS = [
  "cereal", "granola", "bar", "crunch", "flakes", "chips", "crisps",
  "cookie", "cracker", "muffin", "cake", "bread", "pudding", "pie",
  "sauce", "juice", "jam", "jelly", "yogurt", "smoothie", "drink",
  "mix", "powder", "extract", "flavored", "flavour", "gummy",
];

// Sub-categories whose rules are ingredient-level and can fire incorrectly on
// packaged products that merely contain the ingredient as a flavour.
const PRODUCE_SUBCATS = new Set(["Produce — Fruits", "Produce — Vegetables"]);

export function classifyByKeyword(itemName: string): ClassificationResult | null {
  const clean = stripBrands(itemName);

  // Count meaningful words to gauge name complexity.
  const wordCount = clean.split(/\s+/).filter(w => w.length > 1).length;

  // Long names (4+ words) are complex packaged products. Skip straight to
  // Claude so it can use full context rather than substring guessing.
  if (wordCount >= 4) return null;

  // Even for short names, don't fire produce rules if a packaged-product
  // signal word is present (e.g. "Banana Chips", "Apple Juice").
  const hasPackagedSignal = PACKAGED_SIGNALS.some(s => clean.includes(s));

  for (const [keywords, productGroup, subCategory] of RULES) {
    if (hasPackagedSignal && PRODUCE_SUBCATS.has(subCategory)) continue;
    for (const kw of keywords) {
      if (clean.includes(kw)) {
        return { productGroup, subCategory };
      }
    }
  }
  return null;
}
