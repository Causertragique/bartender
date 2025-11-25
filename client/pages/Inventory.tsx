import { useState } from "react";
import Layout from "@/components/Layout";
import ProductCard, { Product } from "@/components/ProductCard";
import { Plus, Search } from "lucide-react";

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
    category: "liquor",
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
    category: "snacks",
    price: 4.99,
    quantity: 15,
    unit: "bags",
    lastRestocked: "2024-01-19",
  },
  {
    id: "8",
    name: "Pretzels",
    category: "snacks",
    price: 3.49,
    quantity: 22,
    unit: "bags",
    lastRestocked: "2024-01-20",
  },
];

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "liquor" | "beer" | "snacks"
  >("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
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
    setProducts(products.filter((p) => p.id !== id));
  };

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount = products.filter((p) => p.quantity < 5).length;

  const categories: Array<"all" | "spirits" | "liquor" | "beer" | "snacks"> = [
    "all",
    "spirits",
    "liquor",
    "beer",
    "snacks",
  ];
  const categoryLabels = {
    all: "All Products",
    spirits: "Spirits",
    liquor: "Liquor",
    beer: "Beer",
    snacks: "Snacks",
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Inventory</h2>
            <p className="text-muted-foreground mt-1">
              Manage your bar stock levels and products
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total Inventory Value
            </p>
            <p className="text-2xl font-bold text-primary mt-2">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total Products
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {products.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Low Stock Items
            </p>
            <p
              className={`text-2xl font-bold mt-2 ${
                lowStockCount > 0 ? "text-warning" : "text-success"
              }`}
            >
              {lowStockCount}
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddStock={handleAddStock}
              onRemoveStock={handleRemoveStock}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
