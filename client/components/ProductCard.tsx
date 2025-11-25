import { Edit2, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  category: "spirits" | "liquor" | "beer" | "snacks";
  price: number;
  quantity: number;
  unit: string;
  lastRestocked?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onAddStock?: (id: string, amount: number) => void;
  onRemoveStock?: (id: string, amount: number) => void;
  onClick?: (product: Product) => void;
}

const categoryColors = {
  spirits: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  liquor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  beer: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  snacks: "bg-green-500/20 text-green-300 border-green-500/30",
};

const categoryLabels = {
  spirits: "Spirits",
  liquor: "Liquor",
  beer: "Beer",
  snacks: "Snacks",
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onAddStock,
  onRemoveStock,
  onClick,
}: ProductCardProps) {
  const isLowStock = product.quantity < 5;

  return (
    <div
      onClick={() => onClick?.(product)}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-foreground line-clamp-2">
              {product.name}
            </h3>
            <span
              className={cn(
                "inline-block mt-2 text-xs font-medium px-2 py-1 rounded border",
                categoryColors[product.category],
              )}
            >
              {categoryLabels[product.category]}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Stock Status */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stock Level</span>
            <span
              className={cn(
                "text-sm font-semibold",
                isLowStock ? "text-amber-300" : "text-green-400",
              )}
            >
              {product.quantity} {product.unit}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                isLowStock ? "bg-amber-500" : "bg-green-500",
              )}
              style={{
                width: `${Math.min((product.quantity / 20) * 100, 100)}%`,
              }}
            />
          </div>
          {isLowStock && (
            <p className="text-xs text-warning font-medium">Low stock!</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddStock?.(product.id, 1);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-success/20 text-success hover:bg-success/30 rounded transition-colors text-xs font-medium"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveStock?.(product.id, 1);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-destructive/20 text-destructive hover:bg-destructive/30 rounded transition-colors text-xs font-medium"
          >
            <Minus className="h-3 w-3" />
            Remove
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(product);
            }}
            className="p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(product.id);
            }}
            className="p-2 hover:bg-destructive/20 rounded transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
