import Layout from "@/components/Layout";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Sales reports, inventory trends, and business insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              Sales Analytics
            </h3>
            <p className="text-sm text-muted-foreground">
              Track daily, weekly, and monthly sales performance
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              Inventory Trends
            </h3>
            <p className="text-sm text-muted-foreground">
              Analyze product popularity and stock turnover
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              Revenue Reports
            </h3>
            <p className="text-sm text-muted-foreground">
              View detailed revenue breakdowns by category
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Analytics dashboard coming soon. Continue adding features to build
            out this section!
          </p>
        </div>
      </div>
    </Layout>
  );
}
