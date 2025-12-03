# Guide SQLite pour l'Application Web Bartender

## 📋 Vue d'ensemble

L'application utilise maintenant **SQLite** côté serveur (Node.js) au lieu de `localStorage` côté client. Cela offre :
- ✅ Persistance des données sur le serveur
- ✅ Meilleure performance pour les grandes quantités de données
- ✅ Requêtes SQL puissantes
- ✅ Intégrité référentielle avec clés étrangères
- ✅ Backup et export faciles

## 🗄️ Structure de la Base de Données

### Tables créées automatiquement :

1. **products** - Produits de l'inventaire
2. **recipes** - Recettes/cocktails créés
3. **recipe_ingredients** - Ingrédients des recettes
4. **sales** - Historique des ventes
5. **tabs** - Comptes ouverts
6. **tab_items** - Articles dans les comptes

## 📍 Emplacement de la Base de Données

La base de données SQLite est créée dans :
```
data/bartender.db
```

Ce dossier est automatiquement créé au démarrage du serveur.

## 🔌 API Endpoints

### Produits

- `GET /api/products` - Récupérer tous les produits
- `GET /api/products/:id` - Récupérer un produit par ID
- `POST /api/products` - Créer un nouveau produit
- `PUT /api/products/:id` - Mettre à jour un produit
- `DELETE /api/products/:id` - Supprimer un produit
- `PATCH /api/products/:id/quantity` - Mettre à jour uniquement la quantité

### Recettes

- `GET /api/recipes` - Récupérer toutes les recettes
- `GET /api/recipes/:id` - Récupérer une recette par ID
- `POST /api/recipes` - Créer une nouvelle recette
- `PUT /api/recipes/:id` - Mettre à jour une recette
- `DELETE /api/recipes/:id` - Supprimer une recette

### Migration

- `POST /api/migrate` - Migrer les données de localStorage vers SQLite

## 💻 Utilisation dans le Code Client

### Exemple : Remplacer localStorage par l'API

**Avant (localStorage) :**
```typescript
const products = JSON.parse(localStorage.getItem("inventory-products") || "[]");
localStorage.setItem("inventory-products", JSON.stringify(products));
```

**Après (API SQLite) :**
```typescript
import { productsApi } from "@/services/api";

// Récupérer les produits
const products = await productsApi.getAll();

// Créer un produit
const newProduct = await productsApi.create({
  name: "Vodka",
  category: "spirits",
  price: 24.99,
  quantity: 10,
  unit: "bottles",
});

// Mettre à jour un produit
await productsApi.update(productId, { quantity: 15 });

// Supprimer un produit
await productsApi.delete(productId);
```

## 🔄 Migration des Données Existantes

Pour migrer les données de localStorage vers SQLite :

```typescript
// Dans votre composant
const migrateData = async () => {
  const products = JSON.parse(localStorage.getItem("inventory-products") || "[]");
  const recipes = JSON.parse(localStorage.getItem("sales-recipes") || "[]");
  
  await fetch("/api/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products, recipes }),
  });
  
  // Optionnel : vider localStorage après migration
  localStorage.removeItem("inventory-products");
  localStorage.removeItem("sales-recipes");
};
```

## 🛠️ Maintenance

### Backup de la Base de Données

La base de données se trouve dans `data/bartender.db`. Pour faire un backup :

```bash
cp data/bartender.db data/bartender-backup-$(date +%Y%m%d).db
```

### Réinitialiser la Base de Données

Supprimez simplement le fichier :
```bash
rm data/bartender.db
```

La base sera recréée automatiquement au prochain démarrage.

### Voir le Contenu de la Base

Vous pouvez utiliser un outil comme [DB Browser for SQLite](https://sqlitebrowser.org/) pour ouvrir et inspecter `data/bartender.db`.

## 📊 Requêtes SQL Utiles

### Statistiques

```sql
-- Valeur totale de l'inventaire
SELECT SUM(price * quantity) as total_value FROM products;

-- Nombre de produits par catégorie
SELECT category, COUNT(*) as count FROM products GROUP BY category;

-- Produits en stock faible
SELECT * FROM products WHERE quantity < 5;

-- Recettes avec le plus d'ingrédients
SELECT r.name, COUNT(ri.id) as ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipeId
GROUP BY r.id
ORDER BY ingredient_count DESC;
```

## 🔒 Sécurité

- La base de données est locale au serveur (pas accessible depuis le client)
- Toutes les opérations passent par l'API Express
- Les clés étrangères garantissent l'intégrité des données
- Les transactions assurent la cohérence des données

## 🚀 Prochaines Étapes

1. **Migrer les pages existantes** : Remplacer localStorage par les appels API
2. **Ajouter la gestion des ventes** : Utiliser la table `sales` pour l'historique
3. **Ajouter la gestion des comptes** : Utiliser les tables `tabs` et `tab_items`
4. **Optimiser les requêtes** : Ajouter des index pour les recherches fréquentes

