# Configuration des variables d'environnement Firebase

Pour activer l'authentification Google avec Firebase, vous devez configurer les variables d'environnement suivantes.

## Variables d'environnement requises

Créez un fichier `.env` à la racine du projet avec les valeurs suivantes :

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Comment obtenir ces valeurs

1. **Accédez à Firebase Console**
   - Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sélectionnez votre projet Firebase

2. **Ouvrez les paramètres du projet**
   - Cliquez sur l'icône ⚙️ **"Project Settings"** (Paramètres du projet) en haut à gauche
   - Ou allez dans le menu ⚙️ > **"Project settings"**

3. **Trouvez la configuration de votre app web**
   - Scroll jusqu'à **"Your apps"** (Vos applications)
   - Si vous n'avez pas encore d'app web, cliquez sur **"Add app"** > **Web** (icône `</>`)
   - Donnez un nom à votre app (ex: "Bartender Web")
   - Copiez la configuration qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

4. **Mappez les valeurs dans votre fichier .env**
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

## Activer l'authentification Google dans Firebase

1. **Dans Firebase Console**
   - Allez dans **Authentication** > **Sign-in method**
   - Trouvez **"Google"** dans la liste
   - Cliquez sur **"Google"** puis sur **"Enable"** (Activer)
   - Laissez les champs **"Web client ID"** et **"Web client secret"** **VIDES** pour que Firebase crée automatiquement le client OAuth
   - Cliquez sur **"Save"** (Enregistrer)

2. **Configurer les domaines autorisés**
   - Dans Firebase Console > **Authentication** > **Settings** (Paramètres)
   - Vérifiez que `localhost` est dans la liste des domaines autorisés (présent par défaut)
   - Ajoutez votre domaine de production si nécessaire

## Redémarrer le serveur de développement

Après avoir configuré les variables d'environnement, redémarrez votre serveur de développement :

```bash
npm run dev
```

ou

```bash
pnpm dev
```

## Vérification

Une fois configuré, vous devriez pouvoir :
1. Voir le bouton "Continuer avec Google" sur la page de connexion
2. Cliquer dessus et voir s'ouvrir une popup Google pour la connexion
3. Après connexion réussie, être redirigé vers `/inventory`

Si vous voyez un message d'erreur indiquant que Firebase n'est pas configuré, vérifiez que :
- Le fichier `.env` existe à la racine du projet
- Toutes les variables commencent par `VITE_`
- Le serveur a été redémarré après avoir ajouté les variables

