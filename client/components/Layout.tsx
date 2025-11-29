import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, ShoppingCart, Package, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    // Remove authentication token
    localStorage.removeItem("bartender-auth");
    // Redirect to home page
    navigate("/");
  };

  const navItems = [
    {
      label: t.layout.nav.inventory,
      path: "/inventory",
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
      <header className="border-b-2 border-foreground/20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <picture>
                <source srcSet="/tonneau.webp" type="image/webp" />
                <source srcSet="/tonneau-optimized.png" type="image/png" />
                <img
                  src="/tonneau.png"
                  alt={t.layout.appName}
                  className="h-20 w-auto object-contain"
                  width="110"
                  height="110"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
              <div>
                <h1 className="text-2xl font-bold">{t.layout.appName}</h1>
                <p className="text-xs text-muted-foreground">
                  {t.layout.appSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b-2 border-foreground/20 bg-secondary">
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
                    "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative",
                    active
                      ? "text-primary-foreground bg-primary font-semibold rounded-t-lg shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-t-lg",
                  )}
                >
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground/20" />
                  )}
                  <Icon className={cn("h-4 w-4", active && "text-primary-foreground")} />
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
