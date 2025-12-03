import React, { useState, useEffect } from "react";
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
  Brain,
  ShoppingCart,
  TrendingDown as TrendingDownIcon,
  Eye,
  Gift,
  UtensilsCrossed,
  Menu,
  Calendar,
  RefreshCw,
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
  | "food-wine-pairing"
  | "promotion-recommendations"
  | "stockout-prediction"
  | "menu-optimization"
  | "temporal-trends"
  | "dynamic-pricing"
  | "revenue-forecast";

export default function Analytics() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<AITool>("insights");
  const [salesPrediction, setSalesPrediction] = useState<{
    predictions: SalesPrediction[];
    averageDailyRevenue: number;
    trend: number;
    topSellers?: Array<{
      product: string;
      reason: string;
    }>;
    region?: string;
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
  const [foodWinePairing, setFoodWinePairing] = useState<any>(null);
  const [promotionRecommendations, setPromotionRecommendations] = useState<any>(null);
  const [stockoutPredictions, setStockoutPredictions] = useState<any>(null);
  const [menuOptimization, setMenuOptimization] = useState<any>(null);
  const [temporalTrends, setTemporalTrends] = useState<any>(null);
  const [dynamicPricing, setDynamicPricing] = useState<any>(null);
  const [revenueForecast, setRevenueForecast] = useState<any>(null);
  
  // États de chargement individuels pour chaque outil
  const [loadingTools, setLoadingTools] = useState<Record<AITool, boolean>>({
    "insights": false,
    "sales-prediction": false,
    "reorder": false,
    "profitability": false,
    "price-optimization": false,
    "food-wine-pairing": false,
    "promotion-recommendations": false,
    "stockout-prediction": false,
    "menu-optimization": false,
    "temporal-trends": false,
    "dynamic-pricing": false,
    "revenue-forecast": false,
  });

  // États d'erreur pour chaque outil
  const [errors, setErrors] = useState<Record<AITool, string | null>>({
    "insights": null,
    "sales-prediction": null,
    "reorder": null,
    "profitability": null,
    "price-optimization": null,
    "food-wine-pairing": null,
    "promotion-recommendations": null,
    "stockout-prediction": null,
    "menu-optimization": null,
    "temporal-trends": null,
    "dynamic-pricing": null,
    "revenue-forecast": null,
  });

  // Clé de stockage avec le userId pour isolation par utilisateur
  const getStorageKey = (tool: AITool) => {
    const userId = localStorage.getItem("bartender-user-id") || "default";
    return `analytics-cache-${userId}-${tool}`;
  };

  // Sauvegarder les résultats dans localStorage
  const saveToCache = (tool: AITool, data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(getStorageKey(tool), JSON.stringify(cacheData));
      console.log(`[Analytics] Cache sauvegardé pour ${tool}`);
    } catch (error) {
      console.warn(`[Analytics] Impossible de sauvegarder le cache pour ${tool}:`, error);
    }
  };

  // Charger les résultats depuis localStorage
  const loadFromCache = (tool: AITool) => {
    try {
      const cached = localStorage.getItem(getStorageKey(tool));
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        console.log(`[Analytics] Cache chargé pour ${tool}, timestamp:`, new Date(timestamp));
        return data;
      }
    } catch (error) {
      console.warn(`[Analytics] Impossible de charger le cache pour ${tool}:`, error);
    }
    return null;
  };

  // Nettoyer tout le cache (appelé à la déconnexion)
  const clearAllCache = () => {
    const userId = localStorage.getItem("bartender-user-id") || "default";
    const tools: AITool[] = [
      "insights", "sales-prediction", "reorder", "profitability", 
      "price-optimization", "food-wine-pairing", "promotion-recommendations",
      "stockout-prediction", "menu-optimization", "temporal-trends",
      "dynamic-pricing", "revenue-forecast"
    ];
    tools.forEach(tool => {
      localStorage.removeItem(`analytics-cache-${userId}-${tool}`);
    });
    console.log("[Analytics] Cache nettoyé pour tous les outils");
  };

  // Restaurer les données au chargement du composant
  useEffect(() => {
    const cachedInsights = loadFromCache("insights");
    if (cachedInsights) setInsights(cachedInsights);
    
    const cachedSalesPrediction = loadFromCache("sales-prediction");
    if (cachedSalesPrediction) setSalesPrediction(cachedSalesPrediction);
    
    const cachedReorder = loadFromCache("reorder");
    if (cachedReorder) setReorderRecommendations(cachedReorder);
    
    const cachedProfitability = loadFromCache("profitability");
    if (cachedProfitability) setProfitability(cachedProfitability);
    
    const cachedPriceOptimization = loadFromCache("price-optimization");
    if (cachedPriceOptimization) setPriceOptimization(cachedPriceOptimization);
    
    const cachedFoodWine = loadFromCache("food-wine-pairing");
    if (cachedFoodWine) setFoodWinePairing(cachedFoodWine);
    
    const cachedPromotions = loadFromCache("promotion-recommendations");
    if (cachedPromotions) setPromotionRecommendations(cachedPromotions);
    
    const cachedStockout = loadFromCache("stockout-prediction");
    if (cachedStockout) setStockoutPredictions(cachedStockout);
    
    const cachedMenu = loadFromCache("menu-optimization");
    if (cachedMenu) setMenuOptimization(cachedMenu);
    
    const cachedTemporal = loadFromCache("temporal-trends");
    if (cachedTemporal) setTemporalTrends(cachedTemporal);
    
    const cachedDynamic = loadFromCache("dynamic-pricing");
    if (cachedDynamic) setDynamicPricing(cachedDynamic);
    
    const cachedRevenue = loadFromCache("revenue-forecast");
    if (cachedRevenue) setRevenueForecast(cachedRevenue);
    
    console.log("[Analytics] Données restaurées depuis le cache");
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("bartender-auth");
  };

  const getHeaders = (): HeadersInit => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
    const token = getAuthToken();
    console.log("[Analytics] Token présent:", !!token);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        const username = localStorage.getItem("bartender-username");
        const userId = localStorage.getItem("bartender-user-id");
        if (username) {
          headers["x-username"] = username;
        }
        if (userId) {
          headers["x-user-id"] = userId;
        }
      }
    console.log("[Analytics] Headers:", Object.keys(headers));
    return headers;
  };

  // Fonctions pour déclencher chaque appel API
  const fetchSalesPrediction = async () => {
    console.log("[Analytics] fetchSalesPrediction appelé");
    setLoadingTools(prev => ({ ...prev, "sales-prediction": true }));
    setErrors(prev => ({ ...prev, "sales-prediction": null }));
    try {
      const region = (localStorage.getItem("bartender-settings") ? JSON.parse(localStorage.getItem("bartender-settings")!).taxRegion : "quebec") || "quebec";
      console.log("[Analytics] Envoi requête à /api/analytics/sales-prediction avec région:", region);
      const res = await fetch(`/api/analytics/sales-prediction?days=7&region=${encodeURIComponent(region)}`, { headers: getHeaders() });
      console.log("[Analytics] Réponse reçue:", res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.predictions || data.averageDailyRevenue !== undefined)) {
          setSalesPrediction(data);
          saveToCache("sales-prediction", data);
        } else {
          setErrors(prev => ({ ...prev, "sales-prediction": "Aucune donnée générée. Vérifiez que vous avez des ventes dans votre inventaire." }));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Erreur ${res.status} du serveur` }));
        console.error("[Analytics] Erreur serveur:", errorData);
        setErrors(prev => ({ ...prev, "sales-prediction": errorData.error || errorData.message || `Erreur ${res.status} lors de la génération` }));
      }
    } catch (error: any) {
      console.error("Error fetching sales prediction:", error);
      setErrors(prev => ({ ...prev, "sales-prediction": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "sales-prediction": false }));
    }
  };

  const fetchReorderRecommendations = async () => {
    setLoadingTools(prev => ({ ...prev, "reorder": true }));
    try {
      const res = await fetch("/api/analytics/reorder-recommendations", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setReorderRecommendations(data.recommendations || []);
          saveToCache("reorder", data.recommendations || []);
        }
    } catch (error) {
      console.error("Error fetching reorder recommendations:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "reorder": false }));
    }
  };

  const fetchProfitability = async () => {
    setLoadingTools(prev => ({ ...prev, "profitability": true }));
    try {
      const res = await fetch("/api/analytics/profitability", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setProfitability({
            topProducts: data.topProducts || [],
            totalRevenue: data.totalRevenue || 0,
            totalProfit: data.totalProfit || 0,
          });
          saveToCache("profitability", {
            topProducts: data.topProducts || [],
            totalRevenue: data.totalRevenue || 0,
            totalProfit: data.totalProfit || 0,
          });
        }
    } catch (error) {
      console.error("Error fetching profitability:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "profitability": false }));
    }
  };

  const fetchPriceOptimization = async () => {
    setLoadingTools(prev => ({ ...prev, "price-optimization": true }));
    try {
      const res = await fetch("/api/analytics/price-optimization", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setPriceOptimization(data);
          saveToCache("price-optimization", data);
        }
    } catch (error) {
      console.error("Error fetching price optimization:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "price-optimization": false }));
    }
  };

  const fetchInsights = async () => {
    console.log("[Analytics] fetchInsights appelé");
    setLoadingTools(prev => ({ ...prev, "insights": true }));
    setErrors(prev => ({ ...prev, "insights": null }));
    try {
      console.log("[Analytics] Envoi requête à /api/analytics/insights");
      const res = await fetch("/api/analytics/insights", { headers: getHeaders() });
      console.log("[Analytics] Réponse reçue:", res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        if (data && data.insights && data.insights.length > 0) {
          setInsights(data);
          saveToCache("insights", data);
        } else {
          setErrors(prev => ({ ...prev, "insights": "Aucun insight généré. Vérifiez que vous avez des ventes et que votre clé OpenAI est configurée dans .env" }));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Erreur ${res.status} du serveur` }));
        console.error("[Analytics] Erreur serveur:", errorData);
        setErrors(prev => ({ ...prev, "insights": errorData.error || errorData.message || `Erreur ${res.status} lors de la génération` }));
      }
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      setErrors(prev => ({ ...prev, "insights": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "insights": false }));
    }
  };

  const fetchFoodWinePairing = async () => {
    console.log("[Analytics] fetchFoodWinePairing appelé");
    setLoadingTools(prev => ({ ...prev, "food-wine-pairing": true }));
    setErrors(prev => ({ ...prev, "food-wine-pairing": null }));
    try {
      console.log("[Analytics] Envoi requête à /api/analytics/food-wine-pairing");
      const res = await fetch("/api/analytics/food-wine-pairing", { headers: getHeaders() });
      console.log("[Analytics] Réponse reçue:", res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        if (data && data.pairings && data.pairings.length > 0) {
          setFoodWinePairing(data);
          saveToCache("food-wine-pairing", data);
        } else {
          setErrors(prev => ({ ...prev, "food-wine-pairing": "Aucun accord généré. Ajoutez des vins à votre inventaire et vérifiez que votre clé OpenAI est configurée dans .env" }));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Erreur ${res.status} du serveur` }));
        console.error("[Analytics] Erreur serveur:", errorData);
        setErrors(prev => ({ ...prev, "food-wine-pairing": errorData.error || errorData.message || `Erreur ${res.status} lors de la génération` }));
        }
    } catch (error: any) {
      console.error("Error fetching food-wine pairing:", error);
      setErrors(prev => ({ ...prev, "food-wine-pairing": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "food-wine-pairing": false }));
    }
  };

  const fetchPromotionRecommendations = async () => {
    setLoadingTools(prev => ({ ...prev, "promotion-recommendations": true }));
    try {
      const res = await fetch("/api/analytics/promotion-recommendations", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setPromotionRecommendations(data);
          saveToCache("promotion-recommendations", data);
        }
    } catch (error) {
      console.error("Error fetching promotion recommendations:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "promotion-recommendations": false }));
    }
  };

  const fetchStockoutPrediction = async () => {
    setLoadingTools(prev => ({ ...prev, "stockout-prediction": true }));
    try {
      const res = await fetch("/api/analytics/stockout-prediction", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setStockoutPredictions(data);
          saveToCache("stockout-prediction", data);
        }
    } catch (error) {
      console.error("Error fetching stockout prediction:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "stockout-prediction": false }));
    }
  };

  const fetchMenuOptimization = async () => {
    setLoadingTools(prev => ({ ...prev, "menu-optimization": true }));
    try {
      const res = await fetch("/api/analytics/menu-optimization", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setMenuOptimization(data);
          saveToCache("menu-optimization", data);
        }
    } catch (error) {
      console.error("Error fetching menu optimization:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "menu-optimization": false }));
    }
  };

  const fetchTemporalTrends = async () => {
    setLoadingTools(prev => ({ ...prev, "temporal-trends": true }));
    try {
      const res = await fetch("/api/analytics/temporal-trends", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setTemporalTrends(data);
          saveToCache("temporal-trends", data);
        }
    } catch (error) {
      console.error("Error fetching temporal trends:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "temporal-trends": false }));
    }
  };

  const fetchDynamicPricing = async () => {
    setLoadingTools(prev => ({ ...prev, "dynamic-pricing": true }));
    try {
      const res = await fetch("/api/analytics/dynamic-pricing", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setDynamicPricing(data);
          saveToCache("dynamic-pricing", data);
        }
    } catch (error) {
      console.error("Error fetching dynamic pricing:", error);
    } finally {
      setLoadingTools(prev => ({ ...prev, "dynamic-pricing": false }));
    }
  };

  const fetchRevenueForecast = async () => {
    setLoadingTools(prev => ({ ...prev, "revenue-forecast": true }));
    try {
      const res = await fetch("/api/analytics/revenue-forecast", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
          setRevenueForecast(data);
          saveToCache("revenue-forecast", data);
        }
      } catch (error) {
      console.error("Error fetching revenue forecast:", error);
      } finally {
      setLoadingTools(prev => ({ ...prev, "revenue-forecast": false }));
      }
    };

  // Mapping des fonctions de fetch par outil
  const fetchFunctions: Record<AITool, () => Promise<void>> = {
    "insights": fetchInsights,
    "sales-prediction": fetchSalesPrediction,
    "reorder": fetchReorderRecommendations,
    "profitability": fetchProfitability,
    "price-optimization": fetchPriceOptimization,
    "food-wine-pairing": fetchFoodWinePairing,
    "promotion-recommendations": fetchPromotionRecommendations,
    "stockout-prediction": fetchStockoutPrediction,
    "menu-optimization": fetchMenuOptimization,
    "temporal-trends": fetchTemporalTrends,
    "dynamic-pricing": fetchDynamicPricing,
    "revenue-forecast": fetchRevenueForecast,
  };

  // Vérifier que toutes les fonctions sont définies
  console.log("[Analytics] Fonctions disponibles:", Object.keys(fetchFunctions));

  // Composant helper pour afficher un état vide avec bouton
  const EmptyStateWithButton = ({ 
    icon: Icon, 
    message, 
    toolId, 
    buttonLabel 
  }: { 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
    message: string; 
    toolId: AITool; 
    buttonLabel: string;
  }) => (
    <Card className="border-2 border-foreground/20">
      <CardContent className="py-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button onClick={() => {
          console.log("[Analytics] Bouton cliqué pour:", toolId);
          console.log("[Analytics] Fonction disponible:", !!fetchFunctions[toolId]);
          if (fetchFunctions[toolId]) {
            try {
              fetchFunctions[toolId]();
            } catch (error) {
              console.error("[Analytics] Erreur lors de l'appel de la fonction:", error);
              setErrors(prev => ({ ...prev, [toolId]: "Erreur lors de l'appel de la fonction" }));
            }
          } else {
            console.error("[Analytics] Fonction non trouvée pour:", toolId);
            setErrors(prev => ({ ...prev, [toolId]: "Fonction non disponible" }));
          }
        }} disabled={loadingTools[toolId]}>
          {loadingTools[toolId] ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {buttonLabel}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const RefreshButton = ({ toolId }: { toolId: AITool }) => (
    <div className="flex justify-end mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (fetchFunctions[toolId]) {
            fetchFunctions[toolId]();
          }
        }}
        disabled={loadingTools[toolId]}
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", loadingTools[toolId] && "animate-spin")} />
        Régénérer
      </Button>
    </div>
  );

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

  const aiTools: Array<{ id: AITool; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
    { id: "insights", label: "Insights généraux", icon: Eye },
    { id: "sales-prediction", label: "Meilleurs vendeurs", icon: TrendingUp },
    { id: "reorder", label: "Réapprovisionnement", icon: ShoppingCart },
    { id: "profitability", label: "Rentabilité", icon: DollarSign },
    { id: "price-optimization", label: "Optimisation des prix", icon: Wine },
    { id: "food-wine-pairing", label: "Accord mets-vin", icon: UtensilsCrossed },
    { id: "promotion-recommendations", label: "Promotions", icon: Gift },
    { id: "stockout-prediction", label: "Rupture de stock", icon: AlertTriangle },
    { id: "menu-optimization", label: "Optimisation du menu", icon: Menu },
    { id: "temporal-trends", label: "Tendances temporelles", icon: Clock },
    { id: "dynamic-pricing", label: "Prix dynamique", icon: DollarSign },
    { id: "revenue-forecast", label: "Prévisions de revenus", icon: BarChart3 },
  ];

  return (
    <Layout>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div
          className={cn(
            "bg-card rounded-lg flex flex-col flex-shrink-0",
            "h-fit", // S'adapte à la hauteur du contenu
            "w-64"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b-2 border-foreground/20">
            <div className="flex items-center gap-2 mt-2">
              <Brain className="h-7 w-7 text-primary" />
              <h2 className="text-2xl sm:text-2xl font-bold text-foreground">Outils IA</h2>
              </div>
        </div>

          {/* Tools List */}
          <div className="p-2 border-b-2 border-foreground/20">
            <div className="space-y-1">
              {aiTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                    selectedTool === tool.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-16">
          {/* Header */}
          <div className="flex items-center justify-between">
        </div>

        {selectedTool === "insights" ? (
          <>
            {/* Insights Cards */}
            {!insights ? (
              <Card className="border-2 border-foreground/20">
                <CardContent className="py-12 text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Cliquez sur le bouton pour générer des insights IA.
                  </p>
                  <Button onClick={() => {
                    console.log("[Analytics] Bouton insights cliqué directement");
                    fetchInsights();
                  }} disabled={loadingTools["insights"]}>
                    {loadingTools["insights"] ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Générer des insights
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : insights.insights.length > 0 ? (
              <>
                <RefreshButton toolId="insights" />
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
            {!salesPrediction ? (
              <EmptyStateWithButton
                icon={TrendingUp}
                message="Cliquez sur le bouton pour analyser les meilleurs vendeurs."
                toolId="sales-prediction"
                buttonLabel="Analyser les ventes"
              />
            ) : (
                    <>
                      <RefreshButton toolId="sales-prediction" />
                      <div className="space-y-4">
              <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Meilleurs vendeurs (30 derniers jours)
                            {salesPrediction.region && (
                              <span className="text-sm font-normal text-muted-foreground">
                                • {salesPrediction.region}
                              </span>
                            )}
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

                      {/* Meilleurs vendeurs prédits */}
                      {salesPrediction.topSellers && salesPrediction.topSellers.length > 0 && (
              <Card className="border-2 border-foreground/20">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-primary" />
                              Meilleurs vendeurs prédits dans la région
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {salesPrediction.topSellers.map((seller, index) => (
                                <div
                                  key={index}
                                  className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold text-foreground mb-1">
                                      {seller.product}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {seller.reason}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                </CardContent>
              </Card>
                      )}
                    </div>
            )}
          </>
        ) : selectedTool === "reorder" ? (
          <>
            {/* Reorder Recommendations */}
            {reorderRecommendations.length === 0 ? (
              <EmptyStateWithButton
                icon={ShoppingCart}
                message="Cliquez sur le bouton pour générer des recommandations de réapprovisionnement."
                toolId="reorder"
                buttonLabel="Générer des recommandations"
              />
            ) : (
              <>
                <RefreshButton toolId="reorder" />
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
              </>
            )}
          </>
        ) : selectedTool === "profitability" ? (
          <>
            {/* Profitability Analysis */}
            {!profitability || profitability.topProducts.length === 0 ? (
              <EmptyStateWithButton
                icon={DollarSign}
                message="Cliquez sur le bouton pour analyser la rentabilité des produits."
                toolId="profitability"
                buttonLabel="Analyser la rentabilité"
              />
            ) : (
              <>
                <RefreshButton toolId="profitability" />
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
              </>
            )}
          </>
        ) : selectedTool === "price-optimization" ? (
          <>
            {/* Price Optimization */}
            {!priceOptimization || !priceOptimization.recommendations || priceOptimization.recommendations.length === 0 ? (
              <EmptyStateWithButton
                icon={Wine}
                message="Cliquez sur le bouton pour générer des recommandations d'optimisation des prix."
                toolId="price-optimization"
                buttonLabel="Optimiser les prix"
              />
            ) : (
              <>
                <RefreshButton toolId="price-optimization" />
                <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    Optimisation des prix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {priceOptimization.recommendations.slice(0, 5).map((rec: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">{rec.productName}</div>
                          <div className="text-sm text-muted-foreground">{rec.reason}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Prix actuel</div>
                              <div className="text-sm font-medium line-through">${rec.currentPrice?.toFixed(2) || "0.00"}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Prix suggéré</div>
                              <div className="text-lg font-bold text-primary">${rec.suggestedPrice?.toFixed(2) || "0.00"}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-primary">
                            {rec.priceChange > 0 ? "+" : ""}{rec.priceChange?.toFixed(2) || "0.00"}%
                          </div>
                          <div className="text-xs text-muted-foreground">Changement</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </>
            )}
          </>
        ) : selectedTool === "food-wine-pairing" ? (
          <>
            {/* Food-Wine Pairing */}
            {!foodWinePairing || !foodWinePairing.pairings || foodWinePairing.pairings.length === 0 ? (
              <EmptyStateWithButton
                icon={UtensilsCrossed}
                message="Cliquez sur le bouton pour générer des accords mets-vin."
                toolId="food-wine-pairing"
                buttonLabel="Générer des accords"
              />
            ) : (
              <>
                <RefreshButton toolId="food-wine-pairing" />
                <Card className="border-2 border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    Accord mets-vin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {foodWinePairing.pairings.slice(0, 5).map((pairing: any, index: number) => (
                            <div
                              key={index}
                        className="p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                            >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-foreground">{pairing.food || pairing.dish}</div>
                          <div className="text-sm text-primary font-medium">{pairing.wine || pairing.recommendedWine}</div>
                                  </div>
                        {pairing.reason && (
                          <div className="text-sm text-muted-foreground">{pairing.reason}</div>
                    )}
                        {pairing.description && (
                          <div className="text-xs text-muted-foreground mt-1">{pairing.description}</div>
                        )}
                            </div>
                          ))}
                  </div>
                </CardContent>
              </Card>
              </>
            )}
          </>
        ) : selectedTool === "promotion-recommendations" ? (
          <>
            {/* Promotion Recommendations */}
            {!promotionRecommendations || !promotionRecommendations.recommendations || promotionRecommendations.recommendations.length === 0 ? (
              <EmptyStateWithButton
                icon={Gift}
                message="Cliquez sur le bouton pour générer des recommandations de promotions."
                toolId="promotion-recommendations"
                buttonLabel="Générer des promotions"
              />
            ) : (
              <>
                <RefreshButton toolId="promotion-recommendations" />
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
              </>
            )}
          </>
        ) : selectedTool === "stockout-prediction" ? (
          <>
            {/* Stockout Predictions */}
            {!stockoutPredictions || !stockoutPredictions.predictions || stockoutPredictions.predictions.length === 0 ? (
              <EmptyStateWithButton
                icon={AlertTriangle}
                message="Cliquez sur le bouton pour générer des prédictions de rupture de stock."
                toolId="stockout-prediction"
                buttonLabel="Prédire les ruptures"
              />
            ) : (
              <>
                <RefreshButton toolId="stockout-prediction" />
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
              </>
            )}
          </>
        ) : selectedTool === "menu-optimization" ? (
          <>
            {/* Menu Optimization */}
            {!menuOptimization ? (
              <EmptyStateWithButton
                icon={Menu}
                message="Cliquez sur le bouton pour optimiser votre menu."
                toolId="menu-optimization"
                buttonLabel="Optimiser le menu"
              />
            ) : (
              <>
                <RefreshButton toolId="menu-optimization" />
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
              </>
            )}
          </>
        ) : selectedTool === "temporal-trends" ? (
          <>
            {/* Temporal Trends */}
            {!temporalTrends ? (
              <EmptyStateWithButton
                icon={Clock}
                message="Cliquez sur le bouton pour analyser les tendances temporelles."
                toolId="temporal-trends"
                buttonLabel="Analyser les tendances"
              />
            ) : (
              <>
                <RefreshButton toolId="temporal-trends" />
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
              </>
            )}
          </>
        ) : selectedTool === "dynamic-pricing" ? (
          <>
            {/* Dynamic Pricing */}
            {!dynamicPricing || !dynamicPricing.recommendations || dynamicPricing.recommendations.length === 0 ? (
              <EmptyStateWithButton
                icon={Target}
                message="Cliquez sur le bouton pour générer des recommandations de prix dynamiques."
                toolId="dynamic-pricing"
                buttonLabel="Générer des prix dynamiques"
              />
            ) : (
              <>
                <RefreshButton toolId="dynamic-pricing" />
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
              </>
            )}
          </>
        ) : selectedTool === "revenue-forecast" ? (
          <>
            {/* Revenue Forecast */}
            {!revenueForecast ? (
              <EmptyStateWithButton
                icon={BarChart3}
                message="Cliquez sur le bouton pour générer des prévisions de revenus."
                toolId="revenue-forecast"
                buttonLabel="Générer des prévisions"
              />
            ) : (
              <>
                <RefreshButton toolId="revenue-forecast" />
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
