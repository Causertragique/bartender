import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import AddProductModal from "@/components/AddProductModal";
import QRCodeScanner from "@/components/QRCodeScanner";
import { Plus, Search, Camera, Grid3x3, List } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useNotifications } from "@/hooks/useNotifications";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Johnnie Walker Blue Label",
    category: "spirits",
    price: 189.99,
    quantity: 3,
    unit: "bottles",
    lastRestocked: "2024-01-15",
  },
  {
    id: "2",
    name: "Tanqueray Gin",
    category: "spirits",
    price: 34.99,
    quantity: 8,
    unit: "bottles",
    lastRestocked: "2024-01-18",
  },
  {
    id: "3",
    name: "Corona Extra",
    category: "beer",
    price: 6.99,
    quantity: 42,
    unit: "bottles",
    lastRestocked: "2024-01-20",
  },
  {
    id: "4",
    name: "Heineken",
    category: "beer",
    price: 7.49,
    quantity: 38,
    unit: "bottles",
    lastRestocked: "2024-01-20",
  },
  {
    id: "5",
    name: "Red Wine - Cabernet Sauvignon",
    category: "wine",
    price: 28.99,
    quantity: 12,
    unit: "bottles",
    lastRestocked: "2024-01-17",
  },
  {
    id: "6",
    name: "Vodka - Smirnoff",
    category: "spirits",
    price: 24.99,
    quantity: 2,
    unit: "bottles",
    lastRestocked: "2024-01-14",
  },
  {
    id: "7",
    name: "Mixed Nuts",
    category: "other",
    price: 4.99,
    quantity: 15,
    unit: "bags",
    lastRestocked: "2024-01-19",
  },
  {
    id: "8",
    name: "Pretzels",
    category: "other",
    price: 3.49,
    quantity: 22,
    unit: "bags",
    lastRestocked: "2024-01-20",
  },
];

export default function Inventory() {
  const { t } = useI18n();
  const { checkLowStock } = useNotifications();
  
  // Load products from localStorage or use sample products
  const loadProducts = (): Product[] => {
    const stored = localStorage.getItem("inventory-products");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return SAMPLE_PRODUCTS;
      }
    }
    return SAMPLE_PRODUCTS;
  };
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other"
  >("all");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("inventory-view-mode");
    return (saved === "list" || saved === "grid") ? saved : "grid";
  });

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("inventory-products", JSON.stringify(products));
  }, [products]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem("inventory-view-mode", viewMode);
  }, [viewMode]);

  // Check for low stock notifications
  useEffect(() => {
    checkLowStock(products.map(p => ({ id: p.id, name: p.name, quantity: p.quantity })));
  }, [products, checkLowStock]);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by category order (same as categories array)
      const categoryOrder: Record<string, number> = {
        spirits: 1,
        wine: 2,
        beer: 3,
        soda: 4,
        juice: 5,
        other: 6,
      };
      const orderA = categoryOrder[a.category] || 999;
      const orderB = categoryOrder[b.category] || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same category, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

  const handleAddStock = (id: string, amount: number) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + amount } : p,
      ),
    );
  };

  const handleRemoveStock = (id: string, amount: number) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity - amount) } : p,
      ),
    );
  };

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      const message = (t.inventory.confirmDelete || "Êtes-vous sûr de vouloir supprimer \"{name}\" ?").replace("{name}", product.name);
      if (window.confirm(message)) {
        setProducts(products.filter((p) => p.id !== id));
      }
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    if (editingProduct) {
      // Replace the existing product by its original ID to avoid creating duplicates
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      setEditingProduct(null);
    } else {
      // Only add new product if not editing
      handleAddProduct(updatedProduct);
    }
  };

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalArticles = products.reduce((sum, p) => sum + p.quantity, 0);

  const categories: Array<"all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other"> = [
    "all",
    "spirits",
    "wine",
    "beer",
    "soda",
    "juice",
    "other",
  ];
  const categoryLabels = {
    all: t.inventory.categories.all || "Tous",
    spirits: t.inventory.categories.spirits || "Spiritueux",
    wine: t.inventory.categories.wine || "Vin",
    beer: t.inventory.categories.beer || "Bière",
    soda: t.inventory.categories.soda || "Boissons gazeuses",
    juice: t.inventory.categories.juice || "Jus",
    other: t.inventory.categories.other || "Autres",
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-2xl font-bold text-foreground">{t.inventory.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
              {t.inventory.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => setIsAddProductModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base flex-shrink-0"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              {t.inventory.addProduct}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Inventory Value */}
          <div className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t.inventory.totalInventoryValue}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          
          {/* Total Products */}
          <div className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t.inventory.totalProducts}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              {products.length}
            </p>
          </div>
          
          {/* Total Articles */}
          <div className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Articles
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              {totalArticles}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.inventory.searchProducts}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-secondary border-2 border-foreground/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-secondary rounded transition-colors"
                title="Scanner QR Code"
                aria-label="Scanner QR Code"
              >
                <Camera className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        </div>

        {/* Products Display - Grid or List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
                onDelete={handleDelete}
                onEdit={handleEdit}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
                onDelete={handleDelete}
                onEdit={handleEdit}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.inventory.noProductsFound}</p>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleUpdateProduct}
        editingProduct={editingProduct}
      />

      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={(result) => {
          try {
            // Try to parse as JSON (product QR code format)
            const productData = JSON.parse(result);
            if (productData.id || productData.code) {
              // Search by product ID
              const productId = productData.id || productData.code;
              const foundProduct = products.find(p => p.id === productId);
              if (foundProduct) {
                setSearchTerm(foundProduct.name);
                // Scroll to product if needed
                setTimeout(() => {
                  const element = document.querySelector(`[data-product-id="${productId}"]`);
                  element?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              } else {
                setSearchTerm(productData.name || productId);
              }
            } else if (productData.name) {
              // Search by product name
              setSearchTerm(productData.name);
            } else {
              // Fallback: use the raw result as search term
              setSearchTerm(result);
            }
          } catch {
            // If not JSON, treat as plain text search
            setSearchTerm(result);
          }
        }}
      />
    </Layout>
  );
}
