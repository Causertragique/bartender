import { Edit2, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo, useRef, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other";
  price: number;
  quantity: number;
  unit: string;
  lastRestocked?: string;
  imageUrl?: string;
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
  spirits: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/30",
  wine: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30",
  beer: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30",
  soda: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30",
  juice: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30",
  other: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30",
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onAddStock,
  onRemoveStock,
  onClick,
}: ProductCardProps) {
  const { t } = useI18n();
  const isLowStock = product.quantity < 5;
  const [showQRCode, setShowQRCode] = useState(false);

  const categoryLabels = {
    spirits: t.productCard.categories?.spirits || "Spiritueux",
    wine: t.productCard.categories?.wine || "Vin",
    beer: t.productCard.categories?.beer || "Bière",
    soda: t.productCard.categories?.soda || "Boissons gazeuses",
    juice: t.productCard.categories?.juice || "Jus",
    other: t.productCard.categories?.other || "Autres",
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

  // Generate QR code data for the product
  const qrCodeValue = useMemo(() => {
    return JSON.stringify({
      id: product.id,
      name: product.name,
      code: product.id,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    });
  }, [product]);

  // Calculate progress bar width
  const progressWidth = useMemo(
    () => Math.min((product.quantity / 20) * 100, 100),
    [product.quantity],
  );

  // Use ref to set dynamic width without inline styles
  const progressBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progressWidth}%`;
    }
  }, [progressWidth]);

  return (
    <div
      onClick={() => onClick?.(product)}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Product Image */}
            {product.imageUrl && (
              <div className="w-[100px] h-[100px] rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
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
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
            {/* QR Code */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQRCode(!showQRCode);
                }}
                className="p-1 hover:bg-secondary rounded transition-colors"
                aria-label="Toggle QR code"
                title="Show/Hide QR Code"
              >
                <QRCodeSVG
                  value={qrCodeValue}
                  size={60}
                  level="M"
                  includeMargin={false}
                />
              </button>
              {/* Expanded QR Code on hover/click */}
              {showQRCode && (
                <div className="absolute top-full right-0 mt-2 z-10 p-3 bg-card border border-border rounded-lg shadow-lg">
                  <div className="flex flex-col items-center gap-2">
                    <QRCodeSVG
                      value={qrCodeValue}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="text-xs text-muted-foreground text-center max-w-[120px] break-words">
                      {product.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {product.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.productCard.stockLevel}</span>
            <span
              className={cn(
                "text-sm font-semibold",
                isLowStock ? "text-amber-600 dark:text-amber-300" : "text-green-600 dark:text-green-400",
              )}
            >
              {product.quantity} {translateUnit(product.unit)}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              ref={progressBarRef}
              className={cn(
                "h-full transition-all",
                isLowStock ? "bg-amber-500 dark:bg-amber-500" : "bg-green-500 dark:bg-green-500",
              )}
            />
          </div>
          {isLowStock && (
            <p className="text-xs text-amber-600 dark:text-amber-300 font-medium">{t.productCard.lowStock}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddStock?.(product.id, 1);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 rounded transition-colors text-xs font-medium border border-green-300 dark:border-green-500/30"
          >
            <Plus className="h-3 w-3" />
            {t.productCard.add}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveStock?.(product.id, 1);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-100 dark:bg-destructive/20 text-red-700 dark:text-destructive hover:bg-red-200 dark:hover:bg-destructive/30 rounded transition-colors text-xs font-medium border border-red-300 dark:border-destructive/30"
          >
            <Minus className="h-3 w-3" />
            {t.productCard.remove}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(product);
            }}
            className="p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Edit product"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(product.id);
            }}
            className="p-2 hover:bg-destructive/20 rounded transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
