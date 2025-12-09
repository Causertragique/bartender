export interface SaqProductDetails {
  category?: string;
  subcategory?: string;
  origin?: string;
  price?: number;
  description?: string;
  bottleSizeInMl?: number;
}

const RESTAURANT_PRICE_PATTERNS = [
  /prix.*?restaura[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /restaura.*?prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /prix.*?professionnel[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /professionnel.*?prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /prix.*?gros[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /wholesale.*?price[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /"restaurantPrice":\s*"?([0-9]+[.,][0-9]{2})"?/i,
  /"wholesalePrice":\s*"?([0-9]+[.,][0-9]{2})"?/i,
];

const PRICE_PATTERNS = [
  /"price":\s*"([^"]+)"/,
  /"price":\s*([0-9.]+)/,
  /data-price="([^"]+)"/,
  /data-price="([0-9.]+)"/,
  /prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /class="[^"]*price[^"]*"[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /<span[^>]*class="[^"]*price[^"]*"[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /\$\s*([0-9]+[.,][0-9]{2})/,
  /([0-9]+[.,][0-9]{2})\s*\$/,
  /([0-9]+[.,][0-9]{2})\s*CAD/i,
];

const ORIGIN_PATTERNS = [
  /"origin":\s*"([^"]+)"/i,
  /"country":\s*"([^"]+)"/i,
  /provenance[^>]*>([^<]+)</i,
  /pays[^>]*>([^<]+)</i,
  /pays d'origine[^>]*>([^<]+)</i,
  /origine[^>]*>([^<]+)</i,
  /<span[^>]*class="[^"]*origin[^"]*"[^>]*>([^<]+)</i,
  /<span[^>]*class="[^"]*country[^"]*"[^>]*>([^<]+)</i,
];

const SUBCATEGORY_PATTERNS = [
  /"subcategory":\s*"([^"]+)"/i,
  /data-subcategory="([^"]+)"/i,
  /<meta[^>]*property="product:type"[^>]*content="([^"]+)"/i,
  /type[^>]*>([^<]+)</i,
  /breadcrumb[^>]*>.*?(vodka|gin|rum|whisky|whiskey|tequila|cognac|brandy|liqueur|vin rouge|vin blanc|ros[eé]|bi[eè]re|cidre)/i,
];

const BOTTLE_SIZE_PATTERNS = [
  /(\d+)\s*ml\b/i,
  /(\d+)\s*mL\b/,
  /volume[^>]*>(\d+)\s*ml/i,
  /size[^>]*>(\d+)\s*ml/i,
  /capacity[^>]*>(\d+)\s*ml/i,
  /"volume":\s*"(\d+)\s*ml"/i,
  /data-volume="(\d+)"/i,
  /(\d+)\s*cl\b/i,
  /volume[^>]*>(\d+)\s*cl/i,
];

const CATEGORY_MAP: Record<string, string> = {
  spiritueux: "spirits",
  spirits: "spirits",
  vin: "wine",
  wine: "wine",
  bière: "beer",
  biere: "beer",
  beer: "beer",
  cidre: "beer",
  champagne: "wine",
  aperitif: "wine",
  aperitifs: "wine",
  jus: "juice",
  juice: "juice",
  soda: "soda",
  "boisson gazeuse": "soda",
  "soft drink": "soda",
  "ready-to-drink": "readyToDrink",
  "ready to drink": "readyToDrink",
  autre: "other",
  other: "other",
  autres: "other",
};

const SUBCATEGORY_MAP: Record<string, string> = {
  vodka: "vodka",
  gin: "gin",
  rum: "rum",
  rhum: "rum",
  tequila: "tequila",
  whisky: "scotchWhisky",
  whiskey: "scotchWhisky",
  scotch: "scotchWhisky",
  cognac: "cognacBrandy",
  brandy: "cognacBrandy",
  liqueur: "liqueurCream",
  cream: "liqueurCream",
  crème: "liqueurCream",
  "red wine": "redWine",
  "vin rouge": "redWine",
  "white wine": "whiteWine",
  "vin blanc": "whiteWine",
  rosé: "roseWine",
  "rose wine": "roseWine",
  "vin rosé": "roseWine",
};

