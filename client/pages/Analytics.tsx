import Layout from "@/components/Layout";
import { BarChart3 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

export default function Analytics() {
  const { t } = useI18n();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.analytics.title}</h2>
          <p className="text-muted-foreground mt-1">
            {t.analytics.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              {t.analytics.salesAnalytics}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t.analytics.salesAnalyticsDesc}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              {t.analytics.inventoryTrends}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t.analytics.inventoryTrendsDesc}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              {t.analytics.revenueReports}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t.analytics.revenueReportsDesc}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            {t.analytics.comingSoon}
          </p>
        </div>
      </div>
    </Layout>
  );
}
