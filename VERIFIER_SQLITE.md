# ✅ Vérification de SQLite

## Configuration actuelle

Votre application utilise **SQLite** avec `better-sqlite3` :

- ✅ **Module installé** : `better-sqlite3@11.10.0`
- ✅ **Fichier de base de données** : `data/bartender.db` (existe)
- ✅ **Configuration** : `server/database-wrapper.ts`

## Vérification

### 1. Vérifier que SQLite est utilisé

Quand le serveur démarre, vous devriez voir dans les logs :
```
[SQLite] Database initialized at: .../data/bartender.db
[SQLite] Database type: better-sqlite3 (real SQLite)
```

Si vous voyez `MockDatabase (fallback)` → Le module better-sqlite3 n'est pas chargé correctement.

### 2. Vérifier le fichier de base de données

Le fichier SQLite devrait être créé automatiquement dans :
```
data/bartender.db
```

Vous pouvez vérifier qu'il existe et voir sa taille :
```bash
ls -lh data/bartender.db
# ou sur Windows
dir data\bartender.db
```

### 3. Tables créées

Les tables suivantes sont créées automatiquement :
- `users` - Utilisateurs (username/password + Firebase)
- `products` - Produits de l'inventaire
- `recipes` - Recettes
- `recipe_ingredients` - Ingrédients des recettes
- `sales` - Ventes
- `tabs` - Notes de bar
- `tab_items` - Articles des notes
- `stripe_keys` - Clés Stripe

### 4. Tester la base de données

Quand vous vous connectez avec Google, vous devriez voir dans les logs :
```
[Auth] Using SQLite database: ✅ better-sqlite3
```

Si vous voyez `❌ Mock database` → Le serveur Express ne se charge pas correctement.

## Problèmes possibles

### Problème 1 : Mock database au lieu de SQLite

**Symptôme** : Vous voyez `[MOCK DB]` dans les logs

**Solution** :
1. Vérifiez que `better-sqlite3` est installé : `npm list better-sqlite3`
2. Réinstallez si nécessaire : `npm install better-sqlite3`
3. Redémarrez le serveur

### Problème 2 : Base de données non créée

**Symptôme** : Le fichier `data/bartender.db` n'existe pas

**Solution** :
1. Le fichier est créé automatiquement au premier démarrage
2. Vérifiez que le dossier `data/` existe
3. Vérifiez les permissions d'écriture

### Problème 3 : Erreurs SQLite

**Symptôme** : Erreurs dans les logs liées à SQLite

**Solution** :
1. Vérifiez que le fichier `data/bartender.db` n'est pas corrompu
2. Supprimez-le et laissez-le être recréé (⚠️ vous perdrez les données)
3. Vérifiez les permissions du fichier

## Vérification rapide

Pour vérifier que SQLite fonctionne, regardez les logs du serveur au démarrage :

**Logs attendus** :
```
[SQLite] Database initialized at: .../data/bartender.db
[SQLite] Database type: better-sqlite3 (real SQLite)
[Express] Server loaded successfully
```

**Si vous voyez** :
```
[MOCK DB] Initialized at ...
```
→ Le module better-sqlite3 n'est pas chargé, utilisez la solution du Problème 1.

## Note importante

SQLite est déjà configuré et utilisé dans votre application. Le problème actuel est que **le serveur Express ne se charge pas**, donc la base de données SQLite n'est jamais initialisée.

Une fois que le serveur Express fonctionnera correctement, SQLite fonctionnera aussi automatiquement.

