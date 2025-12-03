# ✅ Vérification de la configuration SQLite

## État actuel

Votre application utilise **SQLite** comme base de données :

- ✅ **Module installé** : `better-sqlite3@11.10.0`
- ✅ **Fichier de base de données** : `data/bartender.db` (existe, 110 KB)
- ✅ **Toutes les routes utilisent SQLite** : products, recipes, sales, auth, etc.

## Tables créées automatiquement

Les tables suivantes sont créées automatiquement dans SQLite :

1. **users** - Utilisateurs (username/password + Firebase)
2. **products** - Produits de l'inventaire
3. **recipes** - Recettes
4. **recipe_ingredients** - Ingrédients des recettes
5. **sales** - Ventes
6. **tabs** - Notes de bar
7. **tab_items** - Articles des notes
8. **stripe_keys** - Clés Stripe

## Vérification

### Au démarrage du serveur

Quand vous démarrez le serveur avec `npm run dev`, vous devriez voir :

```
[SQLite] Database initialized at: .../data/bartender.db
[SQLite] Database type: better-sqlite3 (real SQLite)
[Express] Server loaded successfully
```

**Si vous voyez** `MockDatabase (fallback)` → Le module better-sqlite3 n'est pas chargé correctement.

### Lors d'une connexion Google

Quand vous vous connectez avec Google, vous devriez voir :

```
[Auth] Using SQLite database: ✅ better-sqlite3
[Auth] Firebase sync request received: { uid: '...', email: '...' }
```

### Vérifier les données

Pour vérifier que les données sont bien sauvegardées dans SQLite, vous pouvez :

1. **Créer un produit** dans l'inventaire
2. **Vérifier qu'il apparaît** dans la liste
3. **Redémarrer le serveur**
4. **Vérifier que le produit est toujours là** → Les données sont bien persistées dans SQLite

## Emplacement de la base de données

- **Fichier** : `data/bartender.db`
- **Taille actuelle** : ~110 KB
- **Format** : SQLite 3

## Sauvegarde

Pour sauvegarder votre base de données SQLite :

1. **Copiez le fichier** : `data/bartender.db`
2. **Stockez-le** dans un endroit sûr
3. **Pour restaurer** : Remplacez `data/bartender.db` par votre sauvegarde

## Note importante

SQLite est déjà complètement configuré et utilisé dans votre application. Toutes les données (produits, recettes, ventes, utilisateurs) sont stockées dans le fichier `data/bartender.db`.

Le problème actuel avec la recherche d'images n'est pas lié à SQLite, mais au fait que le serveur Express ne se charge pas correctement, donc l'endpoint `/api/image-search` ne fonctionne pas.

Une fois que le serveur Express fonctionnera correctement, tout fonctionnera : SQLite, la recherche d'images, la synchronisation Firebase, etc.

