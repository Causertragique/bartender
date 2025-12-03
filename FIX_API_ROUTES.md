# 🔧 Correction des routes API qui retournent du HTML

## Problème

Les endpoints `/api/*` retournent du HTML (`<!doctype...`) au lieu de JSON, ce qui cause l'erreur :
```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

## Causes possibles

1. **Le serveur Express ne se charge pas** - Les routes `/api/*` ne sont pas interceptées
2. **Les routes ne sont pas enregistrées** - Les endpoints n'existent pas dans Express
3. **Le middleware Vite intercepte avant Express** - L'ordre des middlewares est incorrect

## Solution

### Étape 1 : Vérifier les logs du serveur

Quand vous démarrez le serveur avec `npm run dev`, vous devriez voir :
```
[Express] Server loaded successfully
```

Si vous ne voyez pas ce message, le serveur Express ne se charge pas.

### Étape 2 : Vérifier les logs lors d'une requête API

Quand vous faites une requête API (par exemple, connexion Google), vous devriez voir dans le terminal :
```
[Vite] Intercepting API request: POST /api/auth/firebase-sync
[Express] POST /api/auth/firebase-sync
[Auth] Firebase sync request received: { uid: '...', email: '...' }
```

Si vous ne voyez pas ces logs, les routes ne sont pas interceptées.

### Étape 3 : Vérifier que le serveur démarre correctement

1. Arrêtez le serveur (Ctrl+C)
2. Redémarrez-le : `npm run dev`
3. Regardez les logs au démarrage
4. Essayez de vous connecter avec Google
5. Regardez les logs dans le terminal

### Étape 4 : Tester manuellement une route API

Ouvrez votre navigateur et allez sur :
```
http://localhost:8080/api/ping
```

Vous devriez voir :
```json
{"message":"ping"}
```

Si vous voyez du HTML à la place, le problème est confirmé.

## Solutions

### Solution 1 : Redémarrer le serveur

Parfois, le serveur ne se charge pas correctement au premier démarrage :
1. Arrêtez le serveur (Ctrl+C)
2. Attendez quelques secondes
3. Redémarrez : `npm run dev`
4. Vérifiez les logs

### Solution 2 : Vérifier les dépendances

Assurez-vous que toutes les dépendances sont installées :
```bash
npm install
```

### Solution 3 : Vérifier les erreurs de compilation

Si le serveur Express ne peut pas se charger, il y a peut-être une erreur de compilation. Regardez les erreurs dans le terminal au démarrage.

### Solution 4 : Vérifier le fichier .env

Assurez-vous que le fichier `.env` existe et contient les variables nécessaires (même si elles sont vides).

## Logs à surveiller

### Au démarrage :
- ✅ `[Express] Server loaded successfully` → Tout va bien
- ❌ `[Express] Failed to load server:` → Erreur de chargement

### Lors d'une requête API :
- ✅ `[Vite] Intercepting API request:` → La requête est interceptée
- ✅ `[Express] POST /api/...` → Express reçoit la requête
- ❌ Aucun log → La requête n'est pas interceptée

## Test rapide

Pour tester si les routes API fonctionnent :

1. Ouvrez la console du navigateur (F12)
2. Exécutez :
```javascript
fetch('/api/ping')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Vous devriez voir `{message: "ping"}`. Si vous voyez une erreur ou du HTML, le problème est confirmé.

## Si le problème persiste

1. Partagez les logs complets du terminal au démarrage
2. Partagez les logs quand vous essayez de vous connecter
3. Vérifiez qu'il n'y a pas d'erreurs de compilation TypeScript

