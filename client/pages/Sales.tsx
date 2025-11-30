import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PaymentModal from "@/components/PaymentModal";
import { Product } from "@/components/ProductCard";
import { Trash2, Plus, Minus, CreditCard, DollarSign, UserPlus, Users, X, FileText, Eye, Wine, Grid3x3, List } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
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

interface CartItem extends Omit<Product, 'category'> {
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail";
  cartQuantity: number;
  isRecipe?: boolean;
}

interface RecipeIngredient {
  productId: string;
  productName: string;
  quantity: number; // Quantity in ml or units
  unit: string; // "ml" or unit from product
}

interface Recipe {
  id: string;
  name: string;
  price: number;
  ingredients: RecipeIngredient[];
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail";
  servingSize?: number; // Size of one serving in ml (optional)
}

interface Tab {
  id: string;
  name: string;
  creditCard?: string; // Last 4 digits stored for reference (optional)
  items: CartItem[];
  createdAt: Date;
  subtotal: number;
  tax: number;
  total: number;
}

const PRODUCTS_FOR_SALE: Product[] = [
  {
    id: "1",
    name: "Johnnie Walker Blue",
    category: "spirits",
    price: 12.99,
    quantity: 3,
    unit: "shot",
  },
  {
    id: "2",
    name: "Tanqueray Gin",
    category: "spirits",
    price: 8.99,
    quantity: 8,
    unit: "shot",
  },
  {
    id: "3",
    name: "Corona Extra",
    category: "beer",
    price: 6.99,
    quantity: 42,
    unit: "bottle",
  },
  {
    id: "4",
    name: "Heineken",
    category: "beer",
    price: 7.49,
    quantity: 38,
    unit: "bottle",
  },
  {
    id: "5",
    name: "Red Wine - Cabernet",
    category: "wine",
    price: 8.99,
    quantity: 12,
    unit: "glass",
  },
  {
    id: "6",
    name: "Smirnoff Vodka",
    category: "spirits",
    price: 7.99,
    quantity: 2,
    unit: "shot",
  },
  {
    id: "7",
    name: "Mixed Nuts",
    category: "other",
    price: 4.99,
    quantity: 15,
    unit: "bag",
  },
  {
    id: "8",
    name: "Pretzels",
    category: "other",
    price: 3.49,
    quantity: 22,
    unit: "bag",
  },
  {
    id: "9",
    name: "Margarita Mix",
    category: "wine",
    price: 6.99,
    quantity: 5,
    unit: "drink",
  },
  {
    id: "10",
    name: "Mojito Mix",
    category: "wine",
    price: 7.99,
    quantity: 4,
    unit: "drink",
  },
  {
    id: "11",
    name: "Whiskey Sour",
    category: "spirits",
    price: 9.99,
    quantity: 6,
    unit: "drink",
  },
  {
    id: "12",
    name: "Chips",
    category: "other",
    price: 2.99,
    quantity: 30,
    unit: "bag",
  },
];

const categoryColors = {
  spirits: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/30 hover:bg-slate-200 dark:hover:bg-slate-500/30",
  wine: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30",
  beer: "bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-300 dark:border-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/30",
  soda: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30",
  juice: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/30",
  other: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30",
  cocktail: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 hover:bg-purple-200 dark:hover:bg-purple-500/30",
};

