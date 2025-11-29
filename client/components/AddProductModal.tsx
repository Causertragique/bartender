import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/contexts/I18nContext";
import { Product } from "./ProductCard";
import { Download, RefreshCw, Search, Image as ImageIcon } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}: AddProductModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    origin: "",
    quantity: "",
    pricePerBottle: "",
    inventoryCode: "",
    imageUrl: "",
  });

  // Load product data when editing
  useEffect(() => {
    if (editingProduct && isOpen) {
      // Map product category back to form category
      const mapProductCategoryToFormCategory = (
        category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other"
      ): string => {
        if (category === "spirits") return "spirits";
        if (category === "beer") return "beer";
        if (category === "wine") return "wine";
        if (category === "soda") return "readyToDrink";
        if (category === "juice") return "snacks";
        return "snacks"; // Default for "other"
      };

      setFormData({
        name: editingProduct.name || "",
        category: mapProductCategoryToFormCategory(editingProduct.category),
        subcategory: "",
        origin: "",
        quantity: editingProduct.quantity.toString() || "",
        pricePerBottle: editingProduct.price.toString() || "",
        inventoryCode: editingProduct.id || "",
        imageUrl: editingProduct.imageUrl || "",
      });
      setWasCodeManuallySet(true); // Don't auto-generate when editing
    } else if (!editingProduct && isOpen) {
      // Reset form when adding new product
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        origin: "",
        quantity: "",
        pricePerBottle: "",
        inventoryCode: "",
        imageUrl: "",
      });
      setWasCodeManuallySet(false);
    }
  }, [editingProduct, isOpen]);

  const [qrCodeValue, setQrCodeValue] = useState("");
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    imageUrl: string;
    productPageUrl: string;
    title: string;
    snippet?: string;
  }>>([]);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 5;
  const MAX_PAGES = 3;
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch product options from SAQ.com (returns multiple results)
  // MUST be defined before searchProductImage
  // Simple search: each word in product name becomes a keyword
  const fetchProductOptions = async (
    searchQuery: string,
    productName: string
  ): Promise<Array<{
    imageUrl: string;
    productPageUrl: string;
    title: string;
    snippet?: string;
  }>> => {
    try {
      // Check for API keys in environment variables or localStorage
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('google_api_key');
      const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX || localStorage.getItem('google_cx');

      console.log("API Key present:", !!GOOGLE_API_KEY, "CX present:", !!GOOGLE_CX);

      if (GOOGLE_API_KEY && GOOGLE_CX && GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY') {
        try {
          // Simple search: split product name into words and use each as keyword
          // Example: "Vodka Smirnoff" -> "Vodka Smirnoff" (all words as keywords)
          const keywords = productName.trim().split(/\s+/).filter(word => word.length > 0);
          const searchQuery = keywords.join(' '); // Simple space-separated keywords
          
          console.log("Search keywords:", keywords);
          console.log("Search query:", searchQuery);
          
          // First, do a web search to find product pages (up to 15 results = 3 pages of 5)
          // Google API limits to 10 results per request, so we need 2 requests to get 15
          console.log("Fetching product pages from Google API...");
          
          let allItems: any[] = [];
          
          // First request: get first 10 results
          const webSearchUrl1 = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&num=10&safe=active`;
          const webResponse1 = await fetch(webSearchUrl1);
          
          if (webResponse1.ok) {
            const webData1 = await webResponse1.json();
            if (webData1.items) {
              allItems.push(...webData1.items);
            }
            
            // Second request: get next 5 results (if we have more pages)
            if (webData1.queries?.nextPage && allItems.length >= 10) {
              const startIndex = 11; // Start from result 11
              const webSearchUrl2 = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&num=10&start=${startIndex}&safe=active`;
              const webResponse2 = await fetch(webSearchUrl2);
              
              if (webResponse2.ok) {
                const webData2 = await webResponse2.json();
                if (webData2.items) {
                  allItems.push(...webData2.items);
                }
              }
            }
          }
          
          console.log(`Total items found: ${allItems.length}`);
          
          if (allItems.length > 0) {
            // Filter to get SAQ product pages (up to 15)
            const saqProducts = allItems
              .filter((item: any) => item.link && item.link.includes('saq.com'))
              .slice(0, 15) // Limit to 15 products max (3 pages of 5)
              .map((item: any) => ({
                productPageUrl: item.link,
                title: item.title || '',
                snippet: item.snippet || '',
              }));
            
            console.log(`SAQ products found: ${saqProducts.length}`);
            
            if (saqProducts.length > 0) {
              // Now get images for each product page
              const results: Array<{
                imageUrl: string;
                productPageUrl: string;
                title: string;
                snippet?: string;
              }> = [];
              
              // Search for images matching the products (up to 15)
              // Make 2 requests to get up to 15 images
              let allImageItems: any[] = [];
              
              // First image request: get first 10 results
              const imageSearchUrl1 = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&safe=active&imgSize=medium&imgType=photo`;
              const imageResponse1 = await fetch(imageSearchUrl1);
              
              if (imageResponse1.ok) {
                const imageData1 = await imageResponse1.json();
                if (imageData1.items) {
                  allImageItems.push(...imageData1.items);
                }
                
                // Second image request: get next 5 results
                if (imageData1.queries?.nextPage && allImageItems.length >= 10) {
                  const imageStartIndex = 11;
                  const imageSearchUrl2 = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&start=${imageStartIndex}&safe=active&imgSize=medium&imgType=photo`;
                  const imageResponse2 = await fetch(imageSearchUrl2);
                  
                  if (imageResponse2.ok) {
                    const imageData2 = await imageResponse2.json();
                    if (imageData2.items) {
                      allImageItems.push(...imageData2.items);
                    }
                  }
                }
              }
              
              const saqImages = allImageItems.filter((item: any) => 
                item.link && (item.link.includes('saq.com') || item.displayLink?.includes('saq.com'))
              );
              
              // Match images with product pages (up to 15 products)
              for (const product of saqProducts.slice(0, 15)) {
                const matchingImage = saqImages.find((img: any) => {
                  const contextLink = img.image?.contextLink || '';
                  return contextLink.includes(product.productPageUrl) || 
                         product.productPageUrl.includes(contextLink.split('/').slice(-2).join('/'));
                }) || saqImages[0]; // Fallback to first image if no match
                
                if (matchingImage) {
                  results.push({
                    imageUrl: matchingImage.link,
                    productPageUrl: product.productPageUrl,
                    title: product.title,
                    snippet: product.snippet,
                  });
                }
              }
              
              // If we have results, return them
              if (results.length > 0) {
                console.log(`Found ${results.length} product options`);
                const typedResults: Array<{
                  imageUrl: string;
                  productPageUrl: string;
                  title: string;
                  snippet?: string;
                }> = results;
                return typedResults;
              }
              
              // If no images found, return products without images (up to 15)
              return saqProducts.slice(0, 15).map(product => ({
                imageUrl: '',
                productPageUrl: product.productPageUrl,
                title: product.title,
                snippet: product.snippet,
              }));
            }
          }
        } catch (e) {
          console.error("Google Custom Search API failed:", e);
        }
      } else {
        console.log("API keys not configured or invalid");
      }

      // If no results found, return empty array
      return [];
    } catch (error) {
      console.error("Error fetching product options:", error);
      return [];
    }
  };

  // Auto-generate QR code when inventory code and name are both filled
  useEffect(() => {
    if (formData.inventoryCode && formData.name) {
      const qrData = JSON.stringify({
        id: formData.inventoryCode,
        name: formData.name,
        code: formData.inventoryCode,
        category: formData.category,
        price: formData.pricePerBottle,
      });
      setQrCodeValue(qrData);
    } else if (!formData.inventoryCode) {
      setQrCodeValue("");
    }
  }, [formData.inventoryCode, formData.name, formData.category, formData.pricePerBottle]);

  // Auto-generate inventory code if empty (only when name changes and code is still empty)
  const [wasCodeManuallySet, setWasCodeManuallySet] = useState(false);
  
  useEffect(() => {
    // Only auto-generate if:
    // 1. The code is empty
    // 2. There's a product name
    // 3. The user hasn't manually set a code
    if (!formData.inventoryCode && formData.name && !wasCodeManuallySet) {
      const code = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 8) + Date.now().toString().slice(-6);
      setFormData((prev) => ({ ...prev, inventoryCode: code }));
    }
  }, [formData.name, formData.inventoryCode, wasCodeManuallySet]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Track if user manually sets the inventory code
    if (field === "inventoryCode" && value) {
      setWasCodeManuallySet(true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({ ...prev, category, subcategory: "" }));
  };

  const getSubcategories = () => {
    const category = formData.category;
    if (category === "wine") {
      return [
        { value: "redWine", label: t.inventory.addProductModal.subcategories.redWine },
        { value: "whiteWine", label: t.inventory.addProductModal.subcategories.whiteWine },
        { value: "roseWine", label: t.inventory.addProductModal.subcategories.roseWine },
      ];
    } else if (category === "spirits") {
      return [
        { value: "scotchWhisky", label: t.inventory.addProductModal.subcategories.scotchWhisky },
        { value: "liqueurCream", label: t.inventory.addProductModal.subcategories.liqueurCream },
        { value: "gin", label: t.inventory.addProductModal.subcategories.gin },
        { value: "rum", label: t.inventory.addProductModal.subcategories.rum },
        { value: "vodka", label: t.inventory.addProductModal.subcategories.vodka },
        { value: "tequila", label: t.inventory.addProductModal.subcategories.tequila },
        { value: "cognacBrandy", label: t.inventory.addProductModal.subcategories.cognacBrandy },
      ];
    }
    return [];
  };

  const generateQRCode = () => {
    const code = formData.inventoryCode || `PROD-${Date.now()}`;
    const qrData = JSON.stringify({
      id: code,
      name: formData.name,
      code: code,
      category: formData.category,
      price: formData.pricePerBottle,
    });
    setQrCodeValue(qrData);
    // If inventory code is empty, set it
    if (!formData.inventoryCode) {
      setFormData((prev) => ({ ...prev, inventoryCode: code }));
      setWasCodeManuallySet(false);
    }
  };

  // Search for product image intelligently
  const searchProductImage = async () => {
    if (!formData.name.trim()) {
      alert(t.inventory.addProductModal.fillRequiredFields || "Veuillez d'abord entrer le nom du produit");
      return;
    }

    setIsSearchingImage(true);
    try {
      // Simple search: use product name as-is, each word becomes a keyword
      const productName = formData.name.trim();
      
      console.log("Searching for products on SAQ.com:", productName);
      console.log("Search limited to: https://www.saq.com/fr/produits");
      console.log("Each word in product name becomes a search keyword");
      
      // Search for multiple product options (each word is a keyword)
      const results = await fetchProductOptions(productName, productName);
      
      if (results && results.length > 0) {
        if (results.length === 1) {
          // If only one result, use it directly
          const result = results[0];
          await applyProductResult(result);
        } else {
          // If multiple results, show selection modal
          setSearchResults(results);
          setCurrentPage(1); // Reset to first page
          setShowProductSelection(true);
        }
      } else {
        // Provide helpful feedback when no image is found
        const hasGoogleApi = (import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('google_api_key')) &&
                            (import.meta.env.VITE_GOOGLE_CX || localStorage.getItem('google_cx'));
        const hasApiKey = hasGoogleApi;
        
        console.log("No image found. Has API key:", hasApiKey);
        
        if (!hasApiKey) {
          const message = t.inventory.addProductModal.imageApiNotConfigured || 
            "Pour utiliser la recherche automatique d'images, configurez une clé API Google Custom Search dans les paramètres.\n\n" +
            "Instructions :\n" +
            "1. Créez un projet sur https://console.cloud.google.com/\n" +
            "2. Activez l'API Custom Search\n" +
            "3. Créez un moteur de recherche sur https://cse.google.com/\n" +
            "4. Ajoutez les clés dans les paramètres de l'application\n\n" +
            "Sinon, vous pouvez entrer l'URL de l'image manuellement dans le champ ci-dessous.";
          alert(message);
        } else {
          const message = t.inventory.addProductModal.imageNotFound || 
            "Aucune image trouvée automatiquement. Vous pouvez entrer l'URL de l'image manuellement dans le champ ci-dessous.";
          alert(message);
        }
      }
    } catch (error) {
      console.error("Error searching for image:", error);
      if (!isMountedRef.current) return;
      const errorMessage = t.inventory.addProductModal.imageSearchError || 
        "Erreur lors de la recherche d'image. Vous pouvez entrer l'URL manuellement dans le champ ci-dessous.";
      alert(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsSearchingImage(false);
      }
    }
  };

  // Fetch product details from SAQ.com page via backend
  const fetchProductDetailsFromSAQ = async (productPageUrl: string): Promise<{
    category?: string;
    subcategory?: string;
    origin?: string;
    price?: number;
  } | null> => {
    try {
      if (!productPageUrl || !productPageUrl.includes('saq.com')) {
        return null;
      }
      
      // Use backend endpoint to scrape SAQ page (avoids CORS issues)
      const response = await fetch(`/api/saq-scrape?url=${encodeURIComponent(productPageUrl)}`);
      
      if (response.ok) {
        const details = await response.json();
        console.log("Product details extracted from SAQ:", details);
        return details;
      } else {
        console.log("Failed to fetch product details from backend");
        return null;
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  };

  // Apply selected product result to form
  const applyProductResult = async (result: {
    imageUrl: string;
    productPageUrl: string;
    title?: string;
  }) => {
    setIsSearchingImage(true);
    try {
      const details = await fetchProductDetailsFromSAQ(result.productPageUrl);
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      const updates: Partial<typeof formData> = { 
        imageUrl: result.imageUrl || "" 
      };
      
      // Fill product name from title if available and name field is empty
      if (result.title && result.title.trim()) {
        const currentName = formData.name.trim();
        // Only update name if it's empty or very short (less than 3 chars)
        if (!currentName || currentName.length < 3) {
          // Clean up the title (remove common prefixes/suffixes from SAQ)
          let cleanTitle = result.title.trim();
          // Remove common SAQ prefixes
          cleanTitle = cleanTitle.replace(/^SAQ\s*-\s*/i, '');
          cleanTitle = cleanTitle.replace(/\s*-\s*SAQ$/i, '');
          updates.name = cleanTitle;
        }
      }
      
      if (details) {
        // Map category
        if (details.category) {
          const categoryMap: Record<string, string> = {
            'spiritueux': 'spirits',
            'spirits': 'spirits',
            'vin': 'wine',
            'wine': 'wine',
            'bière': 'beer',
            'beer': 'beer',
            'cidre': 'beer',
            'champagne': 'wine',
            'aperitif': 'wine',
            'aperitifs': 'wine',
            'ready-to-drink': 'readyToDrink',
            'ready to drink': 'readyToDrink',
          };
          const categoryLower = details.category.toLowerCase().trim();
          const mappedCategory = categoryMap[categoryLower] || (categoryLower in categoryMap ? categoryMap[categoryLower] : details.category);
          if (mappedCategory) {
            updates.category = mappedCategory;
            console.log(`Category mapped: ${details.category} -> ${mappedCategory}`);
          }
        }
        
        // Map subcategory (normalize common subcategories)
        if (details.subcategory) {
          const subcategoryLower = details.subcategory.toLowerCase().trim();
          const subcategoryMap: Record<string, string> = {
            'vodka': 'vodka',
            'gin': 'gin',
            'rum': 'rum',
            'rhum': 'rum',
            'tequila': 'tequila',
            'whisky': 'scotchWhisky',
            'whiskey': 'scotchWhisky',
            'scotch': 'scotchWhisky',
            'cognac': 'cognacBrandy',
            'brandy': 'cognacBrandy',
            'liqueur': 'liqueurCream',
            'cream': 'liqueurCream',
            'crème': 'liqueurCream',
            'red wine': 'redWine',
            'vin rouge': 'redWine',
            'white wine': 'whiteWine',
            'vin blanc': 'whiteWine',
            'rosé': 'roseWine',
            'rose wine': 'roseWine',
            'vin rosé': 'roseWine',
          };
          const mappedSubcategory = subcategoryMap[subcategoryLower] || details.subcategory;
          updates.subcategory = mappedSubcategory;
        }
        
        // Map origin to match Select values
        if (details.origin && details.origin.trim()) {
          const originLower = details.origin.toLowerCase().trim();
          const originMap: Record<string, string> = {
            'canada': 'canadian',
            'canadien': 'canadian',
            'canadienne': 'canadian',
            'québec': 'quebec',
            'quebec': 'quebec',
            'québécois': 'quebec',
            'québécoise': 'quebec',
            'espagne': 'spain',
            'spain': 'spain',
            'france': 'france',
            'français': 'france',
            'française': 'france',
            'italie': 'italy',
            'italy': 'italy',
            'italien': 'italy',
            'italienne': 'italy',
            'états-unis': 'usa',
            'usa': 'usa',
            'united states': 'usa',
            'australie': 'australia',
            'australia': 'australia',
            'afrique du sud': 'southAfrica',
            'south africa': 'southAfrica',
            'nouvelle-zélande': 'newZealand',
            'new zealand': 'newZealand',
            'portugal': 'portugal',
            'chili': 'chile',
            'chile': 'chile',
            'royaume-uni': 'uk',
            'united kingdom': 'uk',
            'uk': 'uk',
          };
          const mappedOrigin = originMap[originLower] || details.origin.trim();
          updates.origin = mappedOrigin;
          console.log(`Origin mapped: ${details.origin} -> ${mappedOrigin}`);
        }
        
        // Fill price
        if (details.price) {
          updates.pricePerBottle = details.price.toString();
        }
      }
      
      setFormData((prev) => ({
        name: (updates.name ?? prev.name) || "",
        category: (updates.category ?? prev.category) || "",
        subcategory: (updates.subcategory ?? prev.subcategory) || "",
        origin: (updates.origin ?? prev.origin) || "",
        quantity: prev.quantity || "",
        pricePerBottle: (updates.pricePerBottle ?? prev.pricePerBottle) || "",
        inventoryCode: prev.inventoryCode || "",
        imageUrl: (updates.imageUrl ?? prev.imageUrl) || "",
      }));
      
      setShowProductSelection(false);
      
      if (details) {
        console.log("Product details applied automatically:", {
          name: updates.name || formData.name,
          category: updates.category,
          subcategory: updates.subcategory,
          origin: updates.origin,
          price: updates.pricePerBottle,
          imageUrl: updates.imageUrl,
        });
      }
    } catch (error) {
      console.error("Error applying product result:", error);
    } finally {
      if (isMountedRef.current) {
        setIsSearchingImage(false);
      }
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeValue) return;

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const fileName = `${formData.inventoryCode || "product"}-qr-code.png`;
      downloadLink.download = fileName;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.quantity || !formData.pricePerBottle) {
      alert(t.inventory.addProductModal.fillRequiredFields);
      return;
    }

    // Generate QR code if not already generated
    if (!qrCodeValue && formData.inventoryCode) {
      generateQRCode();
    }

    const product: Product = {
      // Use the inventory code as ID (can be modified during edit)
      id: formData.inventoryCode || `product-${Date.now()}`,
      name: formData.name,
      category: mapCategoryToProductCategory(formData.category),
      price: parseFloat(formData.pricePerBottle) || 0,
      quantity: parseInt(formData.quantity) || 0,
      unit: editingProduct?.unit || "bottles",
      lastRestocked: editingProduct?.lastRestocked || new Date().toISOString().split("T")[0],
      imageUrl: formData.imageUrl || undefined,
    };

    onSave(product);
    handleClose();
  };

  const mapCategoryToProductCategory = (
    category: string,
  ): "spirits" | "wine" | "beer" | "soda" | "juice" | "other" => {
    if (category === "spirits") return "spirits";
    if (category === "beer") return "beer";
    if (category === "wine" || category === "aperitif" || category === "champagne") return "wine";
    if (category === "readyToDrink") return "soda";
    return "other";
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      subcategory: "",
      origin: "",
      quantity: "",
      pricePerBottle: "",
      inventoryCode: "",
      imageUrl: "",
    });
    setQrCodeValue("");
    setWasCodeManuallySet(false);
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? t.inventory.addProductModal.editTitle || "Modifier le produit" : t.inventory.addProductModal.title}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? t.inventory.addProductModal.editDescription || "Modifiez les informations du produit" : t.inventory.addProductModal.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Product Name */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">{t.inventory.addProductModal.name} *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchProductImage}
                disabled={!formData.name.trim() || isSearchingImage}
                className="gap-2"
              >
                {isSearchingImage ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t.inventory.addProductModal.searchingImage || "Recherche..."}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    {t.inventory.addProductModal.searchImage || "Rechercher image"}
                  </>
                )}
              </Button>
            </div>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t.inventory.addProductModal.name}
            />
          </div>

          {/* Product Image URL */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="imageUrl">{t.inventory.addProductModal.imageUrl || "URL de l'image"}</Label>
            <div className="flex gap-4 items-start">
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              {formData.imageUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/50 shadow-md flex-shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt={formData.name || "Product image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Image+not+found";
                    }}
                  />
                </div>
              )}
            </div>
            {formData.imageUrl && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                Image trouvée et prête à être utilisée
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{t.inventory.addProductModal.category} *</Label>
            <Select
              value={formData.category || ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t.inventory.addProductModal.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spirits">
                  {t.inventory.addProductModal.categories.spirits}
                </SelectItem>
                <SelectItem value="beer">
                  {t.inventory.addProductModal.categories.beer}
                </SelectItem>
                <SelectItem value="wine">
                  {t.inventory.addProductModal.categories.wine}
                </SelectItem>
                <SelectItem value="aperitif">
                  {t.inventory.addProductModal.categories.aperitif}
                </SelectItem>
                <SelectItem value="champagne">
                  {t.inventory.addProductModal.categories.champagne}
                </SelectItem>
                <SelectItem value="readyToDrink">
                  {t.inventory.addProductModal.categories.readyToDrink}
                </SelectItem>
                <SelectItem value="snacks">
                  {t.inventory.addProductModal.categories.snacks}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {getSubcategories().length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">{t.inventory.addProductModal.subcategory}</Label>
              <Select
                value={formData.subcategory || ""}
                onValueChange={(value) => handleInputChange("subcategory", value)}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder={t.inventory.addProductModal.subcategory} />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategories().map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {sub.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Origin */}
          <div className="space-y-2">
            <Label htmlFor="origin">{t.inventory.addProductModal.origin}</Label>
            <Select
              value={formData.origin || ""}
              onValueChange={(value) => handleInputChange("origin", value)}
            >
              <SelectTrigger id="origin">
                <SelectValue placeholder={t.inventory.addProductModal.origin} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imported">
                  {t.inventory.addProductModal.origins.imported}
                </SelectItem>
                <SelectItem value="canadian">
                  {t.inventory.addProductModal.origins.canadian}
                </SelectItem>
                <SelectItem value="quebec">
                  {t.inventory.addProductModal.origins.quebec}
                </SelectItem>
                <SelectItem value="spain">
                  {t.inventory.addProductModal.origins.spain}
                </SelectItem>
                <SelectItem value="france">
                  {t.inventory.addProductModal.origins.france}
                </SelectItem>
                <SelectItem value="italy">
                  {t.inventory.addProductModal.origins.italy}
                </SelectItem>
                <SelectItem value="usa">
                  {t.inventory.addProductModal.origins.usa}
                </SelectItem>
                <SelectItem value="australia">
                  {t.inventory.addProductModal.origins.australia}
                </SelectItem>
                <SelectItem value="southAfrica">
                  {t.inventory.addProductModal.origins.southAfrica}
                </SelectItem>
                <SelectItem value="newZealand">
                  {t.inventory.addProductModal.origins.newZealand}
                </SelectItem>
                <SelectItem value="portugal">
                  {t.inventory.addProductModal.origins.portugal}
                </SelectItem>
                <SelectItem value="chile">
                  {t.inventory.addProductModal.origins.chile}
                </SelectItem>
                <SelectItem value="uk">
                  {t.inventory.addProductModal.origins.uk}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{t.inventory.addProductModal.quantity} *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity || ""}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Price per Bottle */}
          <div className="space-y-2">
            <Label htmlFor="pricePerBottle">{t.inventory.addProductModal.pricePerBottle} *</Label>
            <Input
              id="pricePerBottle"
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerBottle || ""}
              onChange={(e) => handleInputChange("pricePerBottle", e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Inventory Code */}
          <div className="space-y-2">
            <Label htmlFor="inventoryCode">
              {t.inventory.addProductModal.inventoryCode}
              <span className="text-xs text-muted-foreground ml-2">
                ({t.inventory.addProductModal.inventoryCodeHint})
              </span>
            </Label>
            <Input
              id="inventoryCode"
              value={formData.inventoryCode || ""}
              onChange={(e) => handleInputChange("inventoryCode", e.target.value)}
              placeholder={t.inventory.addProductModal.inventoryCodePlaceholder}
            />
          </div>

          {/* QR Code Generator */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>{t.inventory.addProductModal.qrCode}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  disabled={!formData.name || !formData.inventoryCode}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t.inventory.addProductModal.generateQR}
                </Button>
                {qrCodeValue && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t.inventory.addProductModal.downloadQR}
                  </Button>
                )}
              </div>
            </div>
            {qrCodeValue ? (
              <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg space-y-3">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrCodeValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {t.inventory.addProductModal.codeLabel}: {formData.inventoryCode}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-secondary rounded-lg border-2 border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground text-center">
                  {t.inventory.addProductModal.qrCodePlaceholder}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.inventory.addProductModal.cancel}
          </Button>
          <Button onClick={handleSave}>
            {t.inventory.addProductModal.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Product Selection Modal */}
    <Dialog 
      open={showProductSelection} 
      onOpenChange={(open) => {
        setShowProductSelection(open);
        if (!open) {
          setCurrentPage(1); // Reset to first page when closing
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner un produit</DialogTitle>
          <DialogDescription>
            Plusieurs produits correspondent à votre recherche. Sélectionnez celui que vous souhaitez ajouter, ou continuez sans sélectionner si aucun ne correspond.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {(() => {
            const totalPages = Math.min(Math.ceil(searchResults.length / PRODUCTS_PER_PAGE), MAX_PAGES);
            const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
            const endIndex = startIndex + PRODUCTS_PER_PAGE;
            const currentPageResults = searchResults.slice(startIndex, endIndex);
            
            return (
              <>
                {currentPageResults.map((result, index) => (
                  <div
                    key={startIndex + index}
                    onClick={async () => {
                      await applyProductResult(result);
                    }}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer"
                  >
                    {result.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground line-clamp-2">
                        {result.title}
                      </h3>
                      {result.snippet && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {result.snippet}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 break-all">
                        {result.productPageUrl}
                      </p>
                    </div>
                    <Button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await applyProductResult(result);
                      }}
                      className="flex-shrink-0"
                    >
                      Sélectionner
                    </Button>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages} ({searchResults.length} produit{searchResults.length > 1 ? 's' : ''})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowProductSelection(false);
              setCurrentPage(1);
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowProductSelection(false);
              setCurrentPage(1);
              // L'utilisateur peut continuer à remplir le formulaire manuellement
            }}
          >
            Aucun ne correspond - Continuer sans sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

