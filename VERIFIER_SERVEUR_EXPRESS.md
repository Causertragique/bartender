# 🔍 Vérifier que le serveur Express fonctionne

## Problème actuel

Les endpoints `/api/*` retournent du HTML (`<!doctype...`) au lieu de JSON, ce qui cause l'erreur :
```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

Cela signifie que **le serveur Express ne se charge pas ou ne fonctionne pas correctement**.

## Diagnostic rapide

### Étape 1 : Vérifier les logs au démarrage

Quand vous démarrez le serveur avec `npm run dev`, vous devriez voir dans le terminal :

```
[Express] Server loaded successfully
```

**Si vous ne voyez PAS ce message** → Le serveur Express ne se charge pas.

### Étape 2 : Tester manuellement une route API

Ouvrez votre navigateur et allez sur :
```
http://localhost:8080/api/ping
```

**Résultat attendu** :
```json
{"message":"ping"}
```

**Si vous voyez du HTML à la place** → Le problème est confirmé.

### Étape 3 : Vérifier les logs lors d'une requête

Quand vous faites une recherche d'image, regardez les logs dans le **terminal** (pas la console du navigateur) :

Vous devriez voir :
```
[Vite] Intercepting API request: POST /api/image-search
[Express] POST /api/image-search
[ImageSearch] Request received: { productName: '...' }
```

**Si vous ne voyez AUCUN de ces logs** → Les routes ne sont pas interceptées.

## Solutions

### Solution 1 : Redémarrer le serveur

1. **Arrêtez complètement le serveur** (Ctrl+C)
2. **Attendez 2-3 secondes**
3. **Redémarrez** : `npm run dev`
4. **Vérifiez les logs** au démarrage

### Solution 2 : Vérifier les erreurs de compilation

Si le serveur Express ne se charge pas, il y a peut-être une erreur de compilation TypeScript.

Regardez les **erreurs dans le terminal** au démarrage. Les erreurs courantes :
- Modules manquants
- Erreurs de syntaxe TypeScript
- Problèmes d'import

### Solution 3 : Vérifier que le serveur démarre sur le bon port

Le serveur devrait démarrer sur le port **8080**. Vérifiez dans les logs :
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

### Solution 4 : Vérifier les dépendances

Assurez-vous que toutes les dépendances sont installées :
```bash
npm install
```

### Solution 5 : Vérifier le fichier .env

Assurez-vous que le fichier `.env` existe (même s'il est vide) :
```bash
# Créer un fichier .env vide si nécessaire
touch .env
```

## Test de diagnostic

Pour tester si Express fonctionne, exécutez dans la console du navigateur (F12) :

```javascript
// Test 1 : Ping endpoint
fetch('/api/ping')
  .then(r => r.text())
  .then(text => {
    console.log('Response:', text);
    if (text.startsWith('<!doctype')) {
      console.error('❌ PROBLÈME : Reçoit du HTML au lieu de JSON');
      console.error('Le serveur Express ne fonctionne pas');
    } else {
      console.log('✅ OK : Reçoit du JSON');
    }
  })
  .catch(console.error);

// Test 2 : Image search endpoint
fetch('/api/image-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productName: 'test' })
})
  .then(r => r.text())
  .then(text => {
    console.log('Response:', text.substring(0, 100));
    if (text.startsWith('<!doctype')) {
      console.error('❌ PROBLÈME : Reçoit du HTML au lieu de JSON');
    } else {
      console.log('✅ OK : Reçoit du JSON');
    }
  })
  .catch(console.error);
```

## Logs à surveiller

### Au démarrage du serveur :
- ✅ `[Express] Server loaded successfully` → Tout va bien
- ❌ `[Express] Failed to load server:` → Erreur de chargement
- ❌ Aucun message Express → Le serveur ne se charge pas

### Lors d'une requête API :
- ✅ `[Vite] Intercepting API request:` → La requête est interceptée
- ✅ `[Express] POST /api/...` → Express reçoit la requête
- ❌ Aucun log → La requête n'est pas interceptée

## Si le problème persiste

1. **Partagez les logs complets** du terminal au démarrage
2. **Partagez les logs** quand vous faites une requête API
3. **Vérifiez** qu'il n'y a pas d'erreurs de compilation TypeScript
4. **Vérifiez** que le port 8080 n'est pas déjà utilisé par un autre processus

## Note importante

Le problème vient du fait que **Vite sert le fichier HTML du SPA** pour toutes les routes qui ne sont pas interceptées par Express. C'est normal pour les routes frontend, mais les routes `/api/*` doivent être interceptées par Express avant que Vite ne serve le HTML.

