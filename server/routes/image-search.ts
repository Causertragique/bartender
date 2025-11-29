import { RequestHandler } from "express";

// POST /api/image-search - Recherche d'images via Google Custom Search API
export const searchImages: RequestHandler = async (req, res) => {
  try {
    const { productName } = req.body;

    if (!productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Le nom du produit est requis" });
    }

    // Récupérer les clés API depuis les variables d'environnement (serveur uniquement)
    // Support both VITE_ prefixed (for compatibility) and non-prefixed keys
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CX || process.env.VITE_GOOGLE_CX || "2604700cf916145eb"; // CX par défaut

    if (!GOOGLE_API_KEY) {
      return res.status(400).json({ 
        error: "Clé API Google non configurée. Configurez GOOGLE_API_KEY ou VITE_GOOGLE_API_KEY dans le fichier .env" 
      });
    }

    const keywords = productName.trim().split(/\s+/).filter(word => word.length > 0);
    const searchQuery = keywords.join(' ');

    // Recherche d'images
    const imageSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&safe=active&imgSize=medium&imgType=photo`;
    
    const imageResponse = await fetch(imageSearchUrl);
    
    if (!imageResponse.ok) {
      const errorData = await imageResponse.text();
      console.error("Google API error:", errorData);
      return res.status(imageResponse.status).json({ 
        error: "Erreur lors de la recherche d'images",
        details: errorData 
      });
    }

    const imageData = await imageResponse.json();
    
    if (!imageData.items || imageData.items.length === 0) {
      return res.json({ images: [] });
    }

    // Formater les résultats
    const images = imageData.items.map((item: any) => ({
      imageUrl: item.link,
      thumbnailUrl: item.image?.thumbnailLink || item.link,
      title: item.title,
      contextUrl: item.image?.contextLink || item.link,
    }));

    res.json({ images });
  } catch (error: any) {
    console.error("Error searching for images:", error);
    res.status(500).json({ 
      error: "Erreur lors de la recherche d'images",
      details: error.message 
    });
  }
};

