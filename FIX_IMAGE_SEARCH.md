# 🔍 Diagnostic et correction de la recherche d'images

## Configuration actuelle

- **ID du moteur de recherche** : `2604700cf916145eb`
- **URL publique** : https://cse.google.com/cse?cx=2604700cf916145eb
- **Valeur par défaut** : Cet ID est utilisé automatiquement si `GOOGLE_CX` n'est pas défini dans `.env`

## Problème

La recherche d'images dans l'ajout de produit ne fonctionne pas.

## Causes possibles

### 1. Clés API Google non configurées

La recherche d'images nécessite des clés API Google :
- `GOOGLE_API_KEY` : Votre clé API Google
- `GOOGLE_CX` : Votre Custom Search Engine ID (optionnel, une valeur par défaut est utilisée)

### 2. API Custom Search non activée

L'API Google Custom Search doit être activée dans Google Cloud Console.

## Solution

### Étape 1 : Vérifier les variables d'environnement

Vérifiez que votre fichier `.env` contient :

```env
GOOGLE_API_KEY=votre-clé-api-google
GOOGLE_CX=2604700cf916145eb
```

**Note** : `GOOGLE_CX` est optionnel. Si non défini, la valeur par défaut `2604700cf916145eb` sera utilisée automatiquement.

### Étape 2 : Obtenir une clé API Google

1. **Allez sur Google Cloud Console**
   - [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sélectionnez votre projet (ou créez-en un nouveau)

2. **Activez l'API Custom Search**
   - Menu : **APIs & Services** > **Library**
   - Recherchez "Custom Search API"
   - Cliquez sur "Custom Search API"
   - Cliquez sur **"Enable"** (Activer)

3. **Créez une clé API**
   - Menu : **APIs & Services** > **Credentials**
   - Cliquez sur **"Create Credentials"** > **"API Key"**
   - Copiez la clé API générée

4. **Créez un Custom Search Engine (optionnel mais recommandé)**
   - Allez sur [https://programmablesearchengine.google.com/](https://programmablesearchengine.google.com/)
   - Cliquez sur **"Add"** pour créer un nouveau moteur de recherche
   - Entrez un nom (ex: "Bartender Product Search")
   - Dans "Sites to search", entrez : `saq.com`
   - Cliquez sur **"Create"**
   - Cliquez sur **"Control Panel"** pour votre moteur
   - Copiez le **"Search engine ID"** (CX)

### Étape 3 : Configurer les variables d'environnement

Ajoutez les clés dans votre fichier `.env` :

```env
GOOGLE_API_KEY=AIzaSy...votre-clé-api...
GOOGLE_CX=2604700cf916145eb
```

**Note** : `GOOGLE_CX` est optionnel car `2604700cf916145eb` est déjà la valeur par défaut dans le code.

**Important** : Redémarrez le serveur après avoir ajouté/modifié le fichier `.env` !

### Étape 4 : Vérifier dans la console

1. Ouvrez la console du navigateur (F12)
2. Cliquez sur "Rechercher image" dans le formulaire d'ajout de produit
3. Regardez les messages dans la console :
   - Si vous voyez "Image search response:" → L'API fonctionne
   - Si vous voyez "Google API key not configured" → Les clés ne sont pas configurées
   - Si vous voyez une erreur 403 → L'API n'est pas activée ou la clé est invalide
   - Si vous voyez une erreur 429 → Limite de requêtes dépassée

## Erreurs courantes

### "Clé API Google non configurée"
- **Solution** : Ajoutez `GOOGLE_API_KEY` dans votre fichier `.env`
- Redémarrez le serveur

### "Accès refusé" (403)
- **Solution** : 
  1. Vérifiez que l'API Custom Search est activée dans Google Cloud Console
  2. Vérifiez que votre clé API est correcte
  3. Vérifiez les restrictions de votre clé API (elle doit permettre l'API Custom Search)

### "Limite de requêtes dépassée" (429)
- **Solution** : Attendez quelques minutes et réessayez
- La version gratuite de Google Custom Search API limite à 100 requêtes/jour

### "No images found"
- **Solution** : 
  - C'est normal si aucun produit correspondant n'est trouvé sur SAQ.com
  - Essayez avec un nom de produit plus spécifique
  - Vous pouvez toujours entrer l'URL de l'image manuellement

## Test rapide

Pour tester si l'API fonctionne, ouvrez la console du navigateur et regardez les logs après avoir cliqué sur "Rechercher image". Vous devriez voir :

```
Searching for products on SAQ.com: [nom du produit]
Fetching product pages from Google API...
Found X images from API
```

## Vérification de la configuration

Pour vérifier que les clés sont bien chargées côté serveur, regardez les logs du serveur. Vous ne devriez pas voir d'erreur "Clé API Google non configurée".

## Note importante

- Les clés API doivent être dans le fichier `.env` à la racine du projet
- Le serveur doit être redémarré après avoir modifié `.env`
- Ne partagez jamais vos clés API publiquement (elles ne doivent pas être dans Git)

