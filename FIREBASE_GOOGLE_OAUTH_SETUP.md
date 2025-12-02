# Configuration Firebase Authentication avec Google OAuth

## 🔍 Comment trouver à quel projet Google Cloud votre projet Firebase est lié

### Méthode 1 : Via Firebase Console (le plus simple)

1. **Accédez à Firebase Console**
   - Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sélectionnez votre projet Firebase

2. **Ouvrez les paramètres du projet**
   - Cliquez sur l'icône ⚙️ **"Project Settings"** (Paramètres du projet) en haut à gauche
   - Ou allez dans le menu ⚙️ > **"Project settings"**

3. **Trouvez le Project ID**
   - Dans l'onglet **"General"** (Général)
   - Cherchez la section **"Your project"** (Votre projet)
   - Le **"Project ID"** est affiché (ex: `inventorybar-5312d` ou `bartender-xxxxx`)
   - ⚠️ **Important** : Le Project ID Firebase est généralement le même que le Project ID Google Cloud

4. **Vérifiez le lien vers Google Cloud**
   - Dans la même page, cherchez **"Project number"** (Numéro de projet)
   - Cliquez sur le lien **"Google Cloud Platform"** ou **"View in Google Cloud Console"**
   - Cela vous redirigera vers le projet Google Cloud associé

### Méthode 2 : Via Google Cloud Console

