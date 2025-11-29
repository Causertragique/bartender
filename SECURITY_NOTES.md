# Notes de Sécurité

## Vulnérabilités connues

### xlsx (Prototype Pollution & ReDoS)

**Statut :** Vulnérabilité connue, pas de correctif disponible actuellement

**Risque :** Faible pour cette application
- L'application utilise `xlsx` uniquement pour l'import/export d'inventaire
- Les fichiers sont importés par l'utilisateur lui-même (source fiable)
- Pas d'exposition publique de l'API d'import

**Recommandations :**
1. Surveiller les mises à jour de `xlsx` pour une version corrigée
2. Valider les fichiers importés avant traitement
3. Limiter la taille des fichiers importés

**Alternative future :** Considérer `exceljs` ou `node-xlsx` si des correctifs ne sont pas disponibles

## better-sqlite3

**Compilation native requise :** Oui (nécessite Python et outils de build)

**Pour le développement local :**
- Un wrapper mock est disponible si `better-sqlite3` n'est pas installé
- Les données ne seront pas persistées en mode mock

**Pour la production (Bitrise) :**
- Python est disponible automatiquement
- `better-sqlite3` sera compilé lors de `npm install`

