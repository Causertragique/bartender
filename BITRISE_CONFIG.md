# Configuration Bitrise pour La Réserve

## 📱 Application iOS

Cette application utilise Bitrise.io pour le déploiement sur l'App Store.

### Configuration requise

1. **Base de données SQLite** : L'app iOS utilise `SQLite.swift` (voir `ios/DatabaseManager.swift`)
2. **Backend Web** : L'application web React utilise `better-sqlite3` côté serveur

### Build iOS

Le projet iOS est dans le dossier `ios/` et utilise :
- Swift
- SQLite.swift pour la base de données locale
- Architecture décrite dans `SQLITE_ARCHITECTURE.md`

### Build Web/Backend

Pour le build de production du backend :

```bash
pnpm build
```

Le serveur sera compilé dans `dist/server/` avec `better-sqlite3` externalisé (non bundlé).

### Notes importantes

- `better-sqlite3` nécessite une compilation native
- Sur Bitrise, Python et les outils de build sont disponibles
- Le module sera compilé automatiquement lors de l'installation des dépendances
- Pour le développement local sur Windows, utilisez `pnpm dev` (le serveur fonctionne en mode dev sans build)

### Variables d'environnement Bitrise

Assurez-vous d'avoir configuré :
- Variables nécessaires pour l'API (si applicable)
- Clés de signature iOS
- Certificats de distribution

