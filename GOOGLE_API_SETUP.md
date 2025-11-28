# Configuration Google Custom Search API

## Pour une application Web (actuelle)

Vous **N'AVEZ PAS BESOIN** de Bundle ID, App Store ID ou Team ID pour Google Custom Search API. Ces informations sont uniquement nécessaires pour d'autres services Google (Firebase, OAuth iOS, etc.).

### Étapes pour configurer Google Custom Search API :

1. **Créer un projet Google Cloud**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet (ou utilisez un existant)
   - **Pas besoin de Bundle ID ici !**

2. **Activer l'API Custom Search**
   - Dans le menu, allez dans "APIs & Services" > "Library"
   - Recherchez "Custom Search API"
   - Cliquez sur "Enable"

3. **Créer une clé API**
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "API Key"
   - Copiez la clé API générée
   - (Optionnel) Restreignez la clé à "Custom Search API" pour plus de sécurité

4. **Créer un moteur de recherche personnalisé**
   - Allez sur [Google Custom Search](https://cse.google.com/)
   - Cliquez sur "Add" pour créer un nouveau moteur
   - Dans "Sites to search", entrez : `*` (pour rechercher sur tout le web)
   - Donnez un nom à votre moteur
   - Cliquez sur "Create"
   - Une fois créé, allez dans "Setup" > "Basics"
   - Copiez le "Search engine ID" (CX)

5. **Configurer dans l'application**
   
   **Vous avez déjà votre CX : `2604700cf916145eb`** ✅
   
   Il vous manque juste la clé API :
   - Allez dans [Google Cloud Console](https://console.cloud.google.com/) > "APIs & Services" > "Credentials"
   - Créez une "API Key"
   - Copiez la clé générée
   
   Ensuite, configurez dans l'application :
   
   **Option A : Fichier `.env` (recommandé)**
   - Créez un fichier `.env` à la racine du projet :
     ```
     VITE_GOOGLE_API_KEY=votre_cle_api_ici
     VITE_GOOGLE_CX=2604700cf916145eb
     ```
   
   **Option B : localStorage (pour tester rapidement)**
   - Ouvrez la console du navigateur (F12)
   - Exécutez :
     ```javascript
     localStorage.setItem('google_api_key', 'votre_cle_api_ici')
     localStorage.setItem('google_cx', '2604700cf916145eb')
     ```
   - Rechargez la page
   
   **Note :** Le code que vous avez montré (`<script async src="https://cse.google.com/cse.js?cx=...">`) est pour un widget de recherche sur une page web. Pour la recherche d'images dans l'application, on utilise l'API (qui nécessite aussi une clé API).

## Pour une application iOS (future)

Si vous voulez convertir cette app en iOS, vous aurez besoin de :

1. **Bundle ID** : Format `com.votrenom.votreapp` (ex: `com.bartender.inventory`)
   - Créé dans Xcode ou Apple Developer Portal
   - Format : `com.[domaine].[nom-app]`

2. **App Store ID** : Obtenu après avoir soumis l'app sur l'App Store

3. **Team ID** : Votre ID d'équipe Apple Developer
   - Trouvé dans [Apple Developer Portal](https://developer.apple.com/account/)
   - Format : 10 caractères alphanumériques

**Mais encore une fois, pour Google Custom Search API, vous n'avez PAS besoin de ces informations !**

### Conversion en app iOS

Pour convertir cette app React en iOS, vous pouvez utiliser :
- **Capacitor** (recommandé pour React) : https://capacitorjs.com/
- **React Native** : Nécessite de réécrire certains composants
- **PWA** : L'app peut fonctionner comme Progressive Web App sur iOS

Souhaitez-vous que je vous aide à configurer Capacitor pour iOS ?

