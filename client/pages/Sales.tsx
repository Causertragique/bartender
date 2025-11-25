import { useState } from "react";
import Layout from "@/components/Layout";
import PaymentModal from "@/components/PaymentModal";
import { Product } from "@/components/ProductCard";
import { Trash2, Plus, Minus, CreditCard, DollarSign } from "lucide-react";

interface CartItem extends Product {
  cartQuantity: number;
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
    category: "liquor",
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
    category: "snacks",
    price: 4.99,
    quantity: 15,
    unit: "bag",
  },
  {
    id: "8",
    name: "Pretzels",
    category: "snacks",
    price: 3.49,
    quantity: 22,
    unit: "bag",
  },
  {
    id: "9",
    name: "Margarita Mix",
    category: "liquor",
    price: 6.99,
    quantity: 5,
    unit: "drink",
  },
  {
    id: "10",
    name: "Mojito Mix",
    category: "liquor",
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
    category: "snacks",
    price: 2.99,
    quantity: 30,
    unit: "bag",
  },
];

const categoryColors = {
  spirits: "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
  liquor: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
  beer: "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",
  snacks: "bg-green-500/20 text-green-300 hover:bg-green-500/30",
};

export default function Sales() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "liquor" | "beer" | "snacks"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const categories: Array<"all" | "spirits" | "liquor" | "beer" | "snacks"> = [
    "all",
    "spirits",
    "liquor",
    "beer",
    "snacks",
  ];
  const categoryLabels = {
    all: "All",
    spirits: "Spirits",
    liquor: "Liquor",
    beer: "Beer",
    snacks: "Snacks",
  };

  const filteredProducts = PRODUCTS_FOR_SALE.filter(
    (p) => filterCategory === "all" || p.category === filterCategory,
  );

  const addToCart = (product: Product) => {
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
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    }
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

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (paymentMethod === "cash") {
      alert(`Cash payment received! Total: $${total.toFixed(2)}`);
      setCart([]);
      setPaymentMethod(null);
    } else if (paymentMethod === "card") {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setCart([]);
    setPaymentMethod(null);
    alert(`Order completed! Total: $${total.toFixed(2)}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">Point of Sale</h2>
          <p className="text-muted-foreground mt-1">
            Process customer orders and ring up sales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter */}
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

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`p-3 rounded-lg border border-border transition-all text-left hover:scale-105 active:scale-95 ${categoryColors[product.category]}`}
                >
                  <p className="font-semibold text-sm line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-lg font-bold mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-xs opacity-75 mt-1">{product.unit}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-bold text-lg text-foreground">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No items in cart
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-secondary rounded border border-border/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartQuantity - 1)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
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
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              {cart.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Payment Method
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "cash"
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "card"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Card
                    </button>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !paymentMethod}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        amount={total}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </Layout>
  );
}
