import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, ShoppingCart, Package, Settings, LogOut, ChevronLeft, ChevronRight, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { BarProfileSetupModal } from "@/components/BarProfileSetupModal";
import { getCurrentUserRole, hasPermission } from "@/lib/permissions";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // État du modal de setup du profil
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  
  // État de la sidebar (rétractée ou non)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("bartender-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  // Vérifier si c'est la première visite et afficher le modal de setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenSetup = localStorage.getItem("bartender-profile-setup-seen");
      const isAuthenticated = localStorage.getItem("bartender-auth");
      
      if (isAuthenticated && !hasSeenSetup) {
        // Attendre un peu avant d'afficher le modal (pour que la page se charge complètement)
        const timer = setTimeout(() => {
          setShowProfileSetup(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Sauvegarder l'état de la sidebar
  useEffect(() => {
    localStorage.setItem("bartender-sidebar-collapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const isActive = (path: string) => location.pathname === path;

  const handleProfileSetupComplete = (profile: any) => {
    // Fusionner le profil avec les paramètres existants
    const existingSettings = localStorage.getItem("bartender-settings");
    const currentSettings = existingSettings ? JSON.parse(existingSettings) : {};
    
    const updatedSettings = {
      ...currentSettings,
      ...profile,
    };
    
    localStorage.setItem("bartender-settings", JSON.stringify(updatedSettings));
    localStorage.setItem("bartender-profile-setup-seen", "true");
    setShowProfileSetup(false);
  };

  const handleLogout = () => {
    // Clear all analytics cache
    const userId = localStorage.getItem("bartender-user-id");
    if (userId) {
      const tools = [
        "sales-prediction", "insights", "reorder", "profitability",
        "price-optimization", "food-wine-pairing", "promotion-recommendations",
        "stockout-prediction", "menu-optimization", "temporal-trends",
        "dynamic-pricing", "revenue-forecast"
      ];
      tools.forEach(tool => {
        localStorage.removeItem(`analytics-cache-${userId}-${tool}`);
      });
    }
    // Remove authentication token
    localStorage.removeItem("bartender-auth");
    // Redirect to home page
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Récupérer le rôle de l'utilisateur pour les permissions
  const userRole = getCurrentUserRole();
  const canViewAuditLogs = hasPermission(userRole, "canViewAuditLogs");

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
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    // Audit Logs - visible seulement pour managers et au-dessus
    ...(canViewAuditLogs ? [{
      label: "Logs d'audit",
      path: "/audit-logs",
      icon: Shield,
    }] : []),
    {
      label: t.layout.nav.settings,
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground flex flex-col lg:flex-row">
      {/* Sidebar Navigation - Desktop only */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r-2 border-foreground/20 bg-card transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-40",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground/20">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <picture>
                <source srcSet="/tonneau.webp" type="image/webp" />
                <source srcSet="/tonneau-optimized.png" type="image/png" />
                <img
                  src="/tonneau.png"
                  alt={t.layout.appName}
                  className="h-8 w-auto object-contain"
                  width="140"
                  height="140"
                  loading="eager"
                />
              </picture>
              <div className="min-w-0">
                <h1 className="text-lg font-bold break-words truncate">{t.layout.appName}</h1>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors flex-shrink-0 ml-auto"
            title={sidebarCollapsed ? "Étendre" : "Rétracter"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-7 w-7" />
            ) : (
              <ChevronLeft className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-6 w-6 flex-shrink-0", active && "text-primary-foreground")} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {active && !sidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t-2 border-foreground/20 p-4 space-y-2">
          <div className="w-full">
            <NotificationDropdown />
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              sidebarCollapsed && "justify-center"
            )}
            title={sidebarCollapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="h-6 w-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        "lg:transition-all lg:duration-300 lg:ease-in-out",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Header - Mobile only */}
        <header className={`lg:hidden border-b-2 border-foreground/20 bg-card w-full flex-shrink-0`}>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <picture>
                  <source srcSet="/tonneau.webp" type="image/webp" />
                  <source srcSet="/tonneau-optimized.png" type="image/png" />
                  <img
                    src="/tonneau.png"
                    alt={t.layout.appName}
                    className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                    width="140"
                    height="140"
                    loading="eager"
                  />
                </picture>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold break-words">{t.layout.appName}</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground break-words hidden sm:block">
                    {t.layout.appSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors flex-shrink-0"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline text-xs">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-background w-full max-w-full overflow-x-hidden flex-1 pb-16 lg:pb-0">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>

        {/* Bottom Navigation - Mobile only */}
        <nav className="fixed bottom-0 left-0 right-0 border-t-2 border-foreground/20 bg-card w-full z-50 safe-area-inset-bottom lg:hidden">
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

        {/* Modal de setup du profil à la première connexion */}
        <BarProfileSetupModal
          isOpen={showProfileSetup}
          onClose={() => {
            localStorage.setItem("bartender-profile-setup-seen", "true");
            setShowProfileSetup(false);
          }}
          onComplete={handleProfileSetupComplete}
        />
      </div>
    </div>
  );
}
