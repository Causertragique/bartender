import { RequestHandler } from "express";

interface SAQProductDetails {
  category?: string;
  subcategory?: string;
  origin?: string;
  price?: number;
  description?: string;
}

export const handleSAQScrape: RequestHandler = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!url.includes("saq.com")) {
      return res.status(400).json({ error: "URL must be from saq.com" });
    }

    // Fetch the SAQ product page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch SAQ page" });
    }

    const html = await response.text();
    const details: SAQProductDetails = {};

    // Extract price - SAQ uses various patterns
    const pricePatterns = [
      /"price":\s*"([^"]+)"/,
      /"price":\s*([0-9.]+)/,
      /data-price="([^"]+)"/,
      /data-price="([0-9.]+)"/,
      /prix[^>]*>([^<]+)</i,
      /class="[^"]*price[^"]*"[^>]*>([^<]+)</i,
      /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)</i,
      /\$([0-9]+[.,][0-9]{2})/,
      /([0-9]+[.,][0-9]{2})\s*\$/,
      /([0-9]+[.,][0-9]{2})\s*CAD/i,
      /prix.*?([0-9]+[.,][0-9]{2})/i
    ];
    
    for (const pattern of pricePatterns) {
      const priceMatch = html.match(pattern);
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/[^0-9.,]/g, "").replace(",", ".");
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0 && price < 10000) { // Reasonable price range
          details.price = price;
          console.log(`Price extracted: ${price} from pattern`);
          break;
        }
      }
    }

    // Extract category from URL or breadcrumbs
    // SAQ URLs often contain category: /fr/produits/spiritueux/... or /fr/produits/vin/...
    const urlCategoryMatch = url.match(/\/produits\/([^\/]+)/);
    if (urlCategoryMatch) {
      const urlCategory = urlCategoryMatch[1].toLowerCase();
      // Map SAQ URL categories to our categories
      if (urlCategory.includes("spiritueux") || urlCategory === "spirits") {
        details.category = "spirits";
      } else if (urlCategory.includes("vin") || urlCategory === "wine") {
        details.category = "wine";
      } else if (urlCategory.includes("bière") || urlCategory.includes("beer") || urlCategory.includes("cidre")) {
        details.category = "beer";
      }
    }
    
    // Also try to extract from HTML metadata
    const categoryMatch = html.match(/"category":\s*"([^"]+)"/) ||
                         html.match(/data-category="([^"]+)"/) ||
                         html.match(/<meta[^>]*property="product:category"[^>]*content="([^"]+)"/i) ||
                         html.match(/breadcrumb[^>]*>.*?spiritueux|vin|bière/i);
    if (categoryMatch && !details.category) {
      const category = categoryMatch[1]?.toLowerCase() || "";
      // Map SAQ categories to our categories
      if (category.includes("spiritueux") || category.includes("spirits")) {
        details.category = "spirits";
      } else if (category.includes("vin") || category.includes("wine")) {
        details.category = "wine";
      } else if (category.includes("bière") || category.includes("beer")) {
        details.category = "beer";
      }
    }
    
    // Extract subcategory from URL (e.g., /spiritueux/vodka/)
    const subcategoryMatch = url.match(/\/produits\/[^\/]+\/([^\/]+)/);
    if (subcategoryMatch) {
      details.subcategory = subcategoryMatch[1];
    }

    // Extract origin/provenance
    const originPatterns = [
      /"origin":\s*"([^"]+)"/,
      /"country":\s*"([^"]+)"/,
      /provenance[^>]*>([^<]+)</i,
      /pays[^>]*>([^<]+)</i,
      /pays d'origine[^>]*>([^<]+)</i,
      /origine[^>]*>([^<]+)</i,
      /<span[^>]*class="[^"]*origin[^"]*"[^>]*>([^<]+)</i,
      /<span[^>]*class="[^"]*country[^"]*"[^>]*>([^<]+)</i
    ];
    
    for (const pattern of originPatterns) {
      const originMatch = html.match(pattern);
      if (originMatch && originMatch[1] && originMatch[1].trim() && originMatch[1].trim().length > 0) {
        details.origin = originMatch[1].trim();
        console.log(`Origin extracted: ${details.origin}`);
        break;
      }
    }

    // Extract subcategory from HTML if not already found from URL
    if (!details.subcategory) {
      const subcategoryHtmlMatch = html.match(/"subcategory":\s*"([^"]+)"/) ||
                                 html.match(/data-subcategory="([^"]+)"/);
      if (subcategoryHtmlMatch) {
        details.subcategory = subcategoryHtmlMatch[1];
      }
    }

    res.json(details);
  } catch (error) {
    console.error("Error scraping SAQ page:", error);
    res.status(500).json({ error: "Failed to scrape SAQ page" });
  }
};

