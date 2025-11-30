import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/components/ProductCard";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  User,
  Save,
  Upload,
  Download,
  CreditCard,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  
  // Collapse state for each section (all closed by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: false,
    notifications: false,
    importExport: false,
    stripe: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Save button state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Stripe keys state
  const [stripeKeys, setStripeKeys] = useState({
    secretKey: "",
    publishableKey: "",
    terminalLocationId: "",
    isTestMode: true,
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [stripeKeysLoading, setStripeKeysLoading] = useState(false);
  const [showStripeGuide, setShowStripeGuide] = useState(false);

  // Tax rates by region (used for display only - actual calculations in Sales.tsx)
  const taxRatesByRegion: Record<string, number> = {
    // Canada
    "quebec": 0.14975, // TPS 5% + TVQ 9.975% (TVQ sur prix + TPS)
    "ontario": 0.13, // TVH 13%
    "british-columbia": 0.155, // TPS 5% + PST 10% (PST sur prix + TPS)
    "alberta": 0.05, // TPS 5%
    "manitoba": 0.1235, // TPS 5% + TVD 7% (TVD sur prix + TPS)
    "saskatchewan": 0.113, // TPS 5% + PST 6% (PST sur prix + TPS)
    "nova-scotia": 0.15, // HST 15%
    "new-brunswick": 0.15, // HST 15%
    "newfoundland": 0.15, // HST 15%
    "prince-edward-island": 0.15, // HST 15%
    "northwest-territories": 0.05, // GST 5%
    "nunavut": 0.05, // GST 5%
    "yukon": 0.05, // GST 5%
    // United States (varies by state and locality)
    "new-york": 0.08875, // 4% à 8.875% (using max rate)
    "california": 0.0725, // 7.25% à 10% (using base rate)
    "texas": 0.0625, // 6.25% à 8.25% (using base rate)
    "florida": 0.06, // 6% à 7.5% (using base rate)
    "illinois": 0.0625, // 6.25% à 11% (using base rate, Chicago has higher)
    "nevada": 0.0685, // 6.85% à 8.375%
    "washington": 0.065, // 6.5% à 10.4% (using base rate)
    "oregon": 0.0, // 0% (no sales tax)
    "new-hampshire": 0.0, // 0% (no sales tax)
    "montana": 0.0, // 0% (no sales tax)
    // Europe
    "france": 0.20, // TVA 20%
    "spain": 0.21, // IVA 21%
    "germany": 0.19, // MwSt 19%
    "italy": 0.22, // IVA 22%
    "uk": 0.20, // VAT 20%
    "belgium": 0.21, // TVA 21%
    "netherlands": 0.21, // BTW 21%
    "portugal": 0.23, // IVA 23%
    "sweden": 0.25, // Moms 25%
    "denmark": 0.25, // Moms 25%
    "poland": 0.23, // VAT 23%
    // Latin America
    "mexico": 0.16, // IVA 16%
    "argentina": 0.21, // IVA 21%
    "chile": 0.19, // IVA 19%
    "colombia": 0.19, // IVA 19%
    "peru": 0.18, // IGV 18%
    "ecuador": 0.12, // IVA 12%
    "uruguay": 0.22, // IVA 22%
    "panama": 0.07, // ITBMS 7%
    "dominican-republic": 0.18, // ITBIS 18%
    // Other
    "australia": 0.10, // GST 10%
    "new-zealand": 0.15, // GST 15%
    "switzerland": 0.077, // TVA 7.7%
    "custom": 0.08, // Custom rate
  };

  const [settings, setSettings] = useState({
    // General
    barName: "La Réserve",
    address: "",
    phone: "",
    email: "",
    currency: "USD",
    taxRegion: "custom",
    taxRate: 0.08,

    // Notifications
    lowStockAlerts: true,
    salesReports: true,
    weeklySummary: true,

    // Inventory
    lowStockThreshold: 5,
    autoReorder: false,
    reorderQuantity: 10,
  });

  // API Keys are now stored server-side only (in .env file)

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("bartender-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
    
    // Load Stripe keys from server
    loadStripeKeys();
  }, []);

  const loadStripeKeys = async () => {
    try {
      setStripeKeysLoading(true);
      const authToken = localStorage.getItem("bartender-auth");
      if (!authToken) return;

      // Parse auth token safely - it might be a string or JSON
      let authData: any = {};
      try {
        authData = typeof authToken === 'string' && authToken.startsWith('{') 
          ? JSON.parse(authToken) 
          : { userId: "", username: "" };
      } catch {
        // If it's just "authenticated" string, use empty auth data
        authData = { userId: "", username: "" };
      }

      const response = await fetch("/api/stripe-keys", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "x-user-id": authData.userId || "",
          "x-username": authData.username || "",
        },
      });

      if (response.ok) {
        const keys = await response.json();
        setStripeKeys(keys);
      }
    } catch (error) {
      console.error("Error loading Stripe keys:", error);
    } finally {
      setStripeKeysLoading(false);
    }
  };

  const handleSaveStripeKeys = async () => {
    try {
      setStripeKeysLoading(true);
      const authToken = localStorage.getItem("bartender-auth");
      if (!authToken) {
        alert("Vous devez être connecté pour sauvegarder vos clés Stripe");
        return;
      }

      // Parse auth token safely - it might be a string or JSON
      let authData: any = {};
      try {
        authData = typeof authToken === 'string' && authToken.startsWith('{') 
          ? JSON.parse(authToken) 
          : { userId: "", username: "" };
      } catch {
        authData = { userId: "", username: "" };
      }

      const response = await fetch("/api/stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "x-user-id": authData.userId || "",
          "x-username": authData.username || "",
        },
        body: JSON.stringify(stripeKeys),
      });

      if (response.ok) {
        alert("Clés Stripe enregistrées avec succès !");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'enregistrement des clés Stripe");
      }
    } catch (error: any) {
      console.error("Error saving Stripe keys:", error);
      alert("Erreur lors de l'enregistrement des clés Stripe");
    } finally {
      setStripeKeysLoading(false);
    }
  };

  // Mapping des devises aux régions fiscales disponibles
  const getTaxRegionsByCurrency = (currency: string): string[] => {
    const currencyToRegions: Record<string, string[]> = {
      CAD: [
        "quebec", "ontario", "british-columbia", "alberta", "manitoba",
        "saskatchewan", "nova-scotia", "new-brunswick", "newfoundland",
        "prince-edward-island", "northwest-territories", "nunavut", "yukon"
      ],
      USD: [
        "california", "new-york", "texas", "florida", "illinois",
        "nevada", "washington", "oregon", "new-hampshire", "montana",
        "ecuador", "panama", "dominican-republic"
      ],
      EUR: [
        "france", "spain", "germany", "italy", "belgium",
        "netherlands", "portugal", "sweden", "denmark", "poland"
      ],
      MXN: ["mexico"],
      ARS: ["argentina"],
      CLP: ["chile"],
      COP: ["colombia"],
      PEN: ["peru"],
      UYU: ["uruguay"],
      AUD: ["australia"],
      NZD: ["new-zealand"],
      CHF: ["switzerland"],
      GBP: ["uk"],
    };
    
    return currencyToRegions[currency] || [];
  };

  // Vérifier si une région est disponible pour la devise actuelle
  const isTaxRegionAvailable = (region: string, currency: string): boolean => {
    const availableRegions = getTaxRegionsByCurrency(currency);
    return availableRegions.includes(region) || region === "custom";
  };

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      
      // Si la devise change, réinitialiser la région fiscale si elle n'est plus valide
      if (key === "currency" && typeof value === "string") {
        const availableRegions = getTaxRegionsByCurrency(value);
        if (!isTaxRegionAvailable(updated.taxRegion, value)) {
          // Si la région actuelle n'est pas disponible, utiliser "custom" ou la première disponible
          updated.taxRegion = availableRegions.length > 0 ? availableRegions[0] : "custom";
          updated.taxRate = updated.taxRegion === "custom" ? 0.08 : (taxRatesByRegion[updated.taxRegion] || 0.08);
        }
      }
      
      // Auto-update tax rate when region changes
      if (key === "taxRegion" && typeof value === "string") {
        updated.taxRate = taxRatesByRegion[value] || 0.08;
      }
      return updated;
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as "en" | "fr" | "es" | "de");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage
      localStorage.setItem("bartender-settings", JSON.stringify(settings));
      // Simulate a brief delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsSaving(false);
      setIsSaved(true);
      // Reset to normal state after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSaving(false);
      setIsSaved(false);
    }
  };

  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const mapCategory = (category: string): "spirits" | "wine" | "beer" | "soda" | "juice" | "other" => {
    const lower = category.toLowerCase();
    if (lower.includes("spirit") || lower.includes("spiritueux")) return "spirits";
    if (lower.includes("wine") || lower.includes("vin")) return "wine";
    if (lower.includes("beer") || lower.includes("bière")) return "beer";
    if (lower.includes("soda") || lower.includes("gazeuse") || lower.includes("gazeux")) return "soda";
    if (lower.includes("juice") || lower.includes("jus")) return "juice";
    return "other";
  };

  const processImportedProducts = (products: any[]) => {
    // Map the imported data to your product structure
    const mappedProducts = products.map((product: any, index: number) => ({
      id: product.id || `imported-${Date.now()}-${index}`,
      name: product.name || product.Nom || product["Product Name"] || "",
      category: mapCategory(product.category || product.Catégorie || product.Category || ""),
      price: parseFloat(product.price || product.Prix || product["Price"] || 0),
      quantity: parseInt(product.quantity || product.Quantité || product.Quantity || 0),
      unit: product.unit || product.Unité || product.Unit || "bottles",
      lastRestocked: product.lastRestocked || product["Last Restocked"] || new Date().toISOString().split("T")[0],
    })).filter((p: any) => p.name && p.name.trim() !== "");

    // Store in localStorage
    const existingProducts = getProducts();
    const updatedProducts = [...existingProducts, ...mappedProducts];
    localStorage.setItem("inventory-products", JSON.stringify(updatedProducts));
    
    alert(`${t.settings.import.importSuccess} ${mappedProducts.length} ${t.settings.import.productsImported}.`);
    setIsImporting(false);
    setImportFile(null);
    
    // Reset file input
    const fileInput = document.getElementById("import-file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert(t.settings.import.fileRequired);
      return;
    }

    setIsImporting(true);

    try {
      const fileExtension = importFile.name.split(".").pop()?.toLowerCase();
      let products: any[] = [];

      if (fileExtension === "csv") {
        // Parse CSV
        Papa.parse(importFile, {
          header: true,
          complete: (results) => {
            products = results.data as any[];
            processImportedProducts(products);
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            alert(t.settings.import.importError);
            setIsImporting(false);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        // Parse Excel
        const arrayBuffer = await importFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        products = jsonData as any[];
        processImportedProducts(products);
      } else {
        alert(t.settings.import.importError);
        setIsImporting(false);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert(t.settings.import.importError);
      setIsImporting(false);
    }
  };

  // Export functions
  const getProducts = (): Product[] => {
    const stored = localStorage.getItem("inventory-products");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  const exportToCSV = () => {
    const products = getProducts();
    if (products.length === 0) {
      alert(t.settings.export.noProducts);
      return;
    }

    try {
      // Create CSV headers
      const headers = ["ID", "Name", "Category", "Price", "Quantity", "Unit", "Last Restocked"];
      const rows = products.map((p) => [
        p.id,
        p.name,
        p.category,
        p.price.toString(),
        p.quantity.toString(),
        p.unit,
        p.lastRestocked || "",
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `inventory-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(t.settings.export.exportSuccess);
    } catch (error) {
      console.error("Export error:", error);
      alert(t.settings.export.exportError);
    }
  };

  const exportToExcel = () => {
    const products = getProducts();
    if (products.length === 0) {
      alert(t.settings.export.noProducts);
      return;
    }

    try {
      // Prepare data for Excel
      const data = products.map((p) => ({
        ID: p.id,
        Name: p.name,
        Category: p.category,
        Price: p.price,
        Quantity: p.quantity,
        Unit: p.unit,
        "Last Restocked": p.lastRestocked || "",
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

      // Generate Excel file and download
      XLSX.writeFile(workbook, `inventory-${new Date().toISOString().split("T")[0]}.xlsx`);
      alert(t.settings.export.exportSuccess);
    } catch (error) {
      console.error("Export error:", error);
      alert(t.settings.export.exportError);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              {t.settings.title}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t.settings.subtitle}
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            size="icon" 
            variant="ghost"
            className={cn(
              "h-10 w-10 transition-all",
              isSaving && "bg-primary text-primary-foreground",
              isSaved && "bg-green-500 text-white hover:bg-green-500",
              !isSaving && !isSaved && "bg-transparent hover:bg-secondary/50"
            )}
            disabled={isSaving}
          >
            {isSaved ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
          {/* General Settings */}
          <Card>
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection("general")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    {t.settings.general.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {t.settings.general.description}
                  </CardDescription>
                </div>
                {openSections.general ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {openSections.general && (
            <CardContent className="space-y-2 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="barName">{t.settings.general.barName}</Label>
                  <Input
                    id="barName"
                    value={settings.barName}
                    onChange={(e) => handleInputChange("barName", e.target.value)}
                    placeholder={t.settings.general.barName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t.settings.general.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t.settings.general.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">{t.settings.general.address}</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">{t.settings.general.currency}</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="MXN">MXN (Mex$)</SelectItem>
                      <SelectItem value="ARS">ARS ($)</SelectItem>
                      <SelectItem value="CLP">CLP ($)</SelectItem>
                      <SelectItem value="COP">COP ($)</SelectItem>
                      <SelectItem value="PEN">PEN (S/)</SelectItem>
                      <SelectItem value="UYU">UYU ($U)</SelectItem>
                      <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                      <SelectItem value="CHF">CHF (CHF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="taxRegion">{t.settings.general.taxRegion}</Label>
                  <Select
                    value={settings.taxRegion}
                    onValueChange={(value) => handleInputChange("taxRegion", value)}
                  >
                    <SelectTrigger id="taxRegion">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const availableRegions = getTaxRegionsByCurrency(settings.currency);
                        const allRegions = [
                          { value: "quebec", label: t.settings.general.taxRegions.quebec },
                          { value: "ontario", label: t.settings.general.taxRegions.ontario },
                          { value: "british-columbia", label: t.settings.general.taxRegions["british-columbia"] },
                          { value: "alberta", label: t.settings.general.taxRegions.alberta },
                          { value: "manitoba", label: t.settings.general.taxRegions.manitoba },
                          { value: "saskatchewan", label: t.settings.general.taxRegions.saskatchewan },
                          { value: "nova-scotia", label: t.settings.general.taxRegions["nova-scotia"] },
                          { value: "new-brunswick", label: t.settings.general.taxRegions["new-brunswick"] },
                          { value: "newfoundland", label: t.settings.general.taxRegions.newfoundland },
                          { value: "prince-edward-island", label: t.settings.general.taxRegions["prince-edward-island"] },
                          { value: "northwest-territories", label: t.settings.general.taxRegions["northwest-territories"] },
                          { value: "nunavut", label: t.settings.general.taxRegions.nunavut },
                          { value: "yukon", label: t.settings.general.taxRegions.yukon },
                          { value: "california", label: t.settings.general.taxRegions.california },
                          { value: "new-york", label: t.settings.general.taxRegions["new-york"] },
                          { value: "texas", label: t.settings.general.taxRegions.texas },
                          { value: "florida", label: t.settings.general.taxRegions.florida },
                          { value: "illinois", label: t.settings.general.taxRegions.illinois },
                          { value: "nevada", label: t.settings.general.taxRegions.nevada },
                          { value: "washington", label: t.settings.general.taxRegions.washington },
                          { value: "oregon", label: t.settings.general.taxRegions.oregon },
                          { value: "new-hampshire", label: t.settings.general.taxRegions["new-hampshire"] },
                          { value: "montana", label: t.settings.general.taxRegions.montana },
                          { value: "france", label: t.settings.general.taxRegions.france },
                          { value: "spain", label: t.settings.general.taxRegions.spain },
                          { value: "germany", label: t.settings.general.taxRegions.germany },
                          { value: "italy", label: t.settings.general.taxRegions.italy },
                          { value: "uk", label: t.settings.general.taxRegions.uk },
                          { value: "belgium", label: t.settings.general.taxRegions.belgium },
                          { value: "netherlands", label: t.settings.general.taxRegions.netherlands },
                          { value: "portugal", label: t.settings.general.taxRegions.portugal },
                          { value: "sweden", label: t.settings.general.taxRegions.sweden },
                          { value: "denmark", label: t.settings.general.taxRegions.denmark },
                          { value: "poland", label: t.settings.general.taxRegions.poland },
                          { value: "mexico", label: t.settings.general.taxRegions.mexico },
                          { value: "argentina", label: t.settings.general.taxRegions.argentina },
                          { value: "chile", label: t.settings.general.taxRegions.chile },
                          { value: "colombia", label: t.settings.general.taxRegions.colombia },
                          { value: "peru", label: t.settings.general.taxRegions.peru },
                          { value: "ecuador", label: t.settings.general.taxRegions.ecuador },
                          { value: "uruguay", label: t.settings.general.taxRegions.uruguay },
                          { value: "panama", label: t.settings.general.taxRegions.panama },
                          { value: "dominican-republic", label: t.settings.general.taxRegions["dominican-republic"] },
                          { value: "australia", label: t.settings.general.taxRegions.australia },
                          { value: "new-zealand", label: t.settings.general.taxRegions["new-zealand"] },
                          { value: "switzerland", label: t.settings.general.taxRegions.switzerland },
                          { value: "custom", label: t.settings.general.taxRegions.custom },
                        ];
                        
                        return allRegions
                          .filter(region => isTaxRegionAvailable(region.value, settings.currency))
                          .map(region => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="taxRate">{t.settings.general.taxRate}</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.taxRate}
                    onChange={(e) =>
                      handleInputChange("taxRate", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.08"
                    disabled={settings.taxRegion !== "custom"}
                  />
                  {settings.taxRegion !== "custom" && (
                    <p className="text-xs text-muted-foreground">
                      {(settings.taxRate * 100).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          {/* Notifications Settings */}
          <Card>
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection("notifications")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-4 w-4" />
                    {t.settings.notifications.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {t.settings.notifications.description}
                  </CardDescription>
                </div>
                {openSections.notifications ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {openSections.notifications && (
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0">
                  <Label htmlFor="lowStockAlerts" className="text-sm">{t.settings.notifications.lowStockAlerts}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.settings.notifications.lowStockAlertsDesc}
                  </p>
                </div>
                <Switch
                  id="lowStockAlerts"
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) =>
                    handleInputChange("lowStockAlerts", checked)
                  }
                />
              </div>
              <div className="space-y-1 pl-0">
                <Label htmlFor="lowStockThreshold" className="text-sm">{t.settings.inventory.lowStockThreshold}</Label>
                <p className="text-xs text-muted-foreground">
                  {t.settings.inventory.lowStockThresholdDesc}
                </p>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) =>
                    handleInputChange(
                      "lowStockThreshold",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0">
                  <Label htmlFor="salesReports" className="text-sm">{t.settings.notifications.salesReports}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.settings.notifications.salesReportsDesc}
                  </p>
                </div>
                <Switch
                  id="salesReports"
                  checked={settings.salesReports}
                  onCheckedChange={(checked) =>
                    handleInputChange("salesReports", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0">
                  <Label htmlFor="weeklySummary" className="text-sm">{t.settings.notifications.weeklySummary}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.settings.notifications.weeklySummaryDesc}
                  </p>
                </div>
                <Switch
                  id="weeklySummary"
                  checked={settings.weeklySummary}
                  onCheckedChange={(checked) =>
                    handleInputChange("weeklySummary", checked)
                  }
                />
              </div>
            </CardContent>
            )}
          </Card>

          {/* Import/Export Settings */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection("importExport")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t.settings.import.title}
                  </CardTitle>
                  <CardDescription>
                    {t.settings.import.description}
                  </CardDescription>
                </div>
                {openSections.importExport ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {openSections.importExport && (
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="import-file-input">{t.settings.import.selectFile}</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="import-file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    aria-label={t.settings.import.selectFile}
                    title={t.settings.import.selectFile}
                    className="flex-1 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
                    disabled={isImporting}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.settings.import.supportedFormats}
                </p>
              </div>
              {importFile && (
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{t.settings.import.selected}:</span> {importFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(importFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
              <Button
                onClick={handleImport}
                disabled={!importFile || isImporting}
                variant="outline"
                className="w-full gap-2 border-2 border-foreground/20 bg-background text-black dark:text-white hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? t.settings.import.processing : t.settings.import.importInventory}
              </Button>
              <div className="space-y-2">
                <Label>{t.settings.export.title}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.export.description}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="w-full sm:flex-1 gap-2 border-2 border-foreground/20 bg-background text-black dark:text-white hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4" />
                  {t.settings.export.exportAsCSV}
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="w-full sm:flex-1 gap-2 border-2 border-foreground/20 bg-background text-black dark:text-white hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4" />
                  {t.settings.export.exportAsExcel}
                </Button>
              </div>
              <Separator />
              
              {/* Appearance Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">{t.settings.appearance.title}</h3>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="space-y-2">
                    <Label htmlFor="theme">{t.settings.appearance.theme}</Label>
                    <Select
                      value={theme || "system"}
                      onValueChange={handleThemeChange}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t.common.light}</SelectItem>
                        <SelectItem value="dark">{t.common.dark}</SelectItem>
                        <SelectItem value="system">{t.common.system}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t.settings.appearance.language}</Label>
                    <Select
                      value={language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          {/* Stripe Configuration */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection("stripe")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Configuration Stripe
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Configurez vos clés API Stripe pour activer les paiements en personne avec Terminal
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!stripeKeys.secretKey && !stripeKeys.publishableKey && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Non configuré</span>
                    </div>
                  )}
                  {stripeKeys.secretKey && stripeKeys.publishableKey && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Configuré</span>
                    </div>
                  )}
                  {openSections.stripe ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            {openSections.stripe && (
            <CardContent className="space-y-3">
              {/* Guide rapide pour créer un compte Stripe */}
              {(!stripeKeys.secretKey || !stripeKeys.publishableKey) && (
                <div className="p-4 bg-secondary border-2 border-foreground/20 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Pas encore de compte Stripe ?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créez votre compte Stripe en quelques minutes. C'est gratuit et vous pouvez commencer à tester immédiatement.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <a
                          href="https://stripe.com/register"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          Créer un compte Stripe
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setShowStripeGuide(!showStripeGuide)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium border-2 border-foreground/20"
                        >
                          {showStripeGuide ? "Masquer" : "Voir"} le guide
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Guide détaillé */}
                  {showStripeGuide && (
                    <div className="mt-4 pt-4 border-t-2 border-foreground/20 space-y-3">
                      <p className="text-xs font-semibold text-foreground uppercase">Guide pas à pas :</p>
                      <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                        <li>
                          <span className="font-medium text-foreground">Créez votre compte</span> - Cliquez sur "Créer un compte Stripe" ci-dessus (gratuit, ~5 minutes)
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Vérifiez votre email</span> - Stripe vous enverra un email de confirmation
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Remplissez vos informations</span> - Nom de votre bar/entreprise, adresse, etc.
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Obtenez vos clés API</span> - Allez dans{" "}
                          <a
                            href="https://dashboard.stripe.com/test/apikeys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            Developers &gt; API keys
                            <ExternalLink className="h-3 w-3" />
                          </a>{" "}
                          dans votre tableau de bord Stripe
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Copiez vos clés</span> - Copiez la "Secret key" (sk_test_...) et la "Publishable key" (pk_test_...)
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Collez-les ci-dessous</span> - Entrez vos clés dans les champs et cliquez sur "Enregistrer"
                        </li>
                      </ol>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground">
                          <strong>Astuce :</strong> Commencez par le mode test (gratuit, sans frais). Vous pourrez activer le mode production plus tard après vérification de votre identité.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Liens utiles */}
              {stripeKeys.secretKey && stripeKeys.publishableKey && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://dashboard.stripe.com/test/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Voir mes clés API
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-xs text-muted-foreground">•</span>
                  <a
                    href="https://dashboard.stripe.com/terminal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Configurer Terminal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-xs text-muted-foreground">•</span>
                  <a
                    href="https://stripe.com/docs/terminal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="stripe-secret-key">Clé secrète Stripe (Secret Key)</Label>
                <div className="relative">
                  <Input
                    id="stripe-secret-key"
                    type={showSecretKey ? "text" : "password"}
                    placeholder="sk_test_..."
                    value={stripeKeys.secretKey}
                    onChange={(e) =>
                      setStripeKeys({ ...stripeKeys, secretKey: e.target.value })
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
                  >
                    {showSecretKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Commence par sk_test_ (test) ou sk_live_ (production)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-publishable-key">Clé publique Stripe (Publishable Key)</Label>
                <Input
                  id="stripe-publishable-key"
                  type="text"
                  placeholder="pk_test_..."
                  value={stripeKeys.publishableKey}
                  onChange={(e) =>
                    setStripeKeys({ ...stripeKeys, publishableKey: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Commence par pk_test_ (test) ou pk_live_ (production)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stripe-terminal-location">Location ID Terminal (optionnel)</Label>
                  <a
                    href="https://dashboard.stripe.com/terminal/locations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Gérer les locations
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Input
                  id="stripe-terminal-location"
                  type="text"
                  placeholder="tmloc_..."
                  value={stripeKeys.terminalLocationId}
                  onChange={(e) =>
                    setStripeKeys({ ...stripeKeys, terminalLocationId: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  ID de location pour les lecteurs Terminal.{" "}
                  <a
                    href="https://dashboard.stripe.com/terminal/locations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Créez ou gérez vos locations
                  </a>{" "}
                  dans votre tableau de bord Stripe.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stripe-test-mode">Mode test</Label>
                  <p className="text-sm text-muted-foreground">
                    Activez le mode test pour tester sans frais réels
                  </p>
                </div>
                <Switch
                  id="stripe-test-mode"
                  checked={stripeKeys.isTestMode}
                  onCheckedChange={(checked) =>
                    setStripeKeys({ ...stripeKeys, isTestMode: checked })
                  }
                />
              </div>

              <Button
                onClick={handleSaveStripeKeys}
                disabled={stripeKeysLoading || !stripeKeys.secretKey || !stripeKeys.publishableKey}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {stripeKeysLoading ? "Enregistrement..." : "Enregistrer les clés Stripe"}
              </Button>

              <div className="p-3 bg-secondary rounded-lg space-y-2">
                <p className="text-xs font-medium text-foreground">💡 Aide rapide</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Vous n'avez pas de compte ? <a href="https://stripe.com/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Créez-en un gratuitement</a></li>
                  <li>Où trouver mes clés ? <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Tableau de bord Stripe &gt; Developers &gt; API keys</a></li>
                  <li>Mode test vs production ? Commencez par le mode test (gratuit, sans frais réels)</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-2 border-t-2 border-foreground/20">
                  <strong>Note de sécurité :</strong> Vos clés Stripe sont stockées de manière sécurisée
                  et ne sont utilisées que pour vos propres transactions. Chaque utilisateur gère ses propres clés.
                </p>
              </div>
            </CardContent>
            )}
          </Card>

        </div>

        {/* Privacy Policy Link */}
        <div className="text-center pt-6 border-t-2 border-foreground/20">
          <Link
            to="/privacy-policy"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </Layout>
  );
}