1. **Allez sur Google Cloud Console**
   - [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Sélectionnez le projet**
   - En haut de la page, cliquez sur le sélecteur de projet
   - Recherchez un projet avec un nom similaire à votre projet Firebase
   - Les projets Firebase apparaissent généralement avec le même nom ou Project ID

3. **Vérifiez les APIs activées**
   - Menu : **"APIs & Services"** > **"Enabled APIs"** (APIs activées)
   - Si vous voyez **"Firebase Management API"** ou **"Identity Toolkit API"**, c'est le bon projet

### Méthode 3 : Via le Client ID OAuth

Si vous avez déjà un Client ID OAuth (comme `956744077500-77fq1ml9rtl8de593pnhmo94a60j8635.apps.googleusercontent.com`) :

1. **Le numéro au début** (`956744077500`) est le **Project Number** de Google Cloud
2. **Allez sur Google Cloud Console** > Sélecteur de projet
3. **Recherchez un projet** avec ce Project Number
4. Ou allez directement dans **"APIs & Services"** > **"Credentials"** et trouvez votre Client ID

### Méthode 4 : Via la ligne de commande Firebase

Si vous avez Firebase CLI installé :

```bash
firebase projects:list
```

Cela affichera tous vos projets Firebase avec leurs Project IDs.

---

## ❌ Problème : Je ne trouve pas mon projet dans Google Cloud Console

Si vous ne trouvez pas votre projet Firebase dans Google Cloud Console, voici comment le localiser :

### Solution 1 : Utiliser le Project Number depuis Firebase

1. **Dans Firebase Console** :
   - Allez dans ⚙️ **Project Settings** > **General**
   - Trouvez le **"Project number"** (ex: `956744077500`)
   - **Copiez ce numéro**

2. **Dans Google Cloud Console** :
   - Allez sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Dans la barre de recherche en haut, tapez le **Project Number** (ex: `956744077500`)
   - Le projet devrait apparaître dans les résultats

3. **Ou utilisez directement l'URL** :
   - Remplacez `PROJECT_NUMBER` par votre Project Number :
   ```
   https://console.cloud.google.com/home/dashboard?project=PROJECT_NUMBER
   ```
   - Exemple : `https://console.cloud.google.com/home/dashboard?project=956744077500`

### Solution 2 : Utiliser le Project ID depuis Firebase

1. **Dans Firebase Console** :
   - ⚙️ **Project Settings** > **General**
   - Trouvez le **"Project ID"** (ex: `inventorybar-5312d`)

2. **Dans Google Cloud Console** :
   - Cliquez sur le sélecteur de projet en haut
   - Dans la barre de recherche, tapez le **Project ID**
   - Le projet devrait apparaître

3. **Ou utilisez directement l'URL** :
   ```
   https://console.cloud.google.com/home/dashboard?project=PROJECT_ID
   ```
   - Exemple : `https://console.cloud.google.com/home/dashboard?project=inventorybar-5312d`

### Solution 3 : Vérifier que vous êtes sur le bon compte Google

⚠️ **IMPORTANT** : Firebase et Google Cloud doivent utiliser le **même compte Google** !

1. **Vérifiez dans Firebase Console** :
   - En haut à droite, voyez quel compte Google est connecté
   - Notez l'adresse email

2. **Vérifiez dans Google Cloud Console** :
   - En haut à droite, vérifiez que c'est le **même compte Google**
   - Si ce n'est pas le cas, déconnectez-vous et reconnectez-vous avec le bon compte

### Solution 4 : Le projet existe mais n'apparaît pas dans la liste

Parfois, le projet Google Cloud existe mais n'apparaît pas dans la liste. Pour y accéder directement :

1. **Trouvez le Project Number dans Firebase** (voir Solution 1)

2. **Allez directement dans les Credentials** :
   ```
   https://console.cloud.google.com/apis/credentials?project=PROJECT_NUMBER
   ```
   - Remplacez `PROJECT_NUMBER` par votre numéro (ex: `956744077500`)

3. **Ou allez directement dans les APIs** :
   ```
   https://console.cloud.google.com/apis/library?project=PROJECT_NUMBER
   ```

### Solution 5 : Créer le lien si le projet n'existe pas encore

Si Firebase n'a pas encore créé le projet Google Cloud associé :

1. **Dans Firebase Console** :
   - Allez dans **Authentication** > **Sign-in method**
   - Activez **Google** (laissez les champs vides)
   - Cliquez sur **Save**
   - Firebase créera automatiquement le projet Google Cloud et le client OAuth

2. **Attendez quelques minutes** puis réessayez de trouver le projet dans Google Cloud Console

### Solution 6 : Utiliser le lien direct depuis Firebase

1. **Dans Firebase Console** :
   - ⚙️ **Project Settings** > **General**
   - Cherchez un bouton ou lien **"View in Google Cloud Console"** ou **"Google Cloud Platform"**
   - Cliquez dessus pour être redirigé directement vers le projet

### 🔍 Comment identifier votre Project Number

D'après votre Client ID OAuth (`956744077500-77fq1ml9rtl8de593pnhmo94a60j8635.apps.googleusercontent.com`), votre **Project Number est : `956744077500`**

**Essayez cette URL directe** :
```
https://console.cloud.google.com/home/dashboard?project=956744077500
```

Ou pour aller directement aux Credentials :
```
https://console.cloud.google.com/apis/credentials?project=956744077500
```

---

## Problème : Enregistrer un client Google OAuth dans Firebase

Si vous n'arrivez pas à enregistrer votre client Google dans Firebase Console, suivez ces étapes :

## Étape 1 : Activer Google comme méthode de connexion dans Firebase

1. **Accédez à Firebase Console**
   - Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sélectionnez votre projet (ou créez-en un nouveau)

2. **Activez Authentication**
   - Dans le menu de gauche, cliquez sur **"Authentication"** (ou "Authentification")
   - Si ce n'est pas encore activé, cliquez sur **"Get started"** (Commencer)

3. **Configurez Google comme méthode de connexion**
   - Cliquez sur l'onglet **"Sign-in method"** (Méthode de connexion)
   - Trouvez **"Google"** dans la liste
   - Cliquez sur **"Google"** puis sur **"Enable"** (Activer)

## Étape 2 : Configurer le Client OAuth dans Firebase

### Option A : Laisser Firebase créer automatiquement le client OAuth

1. Dans la configuration Google, laissez les champs **"Web client ID"** et **"Web client secret"** **VIDES**
2. Cliquez sur **"Save"** (Enregistrer)
3. Firebase créera automatiquement un client OAuth dans Google Cloud Console

### Option B : Utiliser votre propre Client OAuth existant

Si vous avez déjà créé un client OAuth dans Google Cloud Console :

1. **Récupérez vos identifiants OAuth**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Sélectionnez votre projet
   - Menu : **"APIs & Services"** > **"Credentials"**
   - Trouvez votre **OAuth 2.0 Client ID** (celui qui commence par `956744077500-...`)
   - Cliquez dessus pour voir les détails

2. **Copiez les identifiants**
   - **Client ID** : `956744077500-77fq1ml9rtl8de593pnhmo94a60j8635.apps.googleusercontent.com`
   - **Client Secret** : (visible dans les détails du client OAuth)

3. **Configurez dans Firebase**
   - Retournez dans Firebase Console > Authentication > Sign-in method > Google
   - Collez le **Client ID** dans le champ "Web client ID"
   - Collez le **Client Secret** dans le champ "Web client secret"
   - Cliquez sur **"Save"**

## Étape 3 : Configurer les domaines autorisés

⚠️ **IMPORTANT** : Pour que l'authentification fonctionne, vous devez configurer les domaines autorisés.

### Dans Google Cloud Console (OAuth Client)

1. Allez dans [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**
2. Cliquez sur votre **OAuth 2.0 Client ID**
3. Dans **"Authorized JavaScript origins"**, ajoutez :
   ```
   http://localhost:8080
   http://localhost:5173
   https://votre-domaine.com
   ```
4. Dans **"Authorized redirect URIs"**, ajoutez :
   ```
   http://localhost:8080
   http://localhost:5173
   https://votre-domaine.com
   ```
5. Cliquez sur **"Save"**

### Dans Firebase Console

1. Firebase Console > **Authentication** > **Settings** (Paramètres)
2. Dans **"Authorized domains"**, vérifiez que ces domaines sont présents :
   - `localhost` (déjà présent par défaut)
   - Votre domaine de production (si applicable)

## Étape 4 : Erreurs courantes et solutions

### Erreur : "Invalid client ID"
- **Solution** : Vérifiez que le Client ID est correctement copié (sans espaces)
- Assurez-vous que le Client ID correspond à un client OAuth de type "Web application"

### Erreur : "Redirect URI mismatch"
- **Solution** : Vérifiez que l'URL de votre application est bien dans les "Authorized redirect URIs" du client OAuth

### Erreur : "Domain not authorized"
- **Solution** : Ajoutez votre domaine dans Firebase Console > Authentication > Settings > Authorized domains

### Le bouton "Save" ne fonctionne pas
- **Solution** : 
  1. Désactivez Google, sauvegardez
  2. Réactivez Google, sauvegardez
  3. Si le problème persiste, videz le cache du navigateur ou utilisez un autre navigateur

## Étape 5 : Configuration dans votre application

Une fois configuré dans Firebase, vous devez :

1. **Installer Firebase SDK** (déjà fait : `firebase` est dans package.json ✅)

2. **Créer un fichier de configuration Firebase**
   - Créez `client/lib/firebase.ts` avec votre configuration Firebase
   - Vous trouverez la configuration dans Firebase Console > Project Settings > General > Your apps

3. **Utiliser l'authentification Google dans votre code**
   - Implémenter `signInWithGoogle()` dans `client/pages/Home.tsx`

## Configuration Firebase pour votre application

Pour obtenir votre configuration Firebase :

1. Firebase Console > ⚙️ **Project Settings** (Paramètres du projet)
2. Scroll jusqu'à **"Your apps"** (Vos applications)
3. Si vous n'avez pas encore d'app web, cliquez sur **"Add app"** > **Web** (icône `</>`)
4. Donnez un nom à votre app (ex: "Bartender Web")
5. Copiez la configuration qui ressemble à :
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

## Prochaines étapes

Une fois la configuration terminée dans Firebase Console, je peux vous aider à :
1. Créer le fichier de configuration Firebase dans votre projet
2. Implémenter l'authentification Google dans `Home.tsx`
3. Configurer la gestion de l'état d'authentification

---

**Note** : Si vous continuez à avoir des problèmes, vérifiez que :
- Vous êtes connecté au bon compte Google dans Firebase Console
- Votre projet Firebase est bien lié à votre projet Google Cloud
- Les permissions de votre compte vous permettent de modifier les paramètres d'authentification

