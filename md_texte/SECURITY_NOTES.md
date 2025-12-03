# Notes de Sécurité

## Vulnérabilités connues

### xlsx (Prototype Pollution & ReDoS) - ✅ RÉSOLU

**Statut :** ✅ **MIGRÉ VERS exceljs** (2024)

**Action prise :**
- Remplacement de `xlsx` par `exceljs` (version 4.4.0+)
- `exceljs` est une alternative plus sûre et mieux maintenue
- Aucune vulnérabilité connue dans `exceljs`
- Code mis à jour dans `client/pages/Settings.tsx`

**Avantages de exceljs :**
- ✅ Pas de vulnérabilités de sécurité connues
- ✅ Meilleure maintenance et support actif
- ✅ API plus moderne et type-safe
- ✅ Meilleures performances pour les gros fichiers
- ✅ Support TypeScript natif

**Ancien package :** `xlsx@^0.18.5` (retiré)
**Nouveau package :** `exceljs@^4.4.0`

## better-sqlite3

**Compilation native requise :** Oui (nécessite Python et outils de build)

**Pour le développement local :**
- Un wrapper mock est disponible si `better-sqlite3` n'est pas installé
- Les données ne seront pas persistées en mode mock

**Pour la production (Bitrise) :**
- Python est disponible automatiquement
- `better-sqlite3` sera compilé lors de `npm install`

