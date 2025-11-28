import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, ShoppingCart, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t } = useI18n();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: t.layout.nav.inventory,
      path: "/",
      icon: Package,
    },
    {
      label: t.layout.nav.sales,
      path: "/sales",
      icon: ShoppingCart,
    },
    {
      label: t.layout.nav.analytics,
      path: "/analytics",
      icon: BarChart3,
    },
    {
      label: t.layout.nav.settings,
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo_bar.png"
                alt={t.layout.appName}
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">{t.layout.appName}</h1>
                <p className="text-xs text-muted-foreground">
                  {t.layout.appSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2",
                    active
                      ? "border-primary text-primary bg-background/50"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
