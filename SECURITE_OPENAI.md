# Sécurité de la clé API OpenAI

## Protection de la clé API

La clé API OpenAI est **uniquement stockée et utilisée côté serveur** pour garantir la sécurité.

### Configuration sécurisée

1. **Stockage côté serveur uniquement**
   - La clé est stockée dans `.env` sur le serveur
   - Le fichier `.env` est exclu de Git (`.gitignore`)
   - Aucune variable `VITE_` n'est utilisée pour OpenAI

2. **Protection contre l'exposition**
   - Vite est configuré pour refuser l'accès aux fichiers `.env` (`fs.deny` dans `vite.config.ts`)
   - La clé n'est jamais envoyée au client
   - Tous les appels OpenAI se font uniquement via les routes API serveur

3. **Gestion des erreurs**
   - Les erreurs ne révèlent jamais la clé API
   - Les messages d'erreur sont génériques pour éviter l'exposition d'informations sensibles

### Structure sécurisée

```
┌─────────────┐
│   Client    │  ← Ne peut pas accéder à OPENAI_API_KEY
│  (Browser)  │
└──────┬──────┘
       │ Requête HTTP
       │ (sans clé API)
       ▼
┌─────────────┐
│   Serveur   │  ← OPENAI_API_KEY uniquement ici
│  (Express)  │
└──────┬──────┘
       │ Appel API OpenAI
       │ (avec clé sécurisée)
       ▼
┌─────────────┐
│   OpenAI    │
│     API     │
└─────────────┘
```

### Vérification de la sécurité

Pour vérifier que la clé n'est pas exposée :

1. **Dans le code client** : Aucune référence à `OPENAI_API_KEY` ou `process.env.OPENAI`
2. **Dans le bundle** : La clé n'apparaît jamais dans les fichiers JavaScript compilés
3. **Dans les requêtes réseau** : La clé n'est jamais envoyée dans les headers ou le body des requêtes client

### Bonnes pratiques

✅ **À faire** :
- Stocker la clé dans `.env` sur le serveur uniquement
- Utiliser `process.env.OPENAI_API_KEY` côté serveur uniquement
- Vérifier que `.env` est dans `.gitignore`

❌ **À éviter** :
- Ne jamais créer de variable `VITE_OPENAI_API_KEY`
- Ne jamais envoyer la clé dans les requêtes client
- Ne jamais logger la clé complète dans les logs

### En cas de compromission

Si votre clé API est compromise :

1. Révocation immédiate sur https://platform.openai.com/api-keys
2. Génération d'une nouvelle clé
3. Mise à jour du fichier `.env` sur le serveur
4. Redémarrage du serveur

