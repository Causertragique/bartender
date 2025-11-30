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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground/20 bg-card w-full flex-shrink-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <picture>
                <source srcSet="/tonneau.webp" type="image/webp" />
                <source srcSet="/tonneau-optimized.png" type="image/png" />
                <img
                  src="/tonneau.png"
                  alt={t.layout.appName}
                  className="h-20 sm:h-24 md:h-28 w-auto object-contain"
                  width="140"
                  height="140"
                  loading="eager"
                  // @ts-ignore - fetchpriority is valid HTML attribute
                  fetchpriority="high"
                />
              </picture>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold break-words">{t.layout.appName}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground break-words hidden sm:block">
                  {t.layout.appSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors flex-shrink-0"
              title="Déconnexion"
            >
              <LogOut className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="hidden sm:inline text-xs">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-background w-full max-w-full overflow-x-hidden flex-1 pb-16 sm:pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t-2 border-foreground/20 bg-card w-full z-50 safe-area-inset-bottom">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-3 font-medium text-xs transition-all relative flex-1 min-w-0",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0", active && "text-primary")} />
                  <span className="text-[10px] sm:text-xs text-center break-words line-clamp-1">{item.label}</span>
                  {active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
