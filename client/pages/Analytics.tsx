import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/contexts/I18nContext";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Zap,
  Wine,
  ChevronLeft,
  ChevronRight,
  Brain,
  ShoppingCart,
  TrendingDown as TrendingDownIcon,
  Percent,
  Eye,
  Gift,
  AlertCircle,
  Menu,
  Calendar,
  DollarSign as DollarSignIcon,
  FileText,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SalesPrediction {
  date: string;
  predictedRevenue: number;
  confidence: number;
}

interface ReorderRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  dailyConsumption: number;
  daysUntilEmpty: number;
  recommendedOrder: number;
  priority: number;
  category: string;
  unit: string;
}

interface ProfitabilityProduct {
  productId: string;
  name: string;
  category: string;
  revenue: number;
  quantitySold: number;
  profit: number;
  margin: number;
}

interface PriceOptimization {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  priceChange: number;
  expectedRevenue: number;
  reason: string;
}

interface Insight {
  type: string;
  title: string;
  value: string;
  trend: "positive" | "negative" | "neutral" | "warning";
  description: string;
}

type AITool = 
  | "insights"
  | "sales-prediction"
  | "reorder"
  | "profitability"
  | "price-optimization"
  | "recipe-recommendations"
  | "anomaly-detection"
  | "promotion-recommendations"
  | "stockout-prediction"
  | "menu-optimization"
  | "temporal-trends"
  | "dynamic-pricing"
  | "revenue-forecast"
  | "sales-report"
  | "tax-report";

