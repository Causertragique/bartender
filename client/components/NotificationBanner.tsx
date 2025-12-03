import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const getNotificationSettings = () => {
  const stored = localStorage.getItem("bartender-settings");
  if (stored) {
    try {
      const settings = JSON.parse(stored);
      return {
        lowStockAlerts: settings.lowStockAlerts ?? true,
        salesReports: settings.salesReports ?? true,
        weeklySummary: settings.weeklySummary ?? true,
      };
    } catch {
      return {
        lowStockAlerts: true,
        salesReports: true,
        weeklySummary: true,
      };
    }
  }
  return {
    lowStockAlerts: true,
    salesReports: true,
    weeklySummary: true,
  };
};

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si la bannière a déjà été affichée
    const bannerShown = localStorage.getItem("bartender-notification-banner-shown");
    if (bannerShown) {
      return; // Déjà affichée, ne pas afficher
    }

    // Vérifier si les notifications sont déjà activées
    const settings = getNotificationSettings();
    const notificationsEnabled = 
      settings.lowStockAlerts || 
      settings.salesReports || 
      settings.weeklySummary;

    // Si les notifications sont déjà activées, ne pas afficher la bannière
    if (notificationsEnabled) {
      // Marquer comme affichée pour éviter de la réafficher
      localStorage.setItem("bartender-notification-banner-shown", "true");
      return;
    }

    // Afficher la bannière
    setIsVisible(true);

    // Fermer automatiquement après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("bartender-notification-banner-shown", "true");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Marquer la bannière comme affichée
    localStorage.setItem("bartender-notification-banner-shown", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Bell className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm sm:text-base flex-1">
              Activez les notifications pour être alerté lorsque votre stock est faible ou pour recevoir vos rapports de ventes.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
            aria-label="Fermer la bannière"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

