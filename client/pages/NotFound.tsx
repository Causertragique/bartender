import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { AlertCircle, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-warning/20 rounded-full">
              <AlertCircle className="h-12 w-12 text-warning" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-lg text-muted-foreground">
            This page doesn't exist yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Continue building out your BarFlow system by exploring the available features below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/"
            className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Inventory
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Manage stock levels and products
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/sales"
            className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Point of Sale
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ring up sales and process orders
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/analytics"
            className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="text-left">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Analytics
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                View reports and insights
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
