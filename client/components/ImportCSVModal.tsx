import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "./ui/button";

interface ImportCSVModalProps {
  onImport: (products: ImportedProduct[]) => void;
  onClose: () => void;
}

export interface ImportedProduct {
  name: string;
  category: string;
  price: number;
  format: string;
  origin: string;
}

export default function ImportCSVModal({ onImport, onClose }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products: ImportedProduct[] = results.data.map((row: any) => ({
          name: row["nom"] || row["Nom"] || row["name"] || row["Name"],
          category: row["catégorie"] || row["Catégorie"] || row["category"] || row["Category"],
          price: parseFloat(row["prix"] || row["Prix"] || row["price"] || row["Price"]),
          format: row["format"] || row["Format"] || "",
          origin: row["origine"] || row["Origine"] || row["origin"] || row["Origin"] || "",
        })).filter(p => p.name && p.category && !isNaN(p.price));
        onImport(products);
        setLoading(false);
        onClose();
      },
      error: () => {
        setError("Erreur lors de la lecture du fichier CSV.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Importer un fichier CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Import..." : "Importer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