export default function Sales() {
  const { t } = useI18n();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "tab" | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [showNewTabDialog, setShowNewTabDialog] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabCreditCard, setNewTabCreditCard] = useState("");
  const [showTabsList, setShowTabsList] = useState(false);
  const [showTabsManagement, setShowTabsManagement] = useState(false);
  const [selectedTabForDetails, setSelectedTabForDetails] = useState<string | null>(null);
  const [showPayTabDialog, setShowPayTabDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("sales-view-mode");
    return (saved === "list" || saved === "grid") ? saved : "grid";
  });
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  
  // Load inventory products and recipes from localStorage
  useEffect(() => {
    const loadInventory = () => {
      const stored = localStorage.getItem("inventory-products");
      if (stored) {
        try {
          setInventoryProducts(JSON.parse(stored));
        } catch {
          setInventoryProducts([]);
        }
      }
    };
    
    const loadRecipes = () => {
      const stored = localStorage.getItem("sales-recipes");
      if (stored) {
        try {
          setRecipes(JSON.parse(stored));
        } catch {
          setRecipes([]);
        }
      }
    };
    
    loadInventory();
    loadRecipes();
    
    // Listen for inventory updates
    const handleStorageChange = () => {
      loadInventory();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Save recipes to localStorage
  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem("sales-recipes", JSON.stringify(recipes));
    }
  }, [recipes]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem("sales-view-mode", viewMode);
  }, [viewMode]);

  const categories: Array<"all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail"> = [
    "all",
    "spirits",
    "wine",
    "beer",
    "soda",
    "juice",
    "other",
    "cocktail",
  ];
  const categoriesObj = t.sales.categories as Record<string, string>;
  const categoryLabels = {
    all: categoriesObj.all || "Tous",
    spirits: categoriesObj.spirits || "Spiritueux",
    wine: categoriesObj.wine || "Vin",
    beer: categoriesObj.beer || "Bière",
    soda: categoriesObj.soda || "Boissons gazeuses",
    juice: categoriesObj.juice || "Jus",
    other: categoriesObj.other || "Autres",
    cocktail: categoriesObj.cocktail || "Cocktails",
  };

  // Translate unit
  const translateUnit = (unit: string): string => {
    const unitLower = unit.toLowerCase();
    const units = t.common.units;
    
    if (unitLower === "bottles" || unitLower === "bouteilles" || unitLower === "botellas" || unitLower === "flaschen") {
      return units.bottles;
    }
    if (unitLower === "bottle" || unitLower === "bouteille" || unitLower === "botella" || unitLower === "flasche") {
      return units.bottle;
    }
    if (unitLower === "bags" || unitLower === "sacs" || unitLower === "bolsas" || unitLower === "tüten") {
      return units.bags;
    }
    if (unitLower === "bag" || unitLower === "sac" || unitLower === "bolsa" || unitLower === "tüte") {
      return units.bag;
    }
    if (unitLower === "shot" || unitLower === "shooter") {
      return units.shot;
    }
    if (unitLower === "glass" || unitLower === "verre" || unitLower === "vaso" || unitLower === "glas") {
      return units.glass;
    }
    if (unitLower === "drink" || unitLower === "boisson" || unitLower === "bebida" || unitLower === "getränk") {
      return units.drink;
    }
    return unit; // Fallback to original if not found
  };

  // Combine inventory products and recipes for display
  const allProductsForSale: (Product | Recipe)[] = [
    ...inventoryProducts.map(p => ({ ...p, isRecipe: false })),
    ...recipes.map(r => ({ ...r, isRecipe: true }))
  ];
  
  const filteredProducts = allProductsForSale
    .filter((p) => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      // Sort by category order (same as categories array)
      const categoryOrder: Record<string, number> = {
        spirits: 1,
        wine: 2,
        beer: 3,
        soda: 4,
        juice: 5,
        other: 6,
        cocktail: 7,
      };
      const orderA = categoryOrder[a.category] || 999;
      const orderB = categoryOrder[b.category] || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same category, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

  // Convert ounces to ml (1 oz = 29.5735 ml)
  const ozToMl = (oz: number): number => oz * 29.5735;

  const calculateRecipeAvailability = (recipe: Recipe): number => {
    if (recipe.ingredients.length === 0) return 1;
    
    let minServings = Infinity;
    
    recipe.ingredients.forEach(ingredient => {
      const product = inventoryProducts.find(p => p.id === ingredient.productId);
      if (!product) {
        minServings = 0;
        return;
      }
      
      // Check if product has quantity in ml
      const productQuantityInMl = (product as any).quantityInMl || 0;
      const productQuantity = product.quantity;
      
      if (ingredient.unit === "ml" || ingredient.unit === "oz") {
        // Convert oz to ml if needed
        const ingredientQuantityInMl = ingredient.unit === "oz" 
          ? ozToMl(ingredient.quantity)
          : ingredient.quantity;
        
        // Calculate how many servings we can make based on ml
        if (productQuantityInMl > 0) {
          // Product quantity is in ml
          const servings = Math.floor((productQuantityInMl * productQuantity) / ingredientQuantityInMl);
          minServings = Math.min(minServings, servings);
        } else {
          // Assume standard bottle sizes (750ml for spirits, 330ml for beer, etc.)
          const mlPerBottle = product.unit.includes("bottle") 
            ? (product.category === "beer" ? 330 : 750)
            : 750;
          const totalMl = productQuantity * mlPerBottle;
          const servings = Math.floor(totalMl / ingredientQuantityInMl);
          minServings = Math.min(minServings, servings);
        }
      } else {
        // Quantity in units
        const servings = Math.floor(productQuantity / ingredient.quantity);
        minServings = Math.min(minServings, servings);
      }
    });
    
    return minServings === Infinity ? 0 : Math.max(0, minServings);
  };

  const addToCart = (product: Product | Recipe) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item,
        ),
      );
    } else {
      // Convert Recipe to CartItem format
      if ('ingredients' in product) {
        const recipeItem: CartItem = {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 0,
          unit: "drink",
          cartQuantity: 1,
          isRecipe: true,
        };
        setCart([...cart, recipeItem]);
      } else {
        setCart([...cart, { ...product, cartQuantity: 1, isRecipe: false }]);
      }
    }
  };

  const updateInventoryAfterSale = (items: CartItem[]) => {
    const updatedProducts = [...inventoryProducts];
    
    items.forEach(item => {
      // Check if it's a recipe
      const recipe = recipes.find(r => r.id === item.id);
      if (recipe) {
        // Decrement ingredients from inventory
        recipe.ingredients.forEach(ingredient => {
          const product = updatedProducts.find(p => p.id === ingredient.productId);
          if (product) {
            // Convert oz to ml if needed
            const quantityToRemoveInMl = (ingredient.unit === "oz")
              ? ozToMl(ingredient.quantity * item.cartQuantity)
              : (ingredient.unit === "ml" ? ingredient.quantity * item.cartQuantity : 0);
            
            if (ingredient.unit === "ml" || ingredient.unit === "oz") {
              // Handle ml-based inventory (including oz converted to ml)
              const productQuantityInMl = (product as any).quantityInMl || 0;
              
              if (productQuantityInMl > 0) {
                // Product has quantity in ml
                const currentMl = productQuantityInMl * product.quantity;
                const newMl = Math.max(0, currentMl - quantityToRemoveInMl);
                product.quantity = Math.ceil(newMl / productQuantityInMl);
              } else {
                // Estimate based on standard bottle sizes
                const mlPerBottle = product.unit.includes("bottle") 
                  ? (product.category === "beer" ? 330 : 750)
                  : 750;
                const bottlesToRemove = quantityToRemoveInMl / mlPerBottle;
                product.quantity = Math.max(0, product.quantity - bottlesToRemove);
              }
            } else {
              // Quantity in units
              const quantityToRemove = ingredient.quantity * item.cartQuantity;
              product.quantity = Math.max(0, product.quantity - quantityToRemove);
            }
          }
        });
      } else {
        // Regular product - decrement quantity
        const product = updatedProducts.find(p => p.id === item.id);
        if (product) {
          product.quantity = Math.max(0, product.quantity - item.cartQuantity);
        }
      }
    });
    
    setInventoryProducts(updatedProducts);
    localStorage.setItem("inventory-products", JSON.stringify(updatedProducts));
  };


  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, cartQuantity: quantity } : item,
        ),
      );
    }
  };

  // Récupérer les paramètres de taxe depuis les settings
  const getTaxSettings = () => {
    const settingsStr = localStorage.getItem("bartender-settings");
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        return {
          taxRegion: settings.taxRegion || "quebec",
          taxRate: settings.taxRate || 0.08,
        };
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
    return { taxRegion: "quebec", taxRate: 0.08 };
  };

  // Fonction pour calculer les taxes selon la région
  const calculateTax = (subtotal: number) => {
    const { taxRegion } = getTaxSettings();
    
    switch (taxRegion) {
      case "quebec": {
        // Québec: TPS 5% + TVQ 9,975% (TVQ sur prix + TPS)
        const TPS = subtotal * 0.05;
        const TVQ = (subtotal + TPS) * 0.09975;
        return {
          TPS,
          TVQ,
          PST: 0,
          HST: 0,
          TVD: 0,
          total: TPS + TVQ,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "TVQ (9,975%)" },
        };
      }
      case "ontario": {
        // Ontario: TVH 13% (simple)
        const HST = subtotal * 0.13;
        return {
          TPS: 0,
          TVQ: 0,
          PST: 0,
          HST,
          TVD: 0,
          total: HST,
          breakdown: false,
          labels: { primary: "TVH (13%)", secondary: "" },
        };
      }
      case "alberta": {
        // Alberta: TPS 5% (simple)
        const TPS = subtotal * 0.05;
        return {
          TPS,
          TVQ: 0,
          PST: 0,
          HST: 0,
          TVD: 0,
          total: TPS,
          breakdown: false,
          labels: { primary: "TPS (5%)", secondary: "" },
        };
      }
      case "british-columbia": {
        // BC: TPS 5% + PST 10% (PST sur prix + TPS)
        const TPS = subtotal * 0.05;
        const PST = (subtotal + TPS) * 0.10;
        return {
          TPS,
          TVQ: 0,
          PST,
          HST: 0,
          TVD: 0,
          total: TPS + PST,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "PST (10%)" },
        };
      }
      case "manitoba": {
        // Manitoba: TPS 5% + TVD 7% (TVD sur prix + TPS)
        const TPS = subtotal * 0.05;
        const TVD = (subtotal + TPS) * 0.07;
        return {
          TPS,
          TVQ: 0,
          PST: 0,
          HST: 0,
          TVD,
          total: TPS + TVD,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "TVD (7%)" },
        };
      }
      case "saskatchewan": {
        // Saskatchewan: TPS 5% + PST 6% (PST sur prix + TPS)
        const TPS = subtotal * 0.05;
        const PST = (subtotal + TPS) * 0.06;
        return {
          TPS,
          TVQ: 0,
          PST,
          HST: 0,
          TVD: 0,
          total: TPS + PST,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "PST (6%)" },
        };
      }
      case "new-brunswick":
      case "nova-scotia":
      case "prince-edward-island":
      case "newfoundland": {
        // NB, NS, PEI, Terre-Neuve: HST 15% (simple)
        const HST = subtotal * 0.15;
        return {
          TPS: 0,
          TVQ: 0,
          PST: 0,
          HST,
          TVD: 0,
          total: HST,
          breakdown: false,
          labels: { primary: "HST (15%)", secondary: "" },
        };
      }
      default: {
        // Pour les autres régions (custom ou autres pays), utiliser le taux simple
        const { taxRate } = getTaxSettings();
        return {
          TPS: 0,
          TVQ: 0,
          PST: 0,
          HST: 0,
          TVD: 0,
          total: subtotal * taxRate,
          breakdown: false,
          labels: { primary: `${t.sales.tax}`, secondary: "" },
        };
      }
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );
  const taxCalculation = calculateTax(subtotal);
  const tax = taxCalculation.total;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (paymentMethod === "cash") {
      alert(`${t.sales.alerts.cashPayment}$${total.toFixed(2)}`);
      setCart([]);
      setPaymentMethod(null);
    } else if (paymentMethod === "card") {
      setShowPaymentModal(true);
    } else if (paymentMethod === "tab") {
      if (selectedTabId) {
        // Add items to existing tab
        const tab = openTabs.find(t => t.id === selectedTabId);
        if (tab) {
          const updatedTabs = openTabs.map(t => {
            if (t.id === selectedTabId) {
              const mergedItems = [...t.items];
              cart.forEach(cartItem => {
                const existing = mergedItems.find(i => i.id === cartItem.id);
                if (existing) {
                  existing.cartQuantity += cartItem.cartQuantity;
                } else {
                  mergedItems.push({ ...cartItem });
                }
              });
              const newSubtotal = mergedItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
              const newTaxCalc = calculateTax(newSubtotal);
              const newTax = newTaxCalc.total;
              const newTotal = newSubtotal + newTax;
              return {
                ...t,
                items: mergedItems,
                subtotal: newSubtotal,
                tax: newTax,
                total: newTotal,
              };
            }
            return t;
          });
          setOpenTabs(updatedTabs);
          alert(`${t.sales.tabCreated}: ${tab.name}`);
          setCart([]);
          setPaymentMethod(null);
          setSelectedTabId(null);
        }
      } else {
        // Open new tab
        setShowNewTabDialog(true);
      }
    }
  };

  const handleCreateNewTab = () => {
    if (!newTabName.trim()) {
      alert("Veuillez entrer un nom de compte");
      return;
    }
    
    // Credit card is optional, but if provided, validate it
    let last4Digits: string | undefined;
    if (newTabCreditCard.trim()) {
      const cleanedCard = newTabCreditCard.replace(/\s+/g, "");
      if (cleanedCard.length < 13 || cleanedCard.length > 19 || !/^\d+$/.test(cleanedCard)) {
        alert("Veuillez entrer un numéro de carte de crédit valide");
        return;
      }
      // Store only last 4 digits for security
      last4Digits = cleanedCard.slice(-4);
    }
    
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: newTabName.trim(),
      creditCard: last4Digits,
      items: [...cart],
      createdAt: new Date(),
      subtotal,
      tax,
      total,
    };
    
    setOpenTabs([...openTabs, newTab]);
    setSelectedTabId(newTab.id);
    alert(`${t.sales.tabCreated}: ${newTab.name}`);
    setCart([]);
    setPaymentMethod(null);
    setNewTabName("");
    setNewTabCreditCard("");
    setShowNewTabDialog(false);
  };

  const handlePayTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;
    
    setShowPaymentModal(true);
    // Store tab ID temporarily to close it after payment
    (window as any).__payingTabId = tabId;
  };

  const handleCloseTab = (tabId: string) => {
    if (confirm(`${t.sales.closeTab}?`)) {
      setOpenTabs(openTabs.filter(t => t.id !== tabId));
      if (selectedTabId === tabId) {
        setSelectedTabId(null);
      }
    }
  };

  const handlePaymentComplete = () => {
    const payingTabId = (window as any).__payingTabId;
    if (payingTabId) {
      // Close the tab after payment
      const tab = openTabs.find(t => t.id === payingTabId);
      if (tab) {
        // Update inventory for tab items
        const updatedProducts = [...inventoryProducts];
        tab.items.forEach(cartItem => {
          const product = updatedProducts.find(p => p.id === cartItem.id);
          if (product) {
            product.quantity = Math.max(0, product.quantity - cartItem.cartQuantity);
          } else {
            const recipe = recipes.find(r => r.id === cartItem.id);
            if (recipe) {
              recipe.ingredients.forEach(ing => {
                const invProduct = updatedProducts.find(p => p.id === ing.productId);
                if (invProduct) {
                  if (ing.unit === "ml" || ing.unit === "oz") {
                    // Convert oz to ml if needed
                    const quantityToRemoveInMl = (ing.unit === "oz")
                      ? ozToMl(ing.quantity * cartItem.cartQuantity)
                      : (ing.quantity * cartItem.cartQuantity);
                    
                    const productQuantityInMl = (invProduct as any).quantityInMl || 0;
                    if (productQuantityInMl > 0) {
                      const currentMl = productQuantityInMl * invProduct.quantity;
                      const newMl = Math.max(0, currentMl - quantityToRemoveInMl);
                      invProduct.quantity = Math.ceil(newMl / productQuantityInMl);
                    } else {
                      const mlPerBottle = invProduct.unit.includes("bottle") 
                        ? (invProduct.category === "beer" ? 330 : 750)
                        : 750;
                      const bottlesToRemove = quantityToRemoveInMl / mlPerBottle;
                      invProduct.quantity = Math.max(0, invProduct.quantity - bottlesToRemove);
                    }
                  } else {
                    invProduct.quantity = Math.max(0, invProduct.quantity - (ing.quantity * cartItem.cartQuantity));
                  }
                }
              });
            }
          }
        });
        setInventoryProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        alert(`${t.sales.tabClosed}: ${tab.name} - $${tab.total.toFixed(2)}`);
        setOpenTabs(openTabs.filter(t => t.id !== payingTabId));
        if (selectedTabId === payingTabId) {
          setSelectedTabId(null);
        }
      }
      delete (window as any).__payingTabId;
    } else {
      updateInventoryAfterSale(cart);
      setCart([]);
      setPaymentMethod(null);
      alert(`${t.sales.alerts.orderCompleted}$${total.toFixed(2)}`);
    }
    setShowPaymentModal(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t.sales.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
              {t.sales.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary border-2 border-foreground/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mode carte"
                aria-label="Mode carte"
              >
                <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mode liste"
                aria-label="Mode liste"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <button
              onClick={() => setShowRecipeDialog(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:opacity-90 whitespace-nowrap text-sm sm:text-base"
            >
              <Wine className="h-4 w-4 sm:h-5 sm:w-5" />
              + Produits (cocktail, au verres etc...)
            </button>
            {openTabs.length > 0 && (
              <button
                onClick={() => setShowTabsManagement(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm sm:text-base"
              >
                <FileText className="h-4 w-4" />
                {t.sales.tabs} ({openTabs.length})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                    filterCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>

            {/* Products Display - Grid or List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const isRecipe = 'ingredients' in product;
                  const availableQuantity = isRecipe 
                    ? calculateRecipeAvailability(product as Recipe)
                    : (product as Product).quantity;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={availableQuantity <= 0}
                      className={`p-3 rounded-lg border-2 border-foreground/30 transition-all text-left hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full min-h-[120px] ${categoryColors[product.category]}`}
                    >
                      <p className="font-bold text-lg line-clamp-2 h-12 mb-2">
                        {product.name}
                      </p>
                      <div className="mt-auto">
                        <p className="text-sm font-medium text-muted-foreground">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-[10px] opacity-60 mt-0.5">
                          {!isRecipe 
                            ? `${translateUnit((product as Product).unit)} - Stock: ${availableQuantity}`
                            : `Recette - Disponible: ${availableQuantity > 0 ? "Oui" : "Non"}`
                          }
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredProducts.map((product) => {
                  const isRecipe = 'ingredients' in product;
                  const availableQuantity = isRecipe 
                    ? calculateRecipeAvailability(product as Recipe)
                    : (product as Product).quantity;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={availableQuantity <= 0}
                      className={`w-full p-3 sm:p-4 rounded-lg border-2 border-foreground/30 transition-all text-left hover:border-primary/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 sm:gap-4 ${categoryColors[product.category]}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base sm:text-lg line-clamp-1 mb-1">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 text-sm">
                          <p className="font-semibold text-foreground">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {!isRecipe 
                              ? `${translateUnit((product as Product).unit)} - Stock: ${availableQuantity}`
                              : `Recette - Disponible: ${availableQuantity > 0 ? "Oui" : "Non"}`
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border-2 border-foreground/20 rounded-lg p-4 space-y-4">
              <h3 className="font-bold text-lg text-foreground">
                {t.sales.orderSummary}
              </h3>

              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    {t.sales.noItemsInCart}
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-secondary rounded border-2 border-foreground/20"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} {t.sales.each}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartQuantity - 1)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-semibold">
                          {item.cartQuantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartQuantity + 1)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors text-destructive"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t-2 border-foreground/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.sales.subtotal}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {taxCalculation.breakdown ? (
                  <>
                <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{taxCalculation.labels.primary}</span>
                      <span>${(taxCalculation.TPS > 0 ? taxCalculation.TPS : taxCalculation.HST || 0).toFixed(2)}</span>
                    </div>
                    {taxCalculation.labels.secondary && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{taxCalculation.labels.secondary}</span>
                        <span>${(taxCalculation.TVQ || taxCalculation.PST || taxCalculation.TVD || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{taxCalculation.labels.primary || t.sales.tax}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t-2 border-foreground/20 pt-2">
                  <span>{t.sales.total}</span>
                  <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              {cart.length > 0 && (
                <div className="space-y-2 border-t-2 border-foreground/20 pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {t.sales.paymentMethod}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "cash"
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      {t.sales.cash}
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "card"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      {t.sales.card}
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod("tab");
                        if (openTabs.length > 0 && !selectedTabId) {
                          setShowTabsList(true);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "tab"
                          ? "bg-red-900 text-white"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.sales.tab}
                    </button>
                  </div>
                  
                  {/* Tab Selection */}
                  {paymentMethod === "tab" && (
                    <div className="space-y-2 mt-2">
                      {selectedTabId ? (
                        <div className="flex items-center justify-between p-2 bg-red-900/10 border border-red-900/30 rounded">
                          <span className="text-sm font-medium">
                            {openTabs.find(t => t.id === selectedTabId)?.name}
                          </span>
                          <button
                            onClick={() => setSelectedTabId(null)}
                            className="text-red-900 hover:text-red-800"
                            aria-label="Clear tab selection"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowTabsList(true)}
                          className="w-full py-2 text-sm border-2 border-foreground/20 rounded-lg hover:bg-secondary"
                        >
                          {t.sales.selectTab}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Open Tab Button */}
              <button
                onClick={() => {
                  if (cart.length === 0) {
                    alert("Veuillez d'abord ajouter des articles au panier");
                    return;
                  }
                  setShowNewTabDialog(true);
                }}
                disabled={cart.length === 0}
                className="w-full py-3 bg-red-900 text-white rounded-lg font-bold transition-all hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {t.sales.openTab}
              </button>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !paymentMethod}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.sales.completeSale}
              </button>

              {/* Pay Tab Button - Quick Access */}
              {openTabs.length > 0 && (
                <button
                  onClick={() => setShowPayTabDialog(true)}
                  className="w-full py-3 bg-red-900 text-white rounded-lg font-bold transition-all hover:bg-red-800 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {t.sales.payTab} ({openTabs.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        amount={(window as any).__payingTabId 
          ? openTabs.find(t => t.id === (window as any).__payingTabId)?.total || total
          : total}
        onClose={() => {
          setShowPaymentModal(false);
          delete (window as any).__payingTabId;
        }}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* New Tab Dialog */}
      <Dialog open={showNewTabDialog} onOpenChange={setShowNewTabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.sales.openNewTab}</DialogTitle>
            <DialogDescription>
              {t.sales.tabNamePlaceholder}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tabName">{t.sales.tabName}</Label>
              <Input
                id="tabName"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder={t.sales.tabNamePlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTabName.trim()) {
                    handleCreateNewTab();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tabCreditCard">
                {t.sales.creditCardNumber} <span className="text-muted-foreground text-xs">(optionnel)</span>
              </Label>
              <Input
                id="tabCreditCard"
                type="text"
                value={newTabCreditCard}
                onChange={(e) => {
                  // Format credit card number with spaces every 4 digits
                  const value = e.target.value.replace(/\s+/g, "").replace(/\D/g, "");
                  const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                  setNewTabCreditCard(formatted);
                }}
                placeholder="1234 5678 9012 3456 (optionnel)"
                maxLength={19} // 16 digits + 3 spaces
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTabName.trim()) {
                    handleCreateNewTab();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t.sales.creditCardInfo}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewTabDialog(false);
              setNewTabName("");
              setNewTabCreditCard("");
            }}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateNewTab} disabled={!newTabName.trim()}>
              {t.sales.openTab}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs List Dialog */}
      <Dialog open={showTabsList} onOpenChange={setShowTabsList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.sales.tabs}</DialogTitle>
            <DialogDescription>
              {t.sales.selectTab}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {openTabs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.sales.noOpenTabs}
              </p>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`p-4 border rounded-lg space-y-2 ${
                    selectedTabId === tab.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{tab.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tab.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ${tab.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tab.items.length} {tab.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedTabId(tab.id);
                        setShowTabsList(false);
                      }}
                    >
                      {t.sales.selectTab}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePayTab(tab.id)}
                    >
                      {t.sales.payTab}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCloseTab(tab.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewTabDialog(true);
                setShowTabsList(false);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.sales.openNewTab}
            </Button>
            <Button onClick={() => setShowTabsList(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs Management Dialog */}
      <Dialog open={showTabsManagement} onOpenChange={setShowTabsManagement}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.sales.tabsManagement}
            </DialogTitle>
            <DialogDescription>
              {openTabs.length} {openTabs.length === 1 ? "compte ouvert" : "comptes ouverts"} pour la soirée
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {openTabs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.sales.noOpenTabs}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{tab.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {t.sales.creditCardNumber}: •••• {tab.creditCard}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tab.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Articles</p>
                            <p className="font-semibold">{tab.items.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.sales.subtotal}</p>
                            <p className="font-semibold">${tab.subtotal.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.sales.total}</p>
                            <p className="font-bold text-foreground text-lg">${tab.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tab Items List */}
                    {selectedTabForDetails === tab.id && (
                      <div className="mt-4 pt-4 border-t space-y-2 max-h-64 overflow-y-auto">
                        <h4 className="font-medium text-sm mb-2">Détails des articles :</h4>
                        {tab.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-secondary rounded text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} {t.sales.each} × {item.cartQuantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${(item.price * item.cartQuantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTabForDetails(
                            selectedTabForDetails === tab.id ? null : tab.id
                          );
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedTabForDetails === tab.id ? t.sales.hideDetails : t.sales.viewDetails}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          handlePayTab(tab.id);
                          setShowTabsManagement(false);
                        }}
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t.sales.payTab}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCloseTab(tab.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {t.sales.allTabsTotal}:{" "}
                <span className="font-bold text-foreground">
                  ${openTabs.reduce((sum, tab) => sum + tab.total, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewTabDialog(true);
                    setShowTabsManagement(false);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t.sales.openNewTab}
                </Button>
                <Button onClick={() => setShowTabsManagement(false)}>
                  {t.common.close}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Tab Dialog - Quick Access */}
      <Dialog open={showPayTabDialog} onOpenChange={setShowPayTabDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t.sales.payTab}
            </DialogTitle>
            <DialogDescription>
              {t.sales.selectTab}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {openTabs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.sales.noOpenTabs}
              </p>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => {
                    handlePayTab(tab.id);
                    setShowPayTabDialog(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{tab.name}</p>
                      {tab.creditCard && (
                        <p className="text-xs text-muted-foreground">
                          {t.sales.creditCardNumber}: •••• {tab.creditCard}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(tab.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">
                        ${tab.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tab.items.length} {tab.items.length === 1 ? "article" : "articles"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{t.sales.subtotal}: ${tab.subtotal.toFixed(2)}</span>
                    {(() => {
                      const taxCalc = calculateTax(tab.subtotal);
                      if (taxCalc.breakdown) {
                        return (
                          <>
                    <span>•</span>
                            <span>{taxCalc.labels.primary}: ${(taxCalc.TPS > 0 ? taxCalc.TPS : taxCalc.HST || 0).toFixed(2)}</span>
                            {taxCalc.labels.secondary && (
                              <>
                                <span>•</span>
                                <span>{taxCalc.labels.secondary}: ${(taxCalc.TVQ || taxCalc.PST || taxCalc.TVD || 0).toFixed(2)}</span>
                              </>
                            )}
                          </>
                        );
                      } else {
                        return (
                          <>
                            <span>•</span>
                            <span>{taxCalc.labels.primary || t.sales.tax}: ${tab.tax.toFixed(2)}</span>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTabsManagement(true);
                setShowPayTabDialog(false);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t.sales.manageTabs}
            </Button>
            <Button onClick={() => setShowPayTabDialog(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Creation Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" />
              Créer un produit (cocktail, au verres etc...)
            </DialogTitle>
            <DialogDescription>
              Créez un produit avec des ingrédients de l'inventaire (ex: Vodka jus d'orange, Mojito, etc.)
            </DialogDescription>
          </DialogHeader>
          <RecipeForm
            inventoryProducts={inventoryProducts}
            onSave={(recipe) => {
              setRecipes([...recipes, recipe]);
              setShowRecipeDialog(false);
            }}
            onCancel={() => setShowRecipeDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Convert ounces to ml (1 oz = 29.5735 ml) - Utility function
const ozToMlRecipe = (oz: number): number => oz * 29.5735;

// Recipe Form Component
interface RecipeFormProps {
  inventoryProducts: Product[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

function RecipeForm({ inventoryProducts, onSave, onCancel }: RecipeFormProps) {
  const { t } = useI18n();
  const [recipeName, setRecipeName] = useState("");
  const [recipePrice, setRecipePrice] = useState("");
  const [recipeCategory, setRecipeCategory] = useState<"spirits" | "wine" | "beer" | "soda" | "juice" | "other">("wine");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("ml");

  // Calculate recipe cost based on ingredients
  const calculateRecipeCost = (): number => {
    if (ingredients.length === 0) return 0;
    
    let totalCost = 0;
    
    ingredients.forEach(ingredient => {
      const product = inventoryProducts.find(p => p.id === ingredient.productId);
      if (!product) return;
      
      // Get product size in ml
      const productQuantityInMl = (product as any).quantityInMl || 0;
      let productSizeInMl = 0;
      
      if (productQuantityInMl > 0) {
        // Product has explicit ml size
        productSizeInMl = productQuantityInMl;
      } else {
        // Estimate based on standard bottle sizes
        if (product.unit.includes("bottle")) {
          productSizeInMl = product.category === "beer" ? 330 : 750;
        } else if (product.unit.includes("shot")) {
          productSizeInMl = 44; // Standard shot is ~44ml (1.5 oz)
        } else {
          productSizeInMl = 750; // Default to 750ml
        }
      }
      
      // Calculate cost per ml
      const costPerMl = product.price / productSizeInMl;
      
      // Convert ingredient quantity to ml
      let ingredientQuantityInMl = 0;
      if (ingredient.unit === "ml") {
        ingredientQuantityInMl = ingredient.quantity;
      } else if (ingredient.unit === "oz") {
        ingredientQuantityInMl = ozToMlRecipe(ingredient.quantity);
      } else {
        // For units, assume 1 unit = 1 product (e.g., 1 bag = 1 bag)
        // Calculate cost per unit
        totalCost += (product.price / product.quantity) * ingredient.quantity;
        return;
      }
      
      // Add cost for this ingredient
      totalCost += costPerMl * ingredientQuantityInMl;
    });
    
    return totalCost;
  };
  
  const recipeCost = calculateRecipeCost();

  const addIngredient = () => {
    if (!selectedProductId || !ingredientQuantity) return;
    
    const product = inventoryProducts.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const quantity = parseFloat(ingredientQuantity);
    if (isNaN(quantity) || quantity <= 0) return;
    
    // Check if ingredient already exists
    if (ingredients.some(i => i.productId === selectedProductId)) {
      alert("Ce produit est déjà dans la recette");
      return;
    }
    
    setIngredients([...ingredients, {
      productId: selectedProductId,
      productName: product.name,
      quantity,
      unit: ingredientUnit,
    }]);
    
    setSelectedProductId("");
    setIngredientQuantity("");
    setIngredientUnit("ml");
  };

  const removeIngredient = (productId: string) => {
    setIngredients(ingredients.filter(i => i.productId !== productId));
  };

  const handleSave = () => {
    if (!recipeName.trim()) {
      alert("Veuillez entrer un nom pour la recette");
      return;
    }
    if (!recipePrice.trim() || parseFloat(recipePrice) <= 0) {
      alert("Veuillez entrer un prix valide");
      return;
    }
    // Ingredients are now optional

    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: recipeName.trim(),
      price: parseFloat(recipePrice),
      ingredients,
      category: recipeCategory,
    };

    onSave(recipe);
    setRecipeName("");
    setRecipePrice("");
    setIngredients([]);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="recipeName">Nom de la recette *</Label>
        <Input
          id="recipeName"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          placeholder="Ex: Vodka jus d'orange, Mojito, etc."
        />
      </div>

      {/* Recipe Cost Display */}
      {ingredients.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Prix coûtant calculé:
            </span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              ${recipeCost.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            Basé sur les coûts des ingrédients de l'inventaire
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipePrice">Prix de vente ($) *</Label>
          <Input
            id="recipePrice"
            type="number"
            step="0.01"
            min="0"
            value={recipePrice}
            onChange={(e) => setRecipePrice(e.target.value)}
            placeholder="0.00"
          />
          {recipeCost > 0 && parseFloat(recipePrice) > 0 && (
            <p className="text-xs text-muted-foreground">
              Marge: ${(parseFloat(recipePrice) - recipeCost).toFixed(2)} 
              ({recipeCost > 0 ? (((parseFloat(recipePrice) - recipeCost) / recipeCost) * 100).toFixed(1) : '0'}%)
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipeCategory">Catégorie</Label>
          <select
            id="recipeCategory"
            value={recipeCategory}
            onChange={(e) => setRecipeCategory(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-lg bg-background"
            aria-label="Catégorie de la recette"
          >
            <option value="spirits">Spiritueux</option>
            <option value="wine">Vin</option>
            <option value="beer">Bière</option>
            <option value="soda">Boissons gazeuses</option>
            <option value="juice">Jus</option>
            <option value="other">Autres</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ingrédients</Label>
        <div className="flex gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg bg-background"
            aria-label="Sélectionner un produit"
          >
            <option value="">Sélectionner un produit</option>
            {inventoryProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} (Stock: {product.quantity} {product.unit})
              </option>
            ))}
          </select>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={ingredientQuantity}
            onChange={(e) => setIngredientQuantity(e.target.value)}
            placeholder="Quantité"
            className="w-24"
          />
          <select
            value={ingredientUnit}
            onChange={(e) => setIngredientUnit(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background"
            aria-label="Unité de mesure"
          >
            <option value="ml">ml</option>
            <option value="oz">oz</option>
            <option value="unit">unité</option>
          </select>
          <Button onClick={addIngredient} disabled={!selectedProductId || !ingredientQuantity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {ingredients.length > 0 && (
          <div className="mt-2 space-y-2 border rounded-lg p-2">
            {ingredients.map((ingredient) => (
              <div key={ingredient.productId} className="flex items-center justify-between p-2 bg-secondary rounded">
                <span className="text-sm">
                  {ingredient.productName} - {ingredient.quantity} {ingredient.unit}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(ingredient.productId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button onClick={handleSave} disabled={!recipeName.trim() || !recipePrice.trim()}>
          <Wine className="h-4 w-4 mr-2" />
          Créer
        </Button>
      </DialogFooter>
    </div>
  );
}
