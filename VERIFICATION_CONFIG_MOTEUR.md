# ✅ Vérification de la configuration du moteur de recherche

## Configuration actuelle de votre moteur

D'après le XML que vous avez partagé :

- ✅ **ID du moteur** : `2604700cf916145eb` (déjà configuré dans le code)
- ✅ **Site de recherche** : `https://www.saq.com/fr/produits` (www.saq.com)
- ✅ **Recherche d'images activée** : `<ImageSearchSettings enable="true"/>`
- ✅ **Nom du moteur** : "La reserve"
- ✅ **Clé API visible** : `AIzaSyBEQu66qeZCYGHZWoAkXnyeB2JI5BYobWY` (paid_element_key)

## Points importants

### 1. Clé API

La clé API dans le XML (`paid_element_key`) est probablement différente de celle que vous devez utiliser dans votre code. 

**Important** : Utilisez votre **clé API principale** (celle que vous avez créée dans Google Cloud Console > Credentials), pas celle du `paid_element_key`.

### 2. Configuration du site

Votre moteur est configuré pour rechercher sur `www.saq.com`, ce qui est parfait. Le code a été mis à jour pour accepter `www.saq.com` en plus de `saq.com`.

### 3. Recherche d'images

La recherche d'images est activée dans votre moteur, donc ça devrait fonctionner une fois que l'API Custom Search sera activée.

## Vérification

### Vérifier que votre clé API fonctionne

1. **Votre clé API dans `.env`** doit être celle créée dans Google Cloud Console
2. **Pas celle du `paid_element_key`** dans le XML (celle-ci est pour les éléments payants)

### Vérifier que l'API est activée

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Enabled APIs**
3. Vérifiez que **"Custom Search API"** est dans la liste
4. Si ce n'est pas le cas, activez-la (voir `FIX_GOOGLE_API_403.md`)

## Configuration recommandée dans `.env`

```env
# Clé API principale (pas celle du paid_element_key)
VITE_GOOGLE_API_KEY=votre-clé-api-principale

# ID du moteur (déjà configuré par défaut)
VITE_GOOGLE_CX=2604700cf916145eb
```

## Test

Une fois que l'API Custom Search est activée et que votre clé API est configurée :

1. Redémarrez le serveur
2. Essayez de rechercher une image
3. Vous devriez voir les produits de `www.saq.com` apparaître

## Note

Le `paid_element_key` dans le XML est différent de votre clé API principale. Utilisez toujours votre clé API principale créée dans Google Cloud Console > Credentials.

