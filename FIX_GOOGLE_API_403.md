# 🔧 Corriger l'erreur 403 de l'API Google Custom Search

## Erreur actuelle

```
Google API request 1 failed: 403
"Requests to this API customsearch method google.customsearch.v1.CustomSearchService.List are blocked."
```

## Cause

L'API Google Custom Search n'est pas activée dans Google Cloud Console, ou la clé API n'a pas les bonnes permissions.

## Solution

### Étape 1 : Activer l'API Custom Search

1. **Allez sur Google Cloud Console**
   - [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sélectionnez votre projet (celui lié à votre Firebase)

2. **Activez l'API Custom Search**
   - Menu : **APIs & Services** > **Library** (Bibliothèque)
   - Dans la barre de recherche, tapez : **"Custom Search API"**
   - Cliquez sur **"Custom Search API"**
   - Cliquez sur le bouton **"Enable"** (Activer)
   - Attendez quelques secondes que l'API soit activée

### Étape 2 : Vérifier les restrictions de la clé API

1. **Allez dans les Credentials**
   - Menu : **APIs & Services** > **Credentials**
   - Trouvez votre clé API (celle que vous avez dans `.env`)

2. **Cliquez sur votre clé API** pour l'éditer

3. **Vérifiez les restrictions d'API**
   - Si "API restrictions" est sur **"Restrict key"** :
     - Assurez-vous que **"Custom Search API"** est dans la liste des APIs autorisées
     - Si ce n'est pas le cas, ajoutez-la
   - Si "API restrictions" est sur **"Don't restrict key"** :
     - C'est OK, pas besoin de modifier

4. **Vérifiez les restrictions d'application**
   - Si "Application restrictions" est configuré, assurez-vous que votre domaine/IP est autorisé
   - Pour le développement local, vous pouvez mettre **"None"** temporairement

5. **Sauvegardez** les modifications

### Étape 3 : Attendre la propagation

Les changements peuvent prendre **1-5 minutes** pour être appliqués.

### Étape 4 : Redémarrer le serveur

Après avoir activé l'API et vérifié les restrictions :

1. Arrêtez le serveur (Ctrl+C)
2. Redémarrez : `npm run dev`
3. Réessayez la recherche d'image

## Vérification rapide

Pour vérifier que l'API est activée :

1. Allez sur **APIs & Services** > **Enabled APIs** (APIs activées)
2. Recherchez **"Custom Search API"**
3. Si elle apparaît dans la liste → ✅ Activée
4. Si elle n'apparaît pas → ❌ Pas activée, suivez l'Étape 1

## Erreurs courantes

### "API not enabled"
- **Solution** : Activez l'API Custom Search (Étape 1)

### "API key not valid for this API"
- **Solution** : Vérifiez que la clé API a accès à Custom Search API (Étape 2)

### "Referer restriction"
- **Solution** : Vérifiez les restrictions d'application (Étape 2)

### "Quota exceeded"
- **Solution** : Vous avez atteint la limite de 100 requêtes/jour (gratuit). Attendez demain ou passez à un plan payant.

## Test

Après avoir activé l'API, testez dans la console du navigateur :

```javascript
fetch('https://www.googleapis.com/customsearch/v1?key=VOTRE_CLE&cx=2604700cf916145eb&q=test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Si vous voyez des résultats → ✅ L'API fonctionne
Si vous voyez une erreur 403 → ❌ L'API n'est toujours pas activée ou les restrictions bloquent

## Note importante

- L'API Custom Search doit être activée dans le **même projet Google Cloud** que votre Firebase
- La clé API doit avoir accès à cette API
- Les changements peuvent prendre quelques minutes pour être appliqués

