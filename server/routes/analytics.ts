import { RequestHandler } from "express";
import db from "../database";
import { getUserId } from "../middleware/auth";
import { callOpenAI, callOpenAIJSON } from "../services/openai";

/**
 * GET /api/analytics/sales-prediction - Prédiction des ventes pour les prochains jours avec IA
 */
export const getSalesPrediction: RequestHandler = async (req, res) => {
  try {
    console.log("[Sales Prediction] Requête reçue, headers:", {
      authorization: !!req.headers.authorization,
      "x-username": req.headers["x-username"],
      "x-user-id": req.headers["x-user-id"],
    });
    const userId = getUserId(req);
    console.log("[Sales Prediction] UserId extrait:", userId);
    if (!userId) {
      console.warn("[Sales Prediction] Aucun userId trouvé, retour 401");
      return res.status(401).json({ error: "Authentication required" });
    }

    const { days = 7, region: regionParam } = req.query;
    const daysCount = parseInt(days as string) || 7;

    // Récupérer la région depuis les paramètres de la requête ou utiliser une valeur par défaut
    // La région peut être passée depuis le frontend qui lit les paramètres depuis localStorage
    const region = (regionParam as string) || "quebec";

    // Récupérer les ventes des 30 derniers jours pour l'analyse
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Récupérer les produits pour analyser les meilleurs vendeurs
    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Calculer la moyenne quotidienne
    const dailySales: Record<string, number> = {};
    sales.forEach((sale) => {
      const date = sale.createdAt.split("T")[0];
      dailySales[date] = (dailySales[date] || 0) + sale.price * sale.quantity;
    });

    const dailyValues = Object.values(dailySales);
    const avgDailyRevenue = dailyValues.length > 0
      ? dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length
      : 0;

    // Analyser les meilleurs produits vendus
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    sales.forEach((sale) => {
      const productId = sale.productId || sale.recipeId;
      if (productId) {
        if (!productSales[productId]) {
          productSales[productId] = { quantity: 0, revenue: 0 };
        }
        productSales[productId].quantity += sale.quantity;
        productSales[productId].revenue += sale.price * sale.quantity;
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => {
        const product = products.find(p => p.id === id);
        return {
          name: product?.name || "Produit inconnu",
          category: product?.category || "other",
          quantity: data.quantity,
          revenue: data.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Utiliser OpenAI pour générer des prédictions intelligentes avec contexte régional
    const aiPrompt = `En tant qu'expert en analyse de ventes pour bar/restaurant, génère des prédictions de ventes pour les ${daysCount} prochains jours.

Contexte:
- Région: ${region}
- Revenu quotidien moyen actuel: $${avgDailyRevenue.toFixed(2)}
- Nombre de jours de données: ${dailyValues.length}
- Meilleurs produits vendus: ${topProducts.map(p => `${p.name} (${p.category})`).join(", ")}

Génère des prédictions réalistes en tenant compte:
1. Les tendances régionales (ex: vendredis/samedis plus chargés au Québec)
2. Les meilleurs produits identifiés
3. Les saisons et événements locaux
4. Les habitudes de consommation régionales

Réponds en JSON:
{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predictedRevenue": 123.45,
      "confidence": 0.85,
      "reason": "explication courte"
    }
  ],
  "topSellers": [
    {
      "product": "nom du produit",
      "reason": "pourquoi il sera populaire"
    }
  ],
  "trend": 5.2
}`;

    console.log("[Sales Prediction] Appel OpenAI avec prompt:", aiPrompt.substring(0, 200) + "...");
    const aiResponse = await callOpenAIJSON<{
      predictions: Array<{
        date: string;
        predictedRevenue: number;
        confidence: number;
        reason?: string;
      }>;
      topSellers?: Array<{
        product: string;
        reason: string;
      }>;
      trend: number;
    }>(aiPrompt, "Tu es un expert en analyse de ventes et prédictions pour l'industrie de la restauration et des bars, avec une connaissance approfondie des tendances régionales au Canada.");

    console.log("[Sales Prediction] Réponse OpenAI:", aiResponse ? "Reçue" : "Aucune réponse");

    // Utiliser les prédictions IA si disponibles, sinon fallback sur calculs basiques
    if (aiResponse && aiResponse.predictions && aiResponse.predictions.length > 0) {
      console.log("[Sales Prediction] Utilisation des prédictions IA:", aiResponse.predictions.length, "prédictions");
      return res.json({
        predictions: aiResponse.predictions.slice(0, daysCount),
        averageDailyRevenue: Math.round(avgDailyRevenue * 100) / 100,
        trend: aiResponse.trend || Math.round(((dailyValues[0] || 0) - (dailyValues[dailyValues.length - 1] || 0)) / dailyValues.length * 100) / 100,
        dataPoints: dailyValues.length,
        topSellers: aiResponse.topSellers || [],
        region: region,
      });
    }

    // Fallback sur les calculs basiques
    const trend = dailyValues.length > 1
      ? (dailyValues[0] - dailyValues[dailyValues.length - 1]) / dailyValues.length
      : 0;

    const predictions = [];
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const predictedRevenue = Math.max(0, avgDailyRevenue + (trend * i));
      predictions.push({
        date: date.toISOString().split("T")[0],
        predictedRevenue: Math.round(predictedRevenue * 100) / 100,
        confidence: dailyValues.length > 7 ? 0.85 : 0.65,
      });
    }

    res.json({
      predictions,
      averageDailyRevenue: Math.round(avgDailyRevenue * 100) / 100,
      trend: Math.round(trend * 100) / 100,
      dataPoints: dailyValues.length,
      topSellers: topProducts.slice(0, 3).map(p => ({
        product: p.name,
        reason: `Produit populaire dans la catégorie ${p.category}`,
      })),
      region: region,
    });
  } catch (error: any) {
    console.error("[Sales Prediction] Erreur complète:", error);
    console.error("[Sales Prediction] Stack trace:", error.stack);
    res.status(500).json({
      error: "Failed to get sales prediction",
      message: error.message || "Erreur inconnue",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * GET /api/analytics/reorder-recommendations - Recommandations intelligentes de réapprovisionnement
 */
export const getReorderRecommendations: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer tous les produits
    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Calculer la vitesse de vente par produit
    const productSales: Record<string, { quantity: number; days: number }> = {};
    const productFirstSale: Record<string, string> = {};
    const productLastSale: Record<string, string> = {};

    sales.forEach((sale) => {
      const productId = sale.productId || sale.recipeId;
      if (!productId) return;

      const date = sale.createdAt.split("T")[0];
      if (!productFirstSale[productId]) {
        productFirstSale[productId] = date;
      }
      productLastSale[productId] = date;

      if (!productSales[productId]) {
        productSales[productId] = { quantity: 0, days: 0 };
      }
      productSales[productId].quantity += sale.quantity;
    });

    // Calculer les jours actifs pour chaque produit
    Object.keys(productSales).forEach((productId) => {
      const first = new Date(productFirstSale[productId]);
      const last = new Date(productLastSale[productId]);
      const daysActive = Math.max(1, Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));
      productSales[productId].days = daysActive;
    });

    const recommendations = products
      .map((product) => {
        const salesData = productSales[product.id];
        if (!salesData || salesData.days === 0) {
          return null;
        }

        const dailyConsumption = salesData.quantity / salesData.days;
        const daysUntilEmpty = product.quantity / dailyConsumption;
        const recommendedOrder = Math.ceil(dailyConsumption * 14); // 2 semaines de stock

        // Priorité basée sur plusieurs facteurs
        let priority = 0;
        if (daysUntilEmpty < 3) priority = 3; // Critique
        else if (daysUntilEmpty < 7) priority = 2; // Urgent
        else if (daysUntilEmpty < 14) priority = 1; // Important

        // Augmenter la priorité si c'est un produit à forte vente
        if (dailyConsumption > 5) priority = Math.max(priority, 2);

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          dailyConsumption: Math.round(dailyConsumption * 100) / 100,
          daysUntilEmpty: Math.round(daysUntilEmpty * 100) / 100,
          recommendedOrder,
          priority,
          category: product.category,
          unit: product.unit,
        };
      })
      .filter((r) => r !== null && r.priority > 0)
      .sort((a, b) => (b?.priority || 0) - (a?.priority || 0));

    res.json({
      recommendations,
      totalProducts: products.length,
      productsNeedingReorder: recommendations.length,
    });
  } catch (error: any) {
    console.error("Error getting reorder recommendations:", error);
    res.status(500).json({
      error: "Failed to get reorder recommendations",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/profitability - Analyse de rentabilité par produit/catégorie
 */
export const getProfitabilityAnalysis: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer les produits avec leurs coûts (on suppose que le prix de vente est dans products)
    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Calculer la rentabilité par produit
    const productStats: Record<string, {
      name: string;
      category: string;
      revenue: number;
      quantitySold: number;
      avgPrice: number;
      margin: number; // Marge estimée (on suppose 60% de marge par défaut)
    }> = {};

    sales.forEach((sale) => {
      const productId = sale.productId;
      if (!productId) return;

      const product = products.find((p) => p.id === productId);
      if (!product) return;

      if (!productStats[productId]) {
        productStats[productId] = {
          name: product.name,
          category: product.category,
          revenue: 0,
          quantitySold: 0,
          avgPrice: 0,
          margin: 0.6, // 60% de marge par défaut
        };
      }

      productStats[productId].revenue += sale.price * sale.quantity;
      productStats[productId].quantitySold += sale.quantity;
    });

    // Calculer la marge moyenne et le prix moyen
    Object.keys(productStats).forEach((productId) => {
      const stats = productStats[productId];
      stats.avgPrice = stats.revenue / stats.quantitySold;
      // Marge estimée : on suppose que le coût est 40% du prix de vente
      stats.margin = 0.6; // Peut être ajusté avec les données réelles de coût
    });

    // Calculer par catégorie
    const categoryStats: Record<string, {
      revenue: number;
      quantitySold: number;
      avgMargin: number;
      products: number;
    }> = {};

    Object.values(productStats).forEach((stats) => {
      if (!categoryStats[stats.category]) {
        categoryStats[stats.category] = {
          revenue: 0,
          quantitySold: 0,
          avgMargin: 0,
          products: 0,
        };
      }
      categoryStats[stats.category].revenue += stats.revenue;
      categoryStats[stats.category].quantitySold += stats.quantitySold;
      categoryStats[stats.category].products += 1;
    });

    // Calculer la marge moyenne par catégorie
    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category];
      stats.avgMargin = 0.6; // Marge moyenne estimée
    });

    // Top produits les plus rentables
    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({
        productId: id,
        ...stats,
        profit: stats.revenue * stats.margin,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    res.json({
      productStats: Object.entries(productStats).map(([id, stats]) => ({
        productId: id,
        ...stats,
        profit: stats.revenue * stats.margin,
      })),
      categoryStats,
      topProducts,
      totalRevenue: Object.values(productStats).reduce((sum, s) => sum + s.revenue, 0),
      totalProfit: Object.values(productStats).reduce((sum, s) => sum + (s.revenue * s.margin), 0),
    });
  } catch (error: any) {
    console.error("Error getting profitability analysis:", error);
    res.status(500).json({
      error: "Failed to get profitability analysis",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/price-optimization - Suggestions de prix optimaux
 */
export const getPriceOptimization: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Analyser la sensibilité au prix (élasticité de la demande)
    const productAnalysis: Record<string, {
      currentPrice: number;
      quantitySold: number;
      revenue: number;
      suggestedPrice: number;
      expectedRevenue: number;
      priceChange: number;
      reason: string;
    }> = {};

    products.forEach((product) => {
      const productSales = sales.filter((s) => s.productId === product.id);
      if (productSales.length === 0) return;

      const quantitySold = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const revenue = productSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
      const avgPrice = revenue / quantitySold;

      // Algorithme simple d'optimisation de prix
      // Si le produit se vend bien, on peut augmenter légèrement le prix
      // Si le produit ne se vend pas bien, on peut baisser le prix
      let suggestedPrice = product.price;
      let reason = "Prix optimal";
      let expectedRevenue = revenue;

      if (quantitySold > 20 && avgPrice === product.price) {
        // Produit populaire, on peut augmenter de 5-10%
        suggestedPrice = product.price * 1.08;
        reason = "Produit très demandé, augmentation recommandée";
        // Estimation : baisse de 5% de la quantité mais hausse de 8% du prix = +2.6% de revenu
        expectedRevenue = revenue * 1.026;
      } else if (quantitySold < 5 && product.price > 10) {
        // Produit peu vendu et cher, on peut baisser
        suggestedPrice = product.price * 0.92;
        reason = "Prix élevé pour faible demande, réduction recommandée";
        // Estimation : hausse de 15% de la quantité avec baisse de 8% du prix = +5.8% de revenu
        expectedRevenue = revenue * 1.058;
      }

      productAnalysis[product.id] = {
        currentPrice: product.price,
        quantitySold,
        revenue,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        expectedRevenue: Math.round(expectedRevenue * 100) / 100,
        priceChange: Math.round((suggestedPrice - product.price) * 100) / 100,
        reason,
      };
    });

    const recommendations = Object.entries(productAnalysis)
      .filter(([_, analysis]) => Math.abs(analysis.priceChange) > 0.1) // Seulement si le changement est significatif
      .map(([id, analysis]) => ({
        productId: id,
        productName: products.find((p) => p.id === id)?.name || "",
        ...analysis,
      }))
      .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));

    const totalPotentialRevenue = recommendations.reduce(
      (sum, r) => sum + (r.expectedRevenue - r.revenue),
      0
    );

    res.json({
      recommendations,
      totalPotentialRevenue: Math.round(totalPotentialRevenue * 100) / 100,
      productsAnalyzed: Object.keys(productAnalysis).length,
    });
  } catch (error: any) {
    console.error("Error getting price optimization:", error);
    res.status(500).json({
      error: "Failed to get price optimization",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/insights - Insights généraux et recommandations
 */
export const getInsights: RequestHandler = async (req, res) => {
  try {
    console.log("[Insights] Requête reçue, headers:", {
      authorization: !!req.headers.authorization,
      "x-username": req.headers["x-username"],
      "x-user-id": req.headers["x-user-id"],
    });
    const userId = getUserId(req);
    console.log("[Insights] UserId extrait:", userId);
    if (!userId) {
      console.warn("[Insights] Aucun userId trouvé, retour 401");
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer les données récentes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Calculer les insights
    const totalRevenue = sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const totalSales = sales.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Produits les plus vendus
    const productSales: Record<string, number> = {};
    sales.forEach((sale) => {
      const productId = sale.productId || sale.recipeId;
      if (productId) {
        productSales[productId] = (productSales[productId] || 0) + sale.quantity;
      }
    });

    const topProductId = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    const topProduct = products.find((p) => p.id === topProductId);

    // Produits en rupture de stock
    const outOfStock = products.filter((p) => p.quantity === 0);
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 5);

    // Générer des recommandations intelligentes avec OpenAI si disponible
    const dataSummary = {
      totalRevenue,
      totalSales,
      avgSaleValue,
      topProduct: topProduct?.name || "Aucun",
      topProductSales: topProductId ? productSales[topProductId] : 0,
      outOfStockCount: outOfStock.length,
      lowStockCount: lowStock.length,
      productCount: products.length,
    };

    // Essayer d'obtenir des insights IA
    const aiPrompt = `En tant qu'expert en analyse de données pour bar/restaurant, génère 4 insights pertinents basés sur ces données:

Revenus totaux (30 jours): $${dataSummary.totalRevenue.toFixed(2)}
Nombre de ventes: ${dataSummary.totalSales}
Valeur moyenne par transaction: $${dataSummary.avgSaleValue.toFixed(2)}
Produit le plus vendu: ${dataSummary.topProduct} (${dataSummary.topProductSales} unités)
Produits en rupture: ${dataSummary.outOfStockCount}
Produits à stock faible: ${dataSummary.lowStockCount}
Total produits: ${dataSummary.productCount}

Génère des insights actionnables et pertinents. Réponds en JSON:
{
  "insights": [
    {
      "type": "revenue|product|alert|warning",
      "title": "Titre court",
      "value": "Valeur ou chiffre",
      "trend": "positive|negative|warning|neutral",
      "description": "Description détaillée et actionnable"
    }
  ]
}`;

    console.log("[Insights] Appel OpenAI avec prompt:", aiPrompt.substring(0, 200) + "...");
    const aiInsights = await callOpenAIJSON<{ insights: Array<{
      type: string;
      title: string;
      value: string;
      trend: string;
      description: string;
    }> }>(aiPrompt, "Tu es un expert en analyse de données pour l'industrie de la restauration et des bars.");

    console.log("[Insights] Réponse OpenAI:", aiInsights ? `${aiInsights.insights?.length || 0} insights` : "Aucune réponse");

    // Utiliser les insights IA si disponibles, sinon fallback sur les insights basiques
    let insights = [];
    if (aiInsights && aiInsights.insights && aiInsights.insights.length > 0) {
      console.log("[Insights] Utilisation des insights IA");
      insights = aiInsights.insights;
    } else {
      // Fallback sur les insights basiques
    if (totalRevenue > 0) {
      insights.push({
        type: "revenue",
        title: "Revenus des 30 derniers jours",
        value: `$${Math.round(totalRevenue * 100) / 100}`,
        trend: "positive",
        description: `Moyenne de $${Math.round(avgSaleValue * 100) / 100} par transaction`,
      });
    }

    if (topProduct) {
      insights.push({
        type: "product",
        title: "Produit le plus vendu",
        value: topProduct.name,
        trend: "positive",
        description: `${productSales[topProductId]} unités vendues`,
      });
    }

    if (outOfStock.length > 0) {
      insights.push({
        type: "alert",
        title: "Produits en rupture",
        value: `${outOfStock.length} produit(s)`,
        trend: "negative",
        description: "Réapprovisionnement urgent nécessaire",
      });
    }

    if (lowStock.length > 0) {
      insights.push({
        type: "warning",
        title: "Stock faible",
        value: `${lowStock.length} produit(s)`,
        trend: "warning",
        description: "Surveillez ces produits de près",
      });
      }
    }

    res.json({
      insights,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSales,
        avgSaleValue: Math.round(avgSaleValue * 100) / 100,
        outOfStockCount: outOfStock.length,
        lowStockCount: lowStock.length,
      },
    });
  } catch (error: any) {
    console.error("[Insights] Erreur complète:", error);
    console.error("[Insights] Stack trace:", error.stack);
    res.status(500).json({
      error: "Failed to get insights",
      message: error.message || "Erreur inconnue",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * GET /api/analytics/recipe-recommendations - Recommandations de cocktails/recettes basées sur les ventes
 */
export const getRecipeRecommendations: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer les recettes et les ventes
    const recipes = db.prepare("SELECT * FROM recipes").all() as any[];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? AND recipeId IS NOT NULL ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Analyser les ventes par recette
    const recipeSales: Record<string, { quantity: number; revenue: number; days: number }> = {};
    const recipeFirstSale: Record<string, string> = {};
    const recipeLastSale: Record<string, string> = {};

    sales.forEach((sale) => {
      const recipeId = sale.recipeId;
      if (!recipeId) return;

      const date = sale.createdAt.split("T")[0];
      if (!recipeFirstSale[recipeId]) {
        recipeFirstSale[recipeId] = date;
      }
      recipeLastSale[recipeId] = date;

      if (!recipeSales[recipeId]) {
        recipeSales[recipeId] = { quantity: 0, revenue: 0, days: 0 };
      }
      recipeSales[recipeId].quantity += sale.quantity;
      recipeSales[recipeId].revenue += sale.price * sale.quantity;
    });

    // Calculer les jours actifs
    Object.keys(recipeSales).forEach((recipeId) => {
      const first = new Date(recipeFirstSale[recipeId]);
      const last = new Date(recipeLastSale[recipeId]);
      const daysActive = Math.max(1, Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));
      recipeSales[recipeId].days = daysActive;
    });

    // Recommandations basées sur la popularité et la rentabilité
    const recommendations = recipes
      .map((recipe) => {
        const salesData = recipeSales[recipe.id];
        if (!salesData || salesData.days === 0) {
          // Recette jamais vendue - suggérer de la promouvoir
          return {
            recipeId: recipe.id,
            recipeName: recipe.name,
            recommendation: "Nouvelle recette - Promouvoir",
            reason: "Cette recette n'a pas encore été vendue. Considérez la promouvoir.",
            priority: 1,
            potentialRevenue: recipe.price * 5, // Estimation basée sur 5 ventes
          };
        }

        const dailySales = salesData.quantity / salesData.days;
        const avgRevenue = salesData.revenue / salesData.quantity;
        const margin = 0.6; // Marge estimée
        const profit = salesData.revenue * margin;

        let recommendation = "Performance normale";
        let reason = "";
        let priority = 0;

        if (dailySales > 3 && profit > 50) {
          recommendation = "Top performer - Mettre en avant";
          reason = `Excellent vendeur avec ${dailySales.toFixed(1)} ventes/jour et ${profit.toFixed(2)}$ de profit`;
          priority = 3;
        } else if (dailySales < 0.5 && profit < 20) {
          recommendation = "Performance faible - Réviser ou retirer";
          reason = `Faible demande (${dailySales.toFixed(2)} ventes/jour). Considérez la retirer du menu.`;
          priority = 2;
        } else if (dailySales > 2) {
          recommendation = "Populaire - Maintenir";
          reason = `Bonne popularité avec ${dailySales.toFixed(1)} ventes/jour`;
          priority = 1;
        }

        return {
          recipeId: recipe.id,
          recipeName: recipe.name,
          recommendation,
          reason,
          priority,
          dailySales: Math.round(dailySales * 100) / 100,
          totalRevenue: Math.round(salesData.revenue * 100) / 100,
          profit: Math.round(profit * 100) / 100,
        };
      })
      .sort((a, b) => b.priority - a.priority);

    res.json({
      recommendations,
      totalRecipes: recipes.length,
    });
  } catch (error: any) {
    console.error("Error getting recipe recommendations:", error);
    res.status(500).json({
      error: "Failed to get recipe recommendations",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/anomaly-detection - Détection d'anomalies dans les ventes
 */
export const getAnomalyDetection: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer les ventes des 90 derniers jours
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateStr = ninetyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Calculer les statistiques de base
    const dailySales: Record<string, { revenue: number; count: number }> = {};
    sales.forEach((sale) => {
      const date = sale.createdAt.split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, count: 0 };
      }
      dailySales[date].revenue += sale.price * sale.quantity;
      dailySales[date].count += 1;
    });

    const dailyRevenues = Object.values(dailySales).map(d => d.revenue);
    const avgRevenue = dailyRevenues.reduce((a, b) => a + b, 0) / dailyRevenues.length;
    const variance = dailyRevenues.reduce((sum, val) => sum + Math.pow(val - avgRevenue, 2), 0) / dailyRevenues.length;
    const stdDev = Math.sqrt(variance);

    // Détecter les anomalies (valeurs > 2 écarts-types)
    const anomalies: Array<{
      date: string;
      revenue: number;
      deviation: number;
      type: string;
      severity: string;
    }> = [];

    Object.entries(dailySales).forEach(([date, data]) => {
      const deviation = (data.revenue - avgRevenue) / stdDev;
      if (Math.abs(deviation) > 2) {
        anomalies.push({
          date,
          revenue: Math.round(data.revenue * 100) / 100,
          deviation: Math.round(deviation * 100) / 100,
          type: deviation > 0 ? "Pic de ventes" : "Chute de ventes",
          severity: Math.abs(deviation) > 3 ? "Élevée" : "Modérée",
        });
      }
    });

    // Détecter les transactions suspectes (montants très élevés)
    const suspiciousTransactions = sales
      .filter((sale) => sale.price * sale.quantity > avgRevenue * 3)
      .map((sale) => ({
        id: sale.id,
        date: sale.createdAt,
        amount: Math.round(sale.price * sale.quantity * 100) / 100,
        paymentMethod: sale.paymentMethod,
        productId: sale.productId,
        recipeId: sale.recipeId,
      }))
      .slice(0, 10); // Top 10

    res.json({
      anomalies: anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation)),
      suspiciousTransactions,
      statistics: {
        averageDailyRevenue: Math.round(avgRevenue * 100) / 100,
        standardDeviation: Math.round(stdDev * 100) / 100,
        totalDays: Object.keys(dailySales).length,
      },
    });
  } catch (error: any) {
    console.error("Error detecting anomalies:", error);
    res.status(500).json({
      error: "Failed to detect anomalies",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/promotion-recommendations - Recommandations de promotions
 */
export const getPromotionRecommendations: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const products = db.prepare("SELECT * FROM products").all() as any[];
    const recipes = db.prepare("SELECT * FROM recipes").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Analyser les ventes par produit/recette
    const itemSales: Record<string, { quantity: number; revenue: number; days: number }> = {};
    const itemFirstSale: Record<string, string> = {};
    const itemLastSale: Record<string, string> = {};

    sales.forEach((sale) => {
      const itemId = sale.productId || sale.recipeId;
      if (!itemId) return;

      const date = sale.createdAt.split("T")[0];
      if (!itemFirstSale[itemId]) {
        itemFirstSale[itemId] = date;
      }
      itemLastSale[itemId] = date;

      if (!itemSales[itemId]) {
        itemSales[itemId] = { quantity: 0, revenue: 0, days: 0 };
      }
      itemSales[itemId].quantity += sale.quantity;
      itemSales[itemId].revenue += sale.price * sale.quantity;
    });

    // Calculer les jours actifs
    Object.keys(itemSales).forEach((itemId) => {
      const first = new Date(itemFirstSale[itemId]);
      const last = new Date(itemLastSale[itemId]);
      const daysActive = Math.max(1, Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));
      itemSales[itemId].days = daysActive;
    });

    // Recommandations de promotions
    const recommendations: Array<{
      itemId: string;
      itemName: string;
      type: string;
      currentPrice: number;
      suggestedDiscount: number;
      reason: string;
      expectedImpact: string;
      bestTime: string;
    }> = [];

    // Produits à faible vente - promouvoir
    products.forEach((product) => {
      const salesData = itemSales[product.id];
      if (!salesData || salesData.days === 0) {
        recommendations.push({
          itemId: product.id,
          itemName: product.name,
          type: "product",
          currentPrice: product.price,
          suggestedDiscount: 15,
          reason: "Produit jamais vendu - Promotion recommandée pour le lancer",
          expectedImpact: "Augmentation estimée de 50-100% des ventes",
          bestTime: "Week-end ou heure de pointe",
        });
      } else {
        const dailySales = salesData.quantity / salesData.days;
        if (dailySales < 0.5 && product.quantity > 10) {
          recommendations.push({
            itemId: product.id,
            itemName: product.name,
            type: "product",
            currentPrice: product.price,
            suggestedDiscount: 20,
            reason: `Faible vente (${dailySales.toFixed(2)}/jour) avec stock élevé`,
            expectedImpact: "Réduction du stock et augmentation des ventes",
            bestTime: "Happy hour ou promotion du jour",
          });
        }
      }
    });

    // Produits populaires - promotions limitées pour booster
    products.forEach((product) => {
      const salesData = itemSales[product.id];
      if (salesData && salesData.days > 0) {
        const dailySales = salesData.quantity / salesData.days;
        if (dailySales > 3) {
          recommendations.push({
            itemId: product.id,
            itemName: product.name,
            type: "product",
            currentPrice: product.price,
            suggestedDiscount: 10,
            reason: "Produit populaire - Promotion limitée pour augmenter le trafic",
            expectedImpact: "Augmentation de 20-30% des ventes et attraction de nouveaux clients",
            bestTime: "Heure creuse pour équilibrer la demande",
          });
        }
      }
    });

    res.json({
      recommendations: recommendations.slice(0, 10), // Top 10
      totalRecommendations: recommendations.length,
    });
  } catch (error: any) {
    console.error("Error getting promotion recommendations:", error);
    res.status(500).json({
      error: "Failed to get promotion recommendations",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/stockout-prediction - Prédictions de rupture de stock
 */
export const getStockoutPrediction: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? AND productId IS NOT NULL ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Calculer la consommation par produit
    const productConsumption: Record<string, { quantity: number; days: number; trend: number }> = {};
    const productFirstSale: Record<string, string> = {};
    const productLastSale: Record<string, string> = {};

    sales.forEach((sale) => {
      const productId = sale.productId;
      if (!productId) return;

      const date = sale.createdAt.split("T")[0];
      if (!productFirstSale[productId]) {
        productFirstSale[productId] = date;
      }
      productLastSale[productId] = date;

      if (!productConsumption[productId]) {
        productConsumption[productId] = { quantity: 0, days: 0, trend: 0 };
      }
      productConsumption[productId].quantity += sale.quantity;
    });

    // Calculer la tendance (première moitié vs deuxième moitié)
    const midPoint = Math.floor(sales.length / 2);
    const firstHalf = sales.slice(0, midPoint);
    const secondHalf = sales.slice(midPoint);

    const firstHalfConsumption: Record<string, number> = {};
    const secondHalfConsumption: Record<string, number> = {};

    firstHalf.forEach((sale) => {
      if (sale.productId) {
        firstHalfConsumption[sale.productId] = (firstHalfConsumption[sale.productId] || 0) + sale.quantity;
      }
    });

    secondHalf.forEach((sale) => {
      if (sale.productId) {
        secondHalfConsumption[sale.productId] = (secondHalfConsumption[sale.productId] || 0) + sale.quantity;
      }
    });

    // Prédictions de rupture
    const predictions = products
      .map((product) => {
        const consumption = productConsumption[product.id];
        if (!consumption || consumption.days === 0) {
          return null;
        }

        const firstHalfQty = firstHalfConsumption[product.id] || 0;
        const secondHalfQty = secondHalfConsumption[product.id] || 0;
        const trend = secondHalfQty > 0 ? (secondHalfQty - firstHalfQty) / firstHalfQty : 0;

        const dailyConsumption = consumption.quantity / consumption.days;
        const adjustedDailyConsumption = dailyConsumption * (1 + trend); // Ajuster selon la tendance
        const daysUntilStockout = product.quantity / adjustedDailyConsumption;

        let riskLevel = "Faible";
        if (daysUntilStockout < 3) riskLevel = "Critique";
        else if (daysUntilStockout < 7) riskLevel = "Élevé";
        else if (daysUntilStockout < 14) riskLevel = "Modéré";

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          dailyConsumption: Math.round(dailyConsumption * 100) / 100,
          adjustedDailyConsumption: Math.round(adjustedDailyConsumption * 100) / 100,
          trend: Math.round(trend * 100) / 100,
          daysUntilStockout: Math.round(daysUntilStockout * 100) / 100,
          riskLevel,
          recommendedOrder: Math.ceil(adjustedDailyConsumption * 14), // 2 semaines
          category: product.category,
        };
      })
      .filter((p) => p !== null && p.daysUntilStockout < 30) // Seulement ceux à risque dans les 30 jours
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

    res.json({
      predictions,
      totalAtRisk: predictions.length,
    });
  } catch (error: any) {
    console.error("Error predicting stockouts:", error);
    res.status(500).json({
      error: "Failed to predict stockouts",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/menu-optimization - Optimisation du menu
 */
export const getMenuOptimization: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const products = db.prepare("SELECT * FROM products").all() as any[];
    const recipes = db.prepare("SELECT * FROM recipes").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Analyser les performances
    const itemPerformance: Record<string, {
      quantity: number;
      revenue: number;
      profit: number;
      days: number;
    }> = {};

    sales.forEach((sale) => {
      const itemId = sale.productId || sale.recipeId;
      if (!itemId) return;

      if (!itemPerformance[itemId]) {
        itemPerformance[itemId] = { quantity: 0, revenue: 0, profit: 0, days: 0 };
      }
      itemPerformance[itemId].quantity += sale.quantity;
      itemPerformance[itemId].revenue += sale.price * sale.quantity;
      itemPerformance[itemId].profit += sale.price * sale.quantity * 0.6; // Marge estimée
    });

    // Produits à retirer (faible performance)
    const itemsToRemove = [...products, ...recipes]
      .map((item) => {
        const perf = itemPerformance[item.id];
        if (!perf || perf.quantity === 0) {
          return {
            itemId: item.id,
            itemName: item.name,
            type: products.find(p => p.id === item.id) ? "product" : "recipe",
            reason: "Jamais vendu",
            recommendation: "Retirer du menu",
          };
        }

        const dailySales = perf.quantity / 30;
        const avgProfit = perf.profit / perf.quantity;

        if (dailySales < 0.2 && avgProfit < 5) {
          return {
            itemId: item.id,
            itemName: item.name,
            type: products.find(p => p.id === item.id) ? "product" : "recipe",
            reason: `Faible performance: ${dailySales.toFixed(2)} ventes/jour, ${avgProfit.toFixed(2)}$ profit/unité`,
            recommendation: "Considérer retirer ou remplacer",
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    // Suggestions de nouveaux produits basées sur les catégories populaires
    const categoryPerformance: Record<string, { revenue: number; quantity: number }> = {};
    sales.forEach((sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        if (!categoryPerformance[product.category]) {
          categoryPerformance[product.category] = { revenue: 0, quantity: 0 };
        }
        categoryPerformance[product.category].revenue += sale.price * sale.quantity;
        categoryPerformance[product.category].quantity += sale.quantity;
      }
    });

    const topCategories = Object.entries(categoryPerformance)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(([category]) => category);

    const suggestions = topCategories.map((category) => ({
      category,
      reason: `Catégorie très populaire - Considérez ajouter plus de produits dans cette catégorie`,
      potentialImpact: "Augmentation estimée de 15-25% des ventes dans cette catégorie",
    }));

    res.json({
      itemsToRemove: itemsToRemove.slice(0, 10),
      suggestions,
      totalItems: products.length + recipes.length,
      underperformingItems: itemsToRemove.length,
    });
  } catch (error: any) {
    console.error("Error optimizing menu:", error);
    res.status(500).json({
      error: "Failed to optimize menu",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/temporal-trends - Analyse de tendances temporelles
 */
export const getTemporalTrends: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer les ventes des 90 derniers jours
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateStr = ninetyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Analyser par jour de la semaine
    const dayOfWeekStats: Record<number, { revenue: number; count: number }> = {};

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const dayOfWeek = date.getDay(); // 0 = Dimanche, 6 = Samedi

      if (!dayOfWeekStats[dayOfWeek]) {
        dayOfWeekStats[dayOfWeek] = { revenue: 0, count: 0 };
      }
      dayOfWeekStats[dayOfWeek].revenue += sale.price * sale.quantity;
      dayOfWeekStats[dayOfWeek].count += 1;
    });

    const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

    const bestDays = Object.entries(dayOfWeekStats)
      .map(([day, stats]) => ({
        day: parseInt(day),
        dayName: dayNames[parseInt(day)],
        revenue: Math.round(stats.revenue * 100) / 100,
        count: stats.count,
        avgRevenue: Math.round((stats.revenue / stats.count) * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      bestDays,
      insights: {
        bestDay: bestDays[0],
        worstDay: bestDays[bestDays.length - 1],
      },
    });
  } catch (error: any) {
    console.error("Error getting temporal trends:", error);
    res.status(500).json({
      error: "Failed to get temporal trends",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/dynamic-pricing - Recommandations de prix dynamiques
 */
export const getDynamicPricing: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const products = db.prepare("SELECT * FROM products").all() as any[];

    // Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? AND productId IS NOT NULL ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Analyser la demande par produit
    const productDemand: Record<string, { quantity: number; days: number; trend: number }> = {};
    const productFirstSale: Record<string, string> = {};
    const productLastSale: Record<string, string> = {};

    sales.forEach((sale) => {
      const productId = sale.productId;
      if (!productId) return;

      const date = sale.createdAt.split("T")[0];
      if (!productFirstSale[productId]) {
        productFirstSale[productId] = date;
      }
      productLastSale[productId] = date;

      if (!productDemand[productId]) {
        productDemand[productId] = { quantity: 0, days: 0, trend: 0 };
      }
      productDemand[productId].quantity += sale.quantity;
    });

    // Calculer la tendance
    const midPoint = Math.floor(sales.length / 2);
    const firstHalf = sales.slice(0, midPoint);
    const secondHalf = sales.slice(midPoint);

    const firstHalfDemand: Record<string, number> = {};
    const secondHalfDemand: Record<string, number> = {};

    firstHalf.forEach((sale) => {
      if (sale.productId) {
        firstHalfDemand[sale.productId] = (firstHalfDemand[sale.productId] || 0) + sale.quantity;
      }
    });

    secondHalf.forEach((sale) => {
      if (sale.productId) {
        secondHalfDemand[sale.productId] = (secondHalfDemand[sale.productId] || 0) + sale.quantity;
      }
    });

    // Recommandations de prix dynamiques
    const recommendations = products
      .map((product) => {
        const demand = productDemand[product.id];
        if (!demand || demand.days === 0) {
          return null;
        }

        const firstHalfQty = firstHalfDemand[product.id] || 0;
        const secondHalfQty = secondHalfDemand[product.id] || 0;
        const trend = secondHalfQty > 0 ? (secondHalfQty - firstHalfQty) / firstHalfQty : 0;

        const dailyDemand = demand.quantity / demand.days;
        const elasticity = 1.5; // Élasticité de la demande estimée

        let suggestedPrice = product.price;
        let priceChange = 0;
        let reason = "Prix optimal";
        let expectedImpact = "";

        // Si demande en hausse, on peut augmenter le prix
        if (trend > 0.2 && dailyDemand > 2) {
          suggestedPrice = product.price * 1.1; // +10%
          priceChange = suggestedPrice - product.price;
          reason = `Demande en hausse (${(trend * 100).toFixed(0)}%) - Prix premium justifié`;
          expectedImpact = `Baisse estimée de 5% des ventes mais hausse de 4.5% des revenus`;
        }
        // Si demande en baisse, réduire le prix
        else if (trend < -0.2 && dailyDemand < 1) {
          suggestedPrice = product.price * 0.9; // -10%
          priceChange = suggestedPrice - product.price;
          reason = `Demande en baisse (${(trend * 100).toFixed(0)}%) - Réduction pour stimuler les ventes`;
          expectedImpact = `Hausse estimée de 15% des ventes, revenus stables`;
        }
        // Si très populaire, prix premium
        else if (dailyDemand > 5) {
          suggestedPrice = product.price * 1.05; // +5%
          priceChange = suggestedPrice - product.price;
          reason = "Produit très populaire - Prix premium possible";
          expectedImpact = "Impact minimal sur les ventes, revenus augmentés";
        }

        return {
          productId: product.id,
          productName: product.name,
          currentPrice: product.price,
          suggestedPrice: Math.round(suggestedPrice * 100) / 100,
          priceChange: Math.round(priceChange * 100) / 100,
          reason,
          expectedImpact,
          dailyDemand: Math.round(dailyDemand * 100) / 100,
          trend: Math.round(trend * 100) / 100,
        };
      })
      .filter((r) => r !== null && Math.abs(r.priceChange) > 0.01)
      .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));

    res.json({
      recommendations: recommendations.slice(0, 10),
      totalRecommendations: recommendations.length,
    });
  } catch (error: any) {
    console.error("Error getting dynamic pricing:", error);
    res.status(500).json({
      error: "Failed to get dynamic pricing",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/revenue-forecast - Prédictions de revenus mensuels/annuels
 */
export const getRevenueForecast: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { period = "monthly" } = req.query;

    // Récupérer les ventes des 12 derniers mois
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const dateStr = twelveMonthsAgo.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(dateStr) as any[];

    // Grouper par mois
    const monthlyRevenue: Record<string, number> = {};
    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + sale.price * sale.quantity;
    });

    const monthlyValues = Object.values(monthlyRevenue);
    const avgMonthlyRevenue = monthlyValues.length > 0
      ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length
      : 0;

    // Calculer la tendance
    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const trend = sortedMonths.length > 1
      ? (monthlyRevenue[sortedMonths[sortedMonths.length - 1]] - monthlyRevenue[sortedMonths[0]]) / sortedMonths.length
      : 0;

    // Prédictions mensuelles pour les 12 prochains mois
    const monthlyForecast = [];
    for (let i = 1; i <= 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const predictedRevenue = Math.max(0, avgMonthlyRevenue + (trend * i));
      monthlyForecast.push({
        month: monthKey,
        monthName: date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
        predictedRevenue: Math.round(predictedRevenue * 100) / 100,
        confidence: monthlyValues.length > 6 ? 0.85 : 0.65,
      });
    }

    // Prédiction annuelle
    const annualForecast = monthlyForecast.reduce((sum, month) => sum + month.predictedRevenue, 0);

    // Prédictions trimestrielles
    const quarterlyForecast = [];
    for (let q = 1; q <= 4; q++) {
      const quarterMonths = monthlyForecast.slice((q - 1) * 3, q * 3);
      const quarterRevenue = quarterMonths.reduce((sum, m) => sum + m.predictedRevenue, 0);
      quarterlyForecast.push({
        quarter: `Q${q}`,
        predictedRevenue: Math.round(quarterRevenue * 100) / 100,
      });
    }

    res.json({
      monthlyForecast,
      quarterlyForecast,
      annualForecast: Math.round(annualForecast * 100) / 100,
      averageMonthlyRevenue: Math.round(avgMonthlyRevenue * 100) / 100,
      trend: Math.round(trend * 100) / 100,
      dataPoints: monthlyValues.length,
    });
  } catch (error: any) {
    console.error("Error getting revenue forecast:", error);
    res.status(500).json({
      error: "Failed to get revenue forecast",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/sales-report - Rapport détaillé des ventes
 */
export const getSalesReport: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { days = 30 } = req.query;
    const daysCount = parseInt(days as string) || 30;

    // Récupérer les ventes de la période
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    const dateStr = startDate.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE userId = ? AND createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(userId, dateStr) as any[];

    // Calculs de base
    const totalSales = sales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    const totalTransactions = sales.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Ventes par catégorie
    const salesByCategory: Record<string, { total: number; count: number }> = {};
    sales.forEach((sale) => {
      const category = sale.category || "other";
      if (!salesByCategory[category]) {
        salesByCategory[category] = { total: 0, count: 0 };
      }
      salesByCategory[category].total += sale.price * sale.quantity;
      salesByCategory[category].count += 1;
    });

    const categoryArray = Object.entries(salesByCategory).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / totalSales) * 100,
    })).sort((a, b) => b.total - a.total);

    // Top produits
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach((sale) => {
      const productId = sale.productId || sale.id;
      const productName = sale.productName || sale.name || "Produit inconnu";
      if (!productSales[productId]) {
        productSales[productId] = { name: productName, quantity: 0, revenue: 0 };
      }
      productSales[productId].quantity += sale.quantity;
      productSales[productId].revenue += sale.price * sale.quantity;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Ventes quotidiennes
    const dailySales: Record<string, { total: number; transactions: number }> = {};
    sales.forEach((sale) => {
      const date = sale.createdAt.split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { total: 0, transactions: 0 };
      }
      dailySales[date].total += sale.price * sale.quantity;
      dailySales[date].transactions += 1;
    });

    const dailySalesArray = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      totalSales,
      totalTransactions,
      averageTransaction,
      salesByCategory: categoryArray,
      topProducts,
      dailySales: dailySalesArray,
      period: `${daysCount} jours`,
    });
  } catch (error: any) {
    console.error("Error getting sales report:", error);
    res.status(500).json({
      error: "Failed to get sales report",
      message: error.message,
    });
  }
};

/**
 * GET /api/analytics/tax-report - Rapport détaillé des taxes
 */
export const getTaxReport: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { days = 30 } = req.query;
    const daysCount = parseInt(days as string) || 30;

    // Récupérer les ventes de la période
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    const dateStr = startDate.toISOString().split("T")[0];

    const sales = db
      .prepare(
        "SELECT * FROM sales WHERE userId = ? AND createdAt >= ? ORDER BY createdAt DESC"
      )
      .all(userId, dateStr) as any[];

    // Récupérer les paramètres de taxe de l'utilisateur
    const user = db
      .prepare("SELECT taxRegion, currency FROM users WHERE id = ?")
      .get(userId) as any;

    let totalBeforeTax = 0;
    let totalTaxes = 0;
    let totalRevenue = 0;
    const taxBreakdown: Record<string, number> = {};

    // Calculer les taxes pour chaque vente
    sales.forEach((sale) => {
      const subtotal = sale.price * sale.quantity;
      const tax = sale.tax || 0;
      const total = subtotal + tax;

      totalBeforeTax += subtotal;
      totalTaxes += tax;
      totalRevenue += total;

      // Détail des taxes par type (si disponible)
      if (sale.taxType) {
        taxBreakdown[sale.taxType] = (taxBreakdown[sale.taxType] || 0) + tax;
      }
    });

    const averageTaxRate = totalBeforeTax > 0 ? (totalTaxes / totalBeforeTax) * 100 : 0;

    // Convertir taxBreakdown en array
    const taxBreakdownArray = Object.entries(taxBreakdown).map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / totalTaxes) * 100,
      rate: user?.taxRegion ? getTaxRateForRegion(user.taxRegion) : 0,
    }));

    // Taxes par période (hebdomadaire)
    const weeklyTaxes: Record<string, { taxes: number; revenue: number; transactions: number }> = {};
    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyTaxes[weekKey]) {
        weeklyTaxes[weekKey] = { taxes: 0, revenue: 0, transactions: 0 };
      }
      weeklyTaxes[weekKey].taxes += sale.tax || 0;
      weeklyTaxes[weekKey].revenue += (sale.price * sale.quantity) + (sale.tax || 0);
      weeklyTaxes[weekKey].transactions += 1;
    });

    const taxByPeriod = Object.entries(weeklyTaxes)
      .map(([date, data]) => ({
        period: `Semaine du ${new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`,
        ...data,
      }))
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

    res.json({
      totalTaxes,
      totalBeforeTax,
      totalRevenue,
      averageTaxRate,
      taxBreakdown: taxBreakdownArray.length > 0 ? taxBreakdownArray : [{
        name: "Taxe principale",
        amount: totalTaxes,
        percentage: 100,
        rate: user?.taxRegion ? getTaxRateForRegion(user.taxRegion) : 0,
      }],
      taxByPeriod,
      region: user?.taxRegion || "Non défini",
      currency: user?.currency || "CAD",
    });
  } catch (error: any) {
    console.error("Error getting tax report:", error);
    res.status(500).json({
      error: "Failed to get tax report",
      message: error.message,
    });
  }
};

// Helper function to get tax rate for a region
function getTaxRateForRegion(region: string): number {
  // Simplified tax rates - should match settings
  const taxRates: Record<string, number> = {
    quebec: 14.975, // TPS 5% + TVQ 9.975%
    ontario: 13,
    "british-columbia": 15, // TPS 5% + PST 10%
    alberta: 5,
    manitoba: 12, // TPS 5% + TVD 7%
    saskatchewan: 11, // TPS 5% + PST 6%
    "nova-scotia": 15,
    "new-brunswick": 15,
    newfoundland: 15,
    "prince-edward-island": 15,
  };
  return taxRates[region] || 0;
}

/**
 * GET /api/analytics/food-wine-pairing - Recommandations d'accords mets-vin avec IA
 */
export const getFoodWinePairing: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Récupérer les produits depuis SQLite
    const products = db.prepare("SELECT * FROM products").all() as any[];
    
    // Filtrer les vins
    const wines = products.filter(p => 
      p.category === "wine" || 
      (p.name && p.name.toLowerCase().includes("vin"))
    );

    // Si pas de vins, retourner des suggestions génériques
    if (wines.length === 0) {
      return res.json({
        pairings: [
          {
            food: "Steak grillé",
            wine: "Cabernet Sauvignon",
            reason: "Le tannin du Cabernet Sauvignon complète parfaitement la richesse du steak",
            description: "Un accord classique et intemporel"
          },
          {
            food: "Saumon",
            wine: "Pinot Grigio",
            reason: "La fraîcheur du Pinot Grigio équilibre la texture du saumon",
            description: "Accord délicat et raffiné"
          }
        ]
      });
    }

    // Utiliser OpenAI pour générer des accords personnalisés
    const wineList = wines.map(w => w.name).join(", ");
    const prompt = `En tant que sommelier expert, recommande 5 accords mets-vin pour un bar/restaurant. 
    
Vins disponibles: ${wineList}

Pour chaque accord, fournis:
- Le plat (ex: steak, saumon, fromage, etc.)
- Le vin recommandé (choisis parmi la liste)
- La raison de l'accord
- Une brève description

Réponds en JSON avec ce format:
{
  "pairings": [
    {
      "food": "nom du plat",
      "wine": "nom du vin",
      "reason": "explication de l'accord",
      "description": "description courte"
    }
  ]
}`;

    console.log("[Food-Wine Pairing] Appel OpenAI avec prompt:", prompt.substring(0, 200) + "...");
    const aiResponse = await callOpenAIJSON<{ pairings: Array<{
      food: string;
      wine: string;
      reason: string;
      description: string;
    }> }>(prompt, "Tu es un sommelier expert avec une connaissance approfondie des accords mets-vin.");

    console.log("[Food-Wine Pairing] Réponse OpenAI:", aiResponse ? `${aiResponse.pairings?.length || 0} accords` : "Aucune réponse");

    if (aiResponse && aiResponse.pairings) {
      console.log("[Food-Wine Pairing] Utilisation des accords IA");
      return res.json({
        pairings: aiResponse.pairings.slice(0, 5)
      });
    }

    // Fallback si OpenAI ne répond pas
    return res.json({
      pairings: [
        {
          food: "Steak grillé",
          wine: wines[0]?.name || "Vin rouge",
          reason: "Le tannin du vin rouge complète la richesse du steak",
          description: "Accord classique"
        }
      ]
    });
  } catch (error: any) {
    console.error("Error getting food-wine pairing:", error);
    res.status(500).json({
      error: "Failed to get food-wine pairing",
      message: error.message,
    });
  }
};
