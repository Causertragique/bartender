import { RequestHandler } from "express";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";

// Chemin du fichier CSV compatible ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.join(__dirname, "../data/prix_restauration.csv");

// Fonction utilitaire pour lire le fichier CSV et retourner les données
function getPrixRestaurationData() {
  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parse(csvContent, { columns: true, skip_empty_lines: true });
  // On suppose les colonnes : Catégorie, Nom du produit, Prix titulaire, Pays d'origine, Format (ml), Couleur
  return rows.map((row: any) => ({
    categorie: row["Catégorie"] || row["categorie"] || row["Category"],
    nom: row["Nom du produit"] || row["nom"] || row["Product Name"],
    prix: row["Prix titulaire"] || row["prix"] || row["Prix restauration"] || row["Holder Price"],
    pays: row["Pays d'origine"] || row["pays"] || row["Country of Origin"],
    format: row["Format (ml)"] || row["format"] || row["Format"],
    couleur: row["Couleur"] || row["couleur"] || row["Color"],
  }));
}

// Route API : /api/prix-restauration?nom=...&categorie=...
export const handlePrixRestauration: RequestHandler = (req, res) => {
  const { nom, categorie } = req.query;
  if (!nom || !categorie) {
    return res.status(400).json({ error: "nom et categorie requis" });
  }
  const data = getPrixRestaurationData();
  // Recherche par nom et catégorie
  const produit = data.find(
    (item) =>
      item.nom && item.categorie &&
      item.nom.toLowerCase().trim() === String(nom).toLowerCase().trim() &&
      item.categorie.toLowerCase().trim() === String(categorie).toLowerCase().trim()
  );
  if (!produit) {
    return res.status(404).json({ error: "Produit non trouvé" });
  }
  res.json(produit);
};
