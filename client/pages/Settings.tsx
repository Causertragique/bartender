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
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Bell,
  Package,
  Palette,
  User,
  Save,
  Upload,
  Download,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { Product } from "@/components/ProductCard";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  // Tax rates by region
  const taxRatesByRegion: Record<string, number> = {
    // Canada
    "quebec": 0.14975, // TPS 5% + TVQ 9.975%
    "ontario": 0.13, // HST 13%
    "british-columbia": 0.12, // GST 5% + PST 7%
    "alberta": 0.05, // GST 5%
    "manitoba": 0.12, // GST 5% + PST 7%
    "saskatchewan": 0.11, // GST 5% + PST 6%
    "nova-scotia": 0.15, // HST 15%
    "new-brunswick": 0.15, // HST 15%
    "newfoundland": 0.15, // HST 15%
    "prince-edward-island": 0.15, // HST 15%
    "northwest-territories": 0.05, // GST 5%
    "nunavut": 0.05, // GST 5%
    "yukon": 0.05, // GST 5%
    // United States (examples - varies by state)
    "california": 0.0725,
    "new-york": 0.08,
    "texas": 0.0625,
    "florida": 0.06,
    "illinois": 0.0625,
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
    emailNotifications: false,
    salesReports: true,
    weeklySummary: true,

    // Inventory
    lowStockThreshold: 5,
    autoReorder: false,
    reorderQuantity: 10,
  });

  // API Keys for image search
  // Priority: .env file > localStorage
  const [apiKeys, setApiKeys] = useState({
    googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('google_api_key') || '',
    googleCx: import.meta.env.VITE_GOOGLE_CX || localStorage.getItem('google_cx') || '2604700cf916145eb', // Default CX from user
  });

  // Check if keys are from .env file
  const hasEnvKeys = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GOOGLE_CX;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
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

  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings:", settings);
    // You can add toast notification here
  };

  const handleApiKeySave = () => {
    // Save API keys to localStorage
    if (apiKeys.googleApiKey) {
      localStorage.setItem('google_api_key', apiKeys.googleApiKey);
    }
    if (apiKeys.googleCx) {
      localStorage.setItem('google_cx', apiKeys.googleCx);
    }
    alert("Clés API sauvegardées avec succès !");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
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

  const processImportedProducts = (products: any[]) => {
    // Map the imported data to your product structure
    // This is a basic mapping - you may need to adjust based on your CSV/Excel structure
    const mappedProducts = products.map((product: any, index: number) => ({
      id: product.id || `imported-${Date.now()}-${index}`,
      name: product.name || product.Nom || product["Product Name"] || "",
      category: mapCategory(product.category || product.Catégorie || product.Category || ""),
      price: parseFloat(product.price || product.Prix || product["Price"] || 0),
      quantity: parseInt(product.quantity || product.Quantité || product.Quantity || 0),
      unit: product.unit || product.Unité || product.Unit || "bottles",
      lastRestocked: product.lastRestocked || product["Last Restocked"] || new Date().toISOString().split("T")[0],
    })).filter((p: any) => p.name && p.name.trim() !== "");

    // Store in localStorage or send to server
    // For now, we'll just log it
    console.log("Imported products:", mappedProducts);
    
    // You can dispatch to a global state or call an API here
    // For example: dispatch({ type: "ADD_PRODUCTS", payload: mappedProducts });
    
    alert(`${t.settings.import.importSuccess} ${mappedProducts.length} ${t.settings.import.productsImported}.`);
    setIsImporting(false);
    setImportFile(null);
    
    // Reset file input
    const fileInput = document.getElementById("import-file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const mapCategory = (category: string): "spirits" | "liquor" | "beer" | "snacks" => {
    const lower = category.toLowerCase();
    if (lower.includes("spirit") || lower.includes("spiritueux")) return "spirits";
    if (lower.includes("beer") || lower.includes("bière")) return "beer";
    if (lower.includes("wine") || lower.includes("vin") || lower.includes("liquor")) return "liquor";
    return "snacks";
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
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-8 w-8" />
              {t.settings.title}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t.settings.subtitle}
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {t.settings.saveChanges}
          </Button>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.settings.general.title}
              </CardTitle>
              <CardDescription>
                {t.settings.general.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barName">{t.settings.general.barName}</Label>
                  <Input
                    id="barName"
                    value={settings.barName}
                    onChange={(e) => handleInputChange("barName", e.target.value)}
                    placeholder={t.settings.general.barName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.general.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.settings.general.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t.settings.general.address}</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <div className="space-y-2">
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRegion">{t.settings.general.taxRegion}</Label>
                  <Select
                    value={settings.taxRegion}
                    onValueChange={(value) => handleInputChange("taxRegion", value)}
                  >
                    <SelectTrigger id="taxRegion">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quebec">{t.settings.general.taxRegions.quebec}</SelectItem>
                      <SelectItem value="ontario">{t.settings.general.taxRegions.ontario}</SelectItem>
                      <SelectItem value="british-columbia">{t.settings.general.taxRegions["british-columbia"]}</SelectItem>
                      <SelectItem value="alberta">{t.settings.general.taxRegions.alberta}</SelectItem>
                      <SelectItem value="manitoba">{t.settings.general.taxRegions.manitoba}</SelectItem>
                      <SelectItem value="saskatchewan">{t.settings.general.taxRegions.saskatchewan}</SelectItem>
                      <SelectItem value="nova-scotia">{t.settings.general.taxRegions["nova-scotia"]}</SelectItem>
                      <SelectItem value="new-brunswick">{t.settings.general.taxRegions["new-brunswick"]}</SelectItem>
                      <SelectItem value="newfoundland">{t.settings.general.taxRegions.newfoundland}</SelectItem>
                      <SelectItem value="prince-edward-island">{t.settings.general.taxRegions["prince-edward-island"]}</SelectItem>
                      <SelectItem value="northwest-territories">{t.settings.general.taxRegions["northwest-territories"]}</SelectItem>
                      <SelectItem value="nunavut">{t.settings.general.taxRegions.nunavut}</SelectItem>
                      <SelectItem value="yukon">{t.settings.general.taxRegions.yukon}</SelectItem>
                      <SelectItem value="california">{t.settings.general.taxRegions.california}</SelectItem>
                      <SelectItem value="new-york">{t.settings.general.taxRegions["new-york"]}</SelectItem>
                      <SelectItem value="texas">{t.settings.general.taxRegions.texas}</SelectItem>
                      <SelectItem value="florida">{t.settings.general.taxRegions.florida}</SelectItem>
                      <SelectItem value="illinois">{t.settings.general.taxRegions.illinois}</SelectItem>
                      <SelectItem value="france">{t.settings.general.taxRegions.france}</SelectItem>
                      <SelectItem value="spain">{t.settings.general.taxRegions.spain}</SelectItem>
                      <SelectItem value="germany">{t.settings.general.taxRegions.germany}</SelectItem>
                      <SelectItem value="italy">{t.settings.general.taxRegions.italy}</SelectItem>
                      <SelectItem value="uk">{t.settings.general.taxRegions.uk}</SelectItem>
                      <SelectItem value="belgium">{t.settings.general.taxRegions.belgium}</SelectItem>
                      <SelectItem value="netherlands">{t.settings.general.taxRegions.netherlands}</SelectItem>
                      <SelectItem value="portugal">{t.settings.general.taxRegions.portugal}</SelectItem>
                      <SelectItem value="sweden">{t.settings.general.taxRegions.sweden}</SelectItem>
                      <SelectItem value="denmark">{t.settings.general.taxRegions.denmark}</SelectItem>
                      <SelectItem value="poland">{t.settings.general.taxRegions.poland}</SelectItem>
                      <SelectItem value="australia">{t.settings.general.taxRegions.australia}</SelectItem>
                      <SelectItem value="new-zealand">{t.settings.general.taxRegions["new-zealand"]}</SelectItem>
                      <SelectItem value="switzerland">{t.settings.general.taxRegions.switzerland}</SelectItem>
                      <SelectItem value="custom">{t.settings.general.taxRegions.custom}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
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
          </Card>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.settings.notifications.title}
              </CardTitle>
              <CardDescription>
                {t.settings.notifications.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="lowStockAlerts">{t.settings.notifications.lowStockAlerts}</Label>
                  <p className="text-sm text-muted-foreground">
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
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">{t.settings.notifications.emailNotifications}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.notifications.emailNotificationsDesc}
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailNotifications", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="salesReports">{t.settings.notifications.salesReports}</Label>
                  <p className="text-sm text-muted-foreground">
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
                <div className="space-y-0.5">
                  <Label htmlFor="weeklySummary">{t.settings.notifications.weeklySummary}</Label>
                  <p className="text-sm text-muted-foreground">
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
          </Card>

          {/* Inventory Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t.settings.inventory.title}
              </CardTitle>
              <CardDescription>
                {t.settings.inventory.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">{t.settings.inventory.lowStockThreshold}</Label>
                <p className="text-sm text-muted-foreground">
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
                <div className="space-y-0.5">
                  <Label htmlFor="autoReorder">{t.settings.inventory.autoReorder}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.inventory.autoReorderDesc}
                  </p>
                </div>
                <Switch
                  id="autoReorder"
                  checked={settings.autoReorder}
                  onCheckedChange={(checked) =>
                    handleInputChange("autoReorder", checked)
                  }
                />
              </div>
              {settings.autoReorder && (
                <div className="space-y-2">
                  <Label htmlFor="reorderQuantity">{t.settings.inventory.reorderQuantity}</Label>
                  <Input
                    id="reorderQuantity"
                    type="number"
                    min="1"
                    value={settings.reorderQuantity}
                    onChange={(e) =>
                      handleInputChange(
                        "reorderQuantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Inventory Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t.settings.import.title}
              </CardTitle>
              <CardDescription>
                {t.settings.import.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                className="w-full gap-2 border-border bg-background text-black dark:text-white hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? t.settings.import.processing : t.settings.import.importInventory}
              </Button>
              <Separator />
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
                  className="w-full sm:flex-1 gap-2 border-border bg-background text-black dark:text-white hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4" />
                  {t.settings.export.exportAsCSV}
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="w-full sm:flex-1 gap-2 border-border bg-background text-black dark:text-white hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4" />
                  {t.settings.export.exportAsExcel}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Clés API - Recherche d'images
              </CardTitle>
              <CardDescription>
                Configurez les clés API pour activer la recherche automatique d'images de produits
                {hasEnvKeys && (
                  <span className="block mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ Les clés du fichier .env sont actives (priorité sur localStorage)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleApiKey">
                    Google API Key
                    <span className="text-xs text-muted-foreground ml-2">(Requis pour Google Images)</span>
                    {import.meta.env.VITE_GOOGLE_API_KEY && (
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">(depuis .env)</span>
                    )}
                  </Label>
                  <Input
                    id="googleApiKey"
                    type="password"
                    value={apiKeys.googleApiKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, googleApiKey: e.target.value })}
                    placeholder="AIza..."
                    disabled={!!import.meta.env.VITE_GOOGLE_API_KEY}
                    className={import.meta.env.VITE_GOOGLE_API_KEY ? "bg-muted cursor-not-allowed" : ""}
                  />
                  {import.meta.env.VITE_GOOGLE_API_KEY ? (
                    <p className="text-xs text-muted-foreground">
                      La clé est définie dans le fichier .env et a la priorité. Modifiez le fichier .env pour changer cette valeur.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Obtenez votre clé sur{" "}
                      <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Google Cloud Console
                      </a>
                      {" "}ou ajoutez-la dans le fichier .env
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleCx">
                    Google Search Engine ID (CX)
                    {import.meta.env.VITE_GOOGLE_CX && (
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">(depuis .env)</span>
                    )}
                  </Label>
                  <Input
                    id="googleCx"
                    value={apiKeys.googleCx}
                    onChange={(e) => setApiKeys({ ...apiKeys, googleCx: e.target.value })}
                    placeholder="2604700cf916145eb"
                    disabled={!!import.meta.env.VITE_GOOGLE_CX}
                    className={import.meta.env.VITE_GOOGLE_CX ? "bg-muted cursor-not-allowed" : ""}
                  />
                  {import.meta.env.VITE_GOOGLE_CX ? (
                    <p className="text-xs text-muted-foreground">
                      Le CX est défini dans le fichier .env. Modifiez le fichier .env pour changer cette valeur.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Votre CX par défaut : <code className="bg-secondary px-1 rounded">2604700cf916145eb</code>
                    </p>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleApiKeySave} 
                className="w-full gap-2"
                disabled={hasEnvKeys}
                title={hasEnvKeys ? "Les clés du .env ont la priorité. Modifiez le fichier .env pour changer les valeurs." : ""}
              >
                <Save className="h-4 w-4" />
                {hasEnvKeys ? "Clés dans .env (modifiez le fichier .env)" : "Sauvegarder les clés API"}
              </Button>
              {hasEnvKeys && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Les clés du fichier .env sont actives. Pour modifier, éditez le fichier .env à la racine du projet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t.settings.appearance.title}
              </CardTitle>
              <CardDescription>
                {t.settings.appearance.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