function normalizeText(value?: string | null) {
  return value?.toLowerCase().trim() ?? "";
}

function extractWithPatterns(html: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

function parseCategoryFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const urlCategoryMatch = url.match(/\/produits\/([^/]+)/i);
  if (!urlCategoryMatch) return undefined;
  const raw = normalizeText(urlCategoryMatch[1]);
  return CATEGORY_MAP[raw] || raw;
}

function parseSubcategoryFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const subcategoryMatch =
    url.match(/\/produits\/[^/]+\/([^/]+)/i) ||
    url.match(/\/spiritueux\/([^/]+)/i) ||
    url.match(/\/vin\/([^/]+)/i) ||
    url.match(/\/bi[eè]re\/([^/]+)/i);
  if (subcategoryMatch && subcategoryMatch[1]) {
    const clean = normalizeText(
      subcategoryMatch[1].replace(/^produits\//, "").replace(/\/$/, "")
    );
    return SUBCATEGORY_MAP[clean] || clean;
  }
  return undefined;
}

function parsePriceFromHtml(html: string): number | undefined {
  const candidates = [...RESTAURANT_PRICE_PATTERNS, ...PRICE_PATTERNS];
  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/[^0-9.,]/g, "").replace(",", ".");
      const price = parseFloat(priceStr);
      if (!Number.isNaN(price) && price > 0 && price < 10000) {
        return price;
      }
    }
  }
  return undefined;
}

function parseBottleSize(html: string): number | undefined {
  for (const pattern of BOTTLE_SIZE_PATTERNS) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let size = parseInt(match[1], 10);
      if (pattern.toString().includes("cl")) {
        size *= 10;
      }
      if (size >= 100 && size <= 5000) {
        return size;
      }
    }
  }
  return undefined;
}

function applyDefaultBottleSize(details: SaqProductDetails) {
  if (details.bottleSizeInMl) return;
  const cat = details.category;
  if (cat === "beer") details.bottleSizeInMl = 330;
  else if (cat === "wine" || cat === "spirits") details.bottleSizeInMl = 750;
  else if (cat === "juice") details.bottleSizeInMl = 1000;
  else if (cat === "soda") details.bottleSizeInMl = 355;
  else details.bottleSizeInMl = 500;
}

export function parseSaqProductPage(
  html: string,
  options?: { sourceUrl?: string }
): SaqProductDetails {
  const safeHtml = html || "";
  const details: SaqProductDetails = {};

  // Category from URL first
  details.category = parseCategoryFromUrl(options?.sourceUrl);

  // Category from HTML if missing
  if (!details.category) {
    const categoryRaw = extractWithPatterns(safeHtml, [
      /"category":\s*"([^"]+)"/i,
      /data-category="([^"]+)"/i,
      /<meta[^>]*property="product:category"[^>]*content="([^"]+)"/i,
      /breadcrumb[^>]*>.*?(spiritueux|spirits|vin|wine|bi[eè]re|beer)/i,
    ]);
    if (categoryRaw) {
      const normalized = normalizeText(categoryRaw);
      details.category = CATEGORY_MAP[normalized] || normalized;
    }
  }

  // Subcategory from URL first, then HTML
  details.subcategory = parseSubcategoryFromUrl(options?.sourceUrl);
  if (!details.subcategory) {
    const subcategoryRaw = extractWithPatterns(safeHtml, SUBCATEGORY_PATTERNS);
    if (subcategoryRaw) {
      const normalized = normalizeText(subcategoryRaw);
      details.subcategory = SUBCATEGORY_MAP[normalized] || normalized;
    }
  }

  // Origin
  const origin = extractWithPatterns(safeHtml, ORIGIN_PATTERNS);
  if (origin) {
    details.origin = origin;
  }

  // Price
  const price = parsePriceFromHtml(safeHtml);
  if (price) {
    details.price = price;
  }

  // Bottle size
  const bottleSize = parseBottleSize(safeHtml);
  if (bottleSize) {
    details.bottleSizeInMl = bottleSize;
  }

  applyDefaultBottleSize(details);
  return details;
}
