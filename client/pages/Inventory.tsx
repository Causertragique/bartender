import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import AddProductModal from "@/components/AddProductModal";
import QRCodeScanner from "@/components/QRCodeScanner";
import NotificationIcons from "@/components/NotificationIcons";
import { Plus, Search, Camera, Grid3x3, List } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/services/firestore";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { logInventoryChange } from "@/lib/audit";
import { getCurrentUserRole, hasPermission } from "@/lib/permissions";
import { ImportedProduct } from "@/components/ImportCSVModal";
import ImportCSVModal from "@/components/ImportCSVModal";

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
  // ... autres produits ...
];

// ...existing code...

export default function Inventory() {

  // Hooks et états nécessaires
  const { t } = useI18n();
  const { user } = useAuth();
  const role = getCurrentUserRole();
  const canCreateProduct = ["owner", "admin", "manager"].includes(role);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Define categories and their labels
  const categories: Array<"all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other"> = [
    "all",
    "spirits",
    "wine",
    "beer",
    "soda",
    "juice",
    "other",
  ];
  const categoryLabels: Record<typeof categories[number], string> = {
    all: t.inventory.allCategories || "Toutes",
    spirits: t.inventory.spirits || "Spiritueux",
    wine: t.inventory.wine || "Vins",
    beer: t.inventory.beer || "Bières",
    soda: t.inventory.soda || "Sodas",
    juice: t.inventory.juice || "Jus",
    other: t.inventory.other || "Autres",
  };

  // Handler functions moved inside the component to access 'user'
  const handleAddProduct = async (newProduct: Product) => {
    if (!user || !canCreateProduct) return;
    const { addNotification } = useNotificationStore.getState();
    console.log("=== handleAddProduct appelé ===");
    console.log("User ID:", user.uid);
    console.log("Product data:", newProduct);
    try {
      const { id, ...productWithoutId } = newProduct;
      // Supprime subcategory si undefined ou null
      const cleanProduct: any = { ...productWithoutId };
      if (cleanProduct.subcategory === undefined || cleanProduct.subcategory === null) {
        delete cleanProduct.subcategory;
      }
      console.log("Appel de createProduct avec:", { userId: user.uid, product: cleanProduct });
      const added = await createProduct(user.uid, cleanProduct);
      console.log("Produit créé avec succès:", added);
      if (added.id) {
        setProducts([...products, added as Product]);
        // Log la création du produit
        await logInventoryChange({
          productId: added.id,
          productName: newProduct.name,
          action: "create",
          newQuantity: newProduct.quantity,
          newPrice: newProduct.price,
          source: "manual",
        });
        // Ajouter notification
        addNotification({
          title: "Produit ajouté",
          description: newProduct.name,
        });
      }
    } catch (error) {
      console.error("=== Erreur lors de la création du produit ===", error);
      addNotification({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      });
    }
  };

  // Handlers
  const handleEdit = (product: Product) => {
    if (!canCreateProduct) return;
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!user || !canCreateProduct) return;
    const { addNotification } = useNotificationStore.getState();
    if (editingProduct) {
      try {
        const { id, ...updates } = updatedProduct;
        await updateProduct(user.uid, editingProduct.id, updates as any);
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
        );
        await logInventoryChange({
          productId: editingProduct.id,
          productName: updatedProduct.name,
          action: "update",
          previousQuantity: editingProduct.quantity,
          newQuantity: updatedProduct.quantity,
          previousPrice: editingProduct.price,
          newPrice: updatedProduct.price,
          source: "manual",
        });
        setEditingProduct(null);
        addNotification({
          title: "Produit modifié",
          description: updatedProduct.name,
        });
      } catch (error) {
        addNotification({
          title: "Erreur",
          description: "Impossible de mettre à jour le produit",
          variant: "destructive",
        });
      }
    } else {
      handleAddProduct(updatedProduct);
    }
  };

  // The following block is invalid and should be removed because it tries to destructure 'products' (an array) as a product object.
  // Remove this block entirely to resolve the type error.

  const handleRemoveStock = (id: string, amount: number) => {
    // Ajoute la logique de retrait de stock ici
    setProducts(products =>
      products.map(p =>
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity - amount) } : p
      )
    );
  };

  const handleDelete = async (product: Product) => {
    if (!user || !canCreateProduct) return;
    const { addNotification } = useNotificationStore.getState();
    try {
      await deleteProduct(user.uid, product.id);
      setProducts(products.filter((p) => p.id !== product.id));
      await logInventoryChange({
        productId: product.id,
        productName: product.name,
        action: "delete",
        previousQuantity: product.quantity,
        newQuantity: 0,
        previousPrice: product.price,
        newPrice: 0,
        source: "manual",
      });
      addNotification({
        title: "Produit supprimé",
        description: product.name,
      });
    } catch (error) {
      addNotification({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  // Calcul du total de la valeur d'inventaire et du nombre d'articles
  const totalValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0), 0);
  const totalArticles = products.reduce((sum, p) => sum + (p.quantity ?? 0), 0);

  // Filtrer les produits selon la recherche et la catégorie
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    const matchesSearch =
      searchTerm.trim() === "" ||
      product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddStock = (id: string, amount: number) => {
    setProducts(products =>
      products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + amount } : p
      )
    );
  };

  // --- DEBUT DU JSX PRINCIPAL ---
  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header avec bouton Ajouter */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">{t.inventory.title || "Inventaire"}</h1>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${canCreateProduct ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}
            onClick={() => {
              if (canCreateProduct) {
                setIsAddProductModalOpen(true);
                setEditingProduct(null);
              }
            }}
            disabled={!canCreateProduct}
            title={canCreateProduct ? undefined : "Seuls les propriétaires, admins et managers peuvent ajouter des produits."}
          >
            <Plus className="w-5 h-5" />
            {t.inventory.addProduct || "Ajouter un produit"}
          </button>
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
                className={
                  `px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ` +
                  (filterCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground")
                }
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
                onAddStock={canCreateProduct ? handleAddStock : undefined}
                onRemoveStock={canCreateProduct ? handleRemoveStock : undefined}
                onDelete={canCreateProduct ? ((id: string) => {
                  const product = products.find(p => p.id === id);
                  if (product) handleDelete(product);
                }) : undefined}
                onEdit={canCreateProduct ? handleEdit : undefined}
                onClick={canCreateProduct ? handleEdit : undefined}
                viewMode="grid"
                canEdit={canCreateProduct}
                canDelete={canCreateProduct}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddStock={canCreateProduct ? handleAddStock : undefined}
                onRemoveStock={canCreateProduct ? handleRemoveStock : undefined}
                onDelete={canCreateProduct ? ((id: string) => {
                  const product = products.find(p => p.id === id);
                  if (product) handleDelete(product);
                }) : undefined}
                onEdit={canCreateProduct ? handleEdit : undefined}
                onClick={canCreateProduct ? handleEdit : undefined}
                viewMode="list"
                canEdit={canCreateProduct}
                canDelete={canCreateProduct}
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
        isOpen={isAddProductModalOpen && canCreateProduct}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleUpdateProduct}
        editingProduct={editingProduct}
        importedProducts={importedProducts}
      />
      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={(result) => {
          try {
            const productData = JSON.parse(result);
            if (productData.id || productData.code) {
              const productId = productData.id || productData.code;
              const foundProduct = products.find(p => p.id === productId);
              if (foundProduct) {
                setSearchTerm(foundProduct.name);
                setTimeout(() => {
                  const element = document.querySelector(`[data-product-id="${productId}"]`);
                  element?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              } else {
                setSearchTerm(productData.name || productId);
              }
            } else if (productData.name) {
              setSearchTerm(productData.name);
            } else {
              setSearchTerm(result);
            }
          } catch {
            setSearchTerm(result);
          }
        }}
      />
    </Layout>
  );
}