export default function Analytics() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AITool>("insights");
  
  // Optimize sidebar toggle to avoid forced reflows
  const handleSidebarToggle = () => {
    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      setSidebarCollapsed(prev => !prev);
    });
  };
  const [salesPrediction, setSalesPrediction] = useState<{
    predictions: SalesPrediction[];
    averageDailyRevenue: number;
    trend: number;
  } | null>(null);
  const [reorderRecommendations, setReorderRecommendations] = useState<
    ReorderRecommendation[]
  >([]);
  const [profitability, setProfitability] = useState<{
    topProducts: ProfitabilityProduct[];
    totalRevenue: number;
    totalProfit: number;
  } | null>(null);
  const [priceOptimization, setPriceOptimization] = useState<{
    recommendations: PriceOptimization[];
    totalPotentialRevenue: number;
  } | null>(null);
  const [insights, setInsights] = useState<{
    insights: Insight[];
    summary: any;
  } | null>(null);
  const [recipeRecommendations, setRecipeRecommendations] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [promotionRecommendations, setPromotionRecommendations] = useState<any>(null);
  const [stockoutPredictions, setStockoutPredictions] = useState<any>(null);
  const [menuOptimization, setMenuOptimization] = useState<any>(null);
  const [temporalTrends, setTemporalTrends] = useState<any>(null);
  const [dynamicPricing, setDynamicPricing] = useState<any>(null);
  const [revenueForecast, setRevenueForecast] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [taxReport, setTaxReport] = useState<any>(null);

  const getAuthToken = () => {
    return localStorage.getItem("bartender-auth");
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        const username = localStorage.getItem("bartender-username");
        if (username) {
          headers["x-username"] = username;
        }
      }

      try {
        // Fetch all analytics data in parallel
        const [
          predictionRes,
          reorderRes,
          profitabilityRes,
          priceRes,
          insightsRes,
          recipeRes,
          anomalyRes,
          promotionRes,
          stockoutRes,
          menuRes,
          temporalRes,
          dynamicRes,
          forecastRes,
          salesReportRes,
          taxReportRes,
        ] = await Promise.all([
          fetch("/api/analytics/sales-prediction?days=7", { headers }),
          fetch("/api/analytics/reorder-recommendations", { headers }),
          fetch("/api/analytics/profitability", { headers }),
          fetch("/api/analytics/price-optimization", { headers }),
          fetch("/api/analytics/insights", { headers }),
          fetch("/api/analytics/recipe-recommendations", { headers }),
          fetch("/api/analytics/anomaly-detection", { headers }),
          fetch("/api/analytics/promotion-recommendations", { headers }),
          fetch("/api/analytics/stockout-prediction", { headers }),
          fetch("/api/analytics/menu-optimization", { headers }),
          fetch("/api/analytics/temporal-trends", { headers }),
          fetch("/api/analytics/dynamic-pricing", { headers }),
          fetch("/api/analytics/revenue-forecast", { headers }),
          fetch("/api/analytics/sales-report", { headers }),
          fetch("/api/analytics/tax-report", { headers }),
        ]);

        if (predictionRes.ok) {
          const data = await predictionRes.json();
          setSalesPrediction(data);
        }

        if (reorderRes.ok) {
          const data = await reorderRes.json();
          setReorderRecommendations(data.recommendations || []);
        }

        if (profitabilityRes.ok) {
          const data = await profitabilityRes.json();
          setProfitability({
            topProducts: data.topProducts || [],
            totalRevenue: data.totalRevenue || 0,
            totalProfit: data.totalProfit || 0,
          });
        }

        if (priceRes.ok) {
          const data = await priceRes.json();
          setPriceOptimization(data);
        }

        if (insightsRes.ok) {
          const data = await insightsRes.json();
          setInsights(data);
        }

        if (recipeRes.ok) {
          const data = await recipeRes.json();
          setRecipeRecommendations(data);
        }

        if (anomalyRes.ok) {
          const data = await anomalyRes.json();
          setAnomalies(data);
        }

        if (promotionRes.ok) {
          const data = await promotionRes.json();
          setPromotionRecommendations(data);
        }

        if (stockoutRes.ok) {
          const data = await stockoutRes.json();
          setStockoutPredictions(data);
        }

        if (menuRes.ok) {
          const data = await menuRes.json();
          setMenuOptimization(data);
        }

        if (temporalRes.ok) {
          const data = await temporalRes.json();
          setTemporalTrends(data);
        }

        if (dynamicRes.ok) {
          const data = await dynamicRes.json();
          setDynamicPricing(data);
        }

        if (forecastRes.ok) {
          const data = await forecastRes.json();
          setRevenueForecast(data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getPriorityColor = (priority: number) => {
    if (priority === 3) return "text-red-600 dark:text-red-400";
    if (priority === 2) return "text-red-900 dark:text-red-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 3) return "Critique";
    if (priority === 2) return "Urgent";
    return "Important";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "positive") return <TrendingUp className="h-4 w-4" />;
    if (trend === "negative") return <TrendingDown className="h-4 w-4" />;
    if (trend === "warning") return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const aiTools: Array<{ id: AITool; label: string; icon: React.ReactNode }> = [
    { id: "insights", label: "Insights généraux", icon: <Eye className="h-4 w-4" /> },
    { id: "sales-prediction", label: "Prédiction des ventes", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "reorder", label: "Réapprovisionnement", icon: <ShoppingCart className="h-4 w-4" /> },
    { id: "profitability", label: "Rentabilité", icon: <DollarSign className="h-4 w-4" /> },
    { id: "price-optimization", label: "Optimisation des prix", icon: <Percent className="h-4 w-4" /> },
    { id: "recipe-recommendations", label: "Recommandations de recettes", icon: <Wine className="h-4 w-4" /> },
    { id: "anomaly-detection", label: "Détection d'anomalies", icon: <AlertCircle className="h-4 w-4" /> },
    { id: "promotion-recommendations", label: "Promotions", icon: <Gift className="h-4 w-4" /> },
    { id: "stockout-prediction", label: "Rupture de stock", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "menu-optimization", label: "Optimisation du menu", icon: <Menu className="h-4 w-4" /> },
    { id: "temporal-trends", label: "Tendances temporelles", icon: <Clock className="h-4 w-4" /> },
    { id: "dynamic-pricing", label: "Prix dynamique", icon: <DollarSign className="h-4 w-4" /> },
    { id: "revenue-forecast", label: "Prévisions de revenus", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "sales-report", label: "Rapport de ventes", icon: <FileText className="h-4 w-4" /> },
    { id: "tax-report", label: "Rapport de taxes", icon: <Receipt className="h-4 w-4" /> },
  ];

  return (
    <Layout>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div
          className={cn(
            "bg-card border-2 border-foreground/20 rounded-lg flex flex-col flex-shrink-0",
            "transition-[width] duration-300 ease-in-out will-change-[width]",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b-2 border-foreground/20 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Outils IA</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSidebarToggle}
              className="h-8 w-8 ml-auto"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
        </div>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {aiTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                    selectedTool === tool.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                  title={sidebarCollapsed ? tool.label : undefined}
                >
                  {tool.icon}
                  {!sidebarCollapsed && <span>{tool.label}</span>}
                </button>
              ))}
            </div>
          </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                {t.analytics.title}
              </h2>
              <p className="text-muted-foreground mt-1">
                {t.analytics.subtitle} • Insights IA pour maximiser vos profits
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Chargement des analyses...</p>
          </div>
        ) : selectedTool === "insights" ? (
          <>
            {/* Insights Cards */}
            {insights && insights.insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.insights.map((insight, index) => (
                  <Card
                    key={index}
                    className="border-2 border-foreground/20 hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {getTrendIcon(insight.trend)}
                        {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {insight.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Pas encore de données d'analyse disponibles.
                    <br />
                    Les insights IA apparaîtront après quelques ventes.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "sales-prediction" ? (
          <>
            {/* Sales Prediction */}
            {salesPrediction ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Prédiction des ventes (7 prochains jours)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                          Revenu quotidien moyen
                        </div>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          ${salesPrediction.averageDailyRevenue.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Tendance</div>
                        <div
                          className={cn(
                            "text-2xl font-bold mt-1 flex items-center gap-2",
                            salesPrediction.trend >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {salesPrediction.trend >= 0 ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5" />
                          )}
                          {Math.abs(salesPrediction.trend).toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                          Revenu prévu (7 jours)
                        </div>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          $
                          {salesPrediction.predictions
                            .reduce((sum, p) => sum + p.predictedRevenue, 0)
                            .toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {salesPrediction.predictions.map((prediction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-foreground">
                              {new Date(prediction.date).toLocaleDateString("fr-FR", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Confiance: {(prediction.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            ${prediction.predictedRevenue.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Pas encore de données de prédiction disponibles.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "reorder" ? (
          <>
            {/* Reorder Recommendations */}
            {reorderRecommendations.length > 0 ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Recommandations de réapprovisionnement IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reorderRecommendations.slice(0, 5).map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {rec.productName}
                            </span>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                getPriorityColor(rec.priority),
                                "bg-opacity-10"
                              )}
                            >
                              {getPriorityLabel(rec.priority)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              Stock actuel: {rec.currentStock} {rec.unit}
                            </div>
                            <div>
                              Consommation quotidienne: {rec.dailyConsumption.toFixed(2)}{" "}
                              {rec.unit}/jour
                            </div>
                            <div>
                              Jours restants: {rec.daysUntilEmpty.toFixed(1)} jours
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-muted-foreground">
                            Commande recommandée
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {rec.recommendedOrder} {rec.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune recommandation de réapprovisionnement pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "profitability" ? (
          <>
            {/* Profitability Analysis */}
            {profitability && profitability.topProducts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-foreground/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Top produits les plus rentables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profitability.topProducts.slice(0, 5).map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div>
                            <div className="font-semibold text-foreground">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.quantitySold} ventes • Marge:{" "}
                              {(product.margin * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              ${product.profit.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">Profit</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-foreground/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Résumé de rentabilité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                          Revenu total (30 jours)
                        </div>
                        <div className="text-3xl font-bold text-foreground mt-1">
                          ${profitability.totalRevenue.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                        <div className="text-sm text-muted-foreground">Profit total</div>
                        <div className="text-3xl font-bold text-primary mt-1">
                          ${profitability.totalProfit.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Marge moyenne:{" "}
                        {profitability.totalRevenue > 0
                          ? (
                              (profitability.totalProfit / profitability.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Pas encore de données de rentabilité disponibles.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "price-optimization" ? (
          <>
            {/* Price Optimization */}
            {priceOptimization && priceOptimization.recommendations.length > 0 ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    Recommandations de recettes/cocktails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recipeRecommendations.recommendations.slice(0, 5).map((rec: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">{rec.recipeName}</div>
                          <div className="text-sm text-muted-foreground">{rec.reason}</div>
                          {rec.dailySales && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {rec.dailySales} ventes/jour • Profit: ${rec.profit?.toFixed(2) || "N/A"}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className={cn("text-sm font-medium px-2 py-1 rounded", getPriorityColor(rec.priority))}>
                            {rec.recommendation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Wine className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune recommandation de recette pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "anomaly-detection" ? (
          <>
            {/* Anomaly Detection */}
            {anomalies ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Détection d'anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anomalies.anomalies && anomalies.anomalies.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Anomalies détectées</h4>
                        <div className="space-y-2">
                          {anomalies.anomalies.slice(0, 5).map((anomaly: any, index: number) => (
                            <div
                              key={index}
                              className="p-3 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{anomaly.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(anomaly.date).toLocaleDateString("fr-FR")} • ${anomaly.revenue}
                                  </div>
                                </div>
                                <div className={cn(
                                  "text-xs px-2 py-1 rounded",
                                  anomaly.severity === "Élevée" ? "bg-red-500/20 text-red-600" : "bg-red-900/20 text-red-900"
                                )}>
                                  {anomaly.severity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {anomalies.suspiciousTransactions && anomalies.suspiciousTransactions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Transactions suspectes</h4>
                        <div className="space-y-2">
                          {anomalies.suspiciousTransactions.slice(0, 3).map((tx: any, index: number) => (
                            <div key={index} className="p-2 bg-red-900/10 rounded text-sm">
                              ${tx.amount} • {new Date(tx.date).toLocaleDateString("fr-FR")} • {tx.paymentMethod}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune anomalie détectée pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "promotion-recommendations" ? (
          <>
            {/* Promotion Recommendations */}
            {promotionRecommendations && promotionRecommendations.recommendations && promotionRecommendations.recommendations.length > 0 ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Recommandations de promotions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {promotionRecommendations.recommendations.map((promo: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                      >
                        <div className="font-semibold text-foreground mb-1">{promo.itemName}</div>
                        <div className="text-sm text-muted-foreground mb-2">{promo.reason}</div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">Réduction suggérée</div>
                            <div className="text-lg font-bold text-primary">{promo.suggestedDiscount}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Meilleur moment</div>
                            <div className="text-sm font-medium">{promo.bestTime}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">{promo.expectedImpact}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune recommandation de promotion pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "stockout-prediction" ? (
          <>
            {/* Stockout Predictions */}
            {stockoutPredictions && stockoutPredictions.predictions && stockoutPredictions.predictions.length > 0 ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Prédictions de rupture de stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockoutPredictions.predictions.slice(0, 5).map((pred: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-foreground">{pred.productName}</div>
                          <div className={cn(
                            "text-xs px-2 py-1 rounded",
                            pred.riskLevel === "Critique" ? "bg-red-500/20 text-red-600" :
                            pred.riskLevel === "Élevé" ? "bg-red-900/20 text-red-900" :
                            "bg-blue-500/20 text-blue-600"
                          )}>
                            {pred.riskLevel}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">Jours restants</div>
                            <div className="font-bold">{pred.daysUntilStockout.toFixed(1)} jours</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Commande recommandée</div>
                            <div className="font-bold text-primary">{pred.recommendedOrder} {pred.category}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune prédiction de rupture de stock pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "menu-optimization" ? (
          <>
            {/* Menu Optimization */}
            {menuOptimization ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {menuOptimization.itemsToRemove && menuOptimization.itemsToRemove.length > 0 && (
                  <Card className="border-2 border-foreground/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Produits à retirer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {menuOptimization.itemsToRemove.slice(0, 5).map((item: any, index: number) => (
                          <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                            <div className="font-semibold text-foreground">{item.itemName}</div>
                            <div className="text-xs text-muted-foreground">{item.reason}</div>
                            <div className="text-xs text-red-900 mt-1">{item.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {menuOptimization.suggestions && menuOptimization.suggestions.length > 0 && (
                  <Card className="border-2 border-foreground/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Suggestions de nouveaux produits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {menuOptimization.suggestions.map((suggestion: any, index: number) => (
                          <div key={index} className="p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                            <div className="font-semibold text-foreground mb-1">Catégorie: {suggestion.category}</div>
                            <div className="text-sm text-muted-foreground">{suggestion.reason}</div>
                            <div className="text-xs text-primary mt-1">{suggestion.potentialImpact}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Menu className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune recommandation d'optimisation de menu pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "temporal-trends" ? (
          <>
            {/* Temporal Trends */}
            {temporalTrends ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Tendances temporelles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-3">Meilleurs jours</h4>
                    <div className="space-y-2">
                      {temporalTrends.bestDays && temporalTrends.bestDays.slice(0, 3).map((day: any, index: number) => (
                        <div key={index} className="flex justify-between p-2 bg-secondary/30 rounded">
                          <span className="font-medium">{day.dayName}</span>
                          <span className="text-primary font-bold">${day.revenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune donnée de tendances temporelles pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "dynamic-pricing" ? (
          <>
            {/* Dynamic Pricing */}
            {dynamicPricing && dynamicPricing.recommendations && dynamicPricing.recommendations.length > 0 ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Prix dynamiques recommandés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dynamicPricing.recommendations.map((rec: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-foreground">{rec.productName}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">${rec.currentPrice.toFixed(2)}</span>
                            <span className="text-lg font-bold text-primary">${rec.suggestedPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{rec.reason}</div>
                        <div className="text-xs text-primary">{rec.expectedImpact}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Aucune recommandation de prix dynamique pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : selectedTool === "revenue-forecast" ? (
          <>
            {/* Revenue Forecast */}
            {revenueForecast ? (
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Prévisions de revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Revenu annuel prévu</div>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          ${revenueForecast.annualForecast?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Moyenne mensuelle</div>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          ${revenueForecast.averageMonthlyRevenue?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                        <div className="text-sm text-muted-foreground">Tendance</div>
                        <div className={cn(
                          "text-2xl font-bold mt-1 flex items-center gap-2",
                          revenueForecast.trend >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {revenueForecast.trend >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                          {Math.abs(revenueForecast.trend || 0).toFixed(2)}$
                        </div>
                      </div>
                    </div>
                    {revenueForecast.quarterlyForecast && revenueForecast.quarterlyForecast.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Prévisions trimestrielles</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {revenueForecast.quarterlyForecast.map((q: any, index: number) => (
                            <div key={index} className="bg-secondary/30 rounded p-3 text-center">
                              <div className="text-xs text-muted-foreground">{q.quarter}</div>
                              <div className="text-lg font-bold text-primary">${q.predictedRevenue.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
                    Aucune prévision de revenus disponible pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Sélectionnez un outil IA dans la barre latérale
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}
