# Guide de débogage - Authentification Google Firebase

Si l'authentification Google ne fonctionne pas, suivez ces étapes pour identifier le problème :

## 1. Vérifier la console du navigateur

Ouvrez la console du navigateur (F12) et regardez les messages :

### ✅ Si vous voyez "Firebase initialisé avec succès"
- Firebase est bien configuré
- Le problème vient probablement de la configuration dans Firebase Console

### ❌ Si vous voyez "Firebase configuration is incomplete"
- Les variables d'environnement ne sont pas définies
- Vérifiez que vous avez un fichier `.env` à la racine du projet
- Vérifiez que toutes les variables commencent par `VITE_`
- **Important** : Redémarrez le serveur après avoir ajouté/modifié le fichier `.env`

## 2. Vérifier les variables d'environnement

Dans la console, vous devriez voir :
```
Firebase Config Check: {
  hasApiKey: true,
  hasAuthDomain: true,
  hasProjectId: true,
  ...
}
```

Si l'un de ces champs est `false`, la variable correspondante n'est pas chargée.

## 3. Vérifier Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Sign-in method**
4. Vérifiez que **Google** est activé (bouton "Enable")
5. Si Google n'est pas activé :
   - Cliquez sur **Google**
   - Cliquez sur **Enable**
   - Laissez les champs "Web client ID" et "Web client secret" **VIDES**
   - Cliquez sur **Save**

## 4. Vérifier les domaines autorisés

1. Dans Firebase Console > **Authentication** > **Settings**
2. Vérifiez que `localhost` est dans la liste des domaines autorisés
3. Si vous testez sur un autre domaine, ajoutez-le

## 5. Erreurs courantes

### "La fenêtre popup a été bloquée"
- **Solution** : Autorisez les popups pour votre site dans les paramètres du navigateur

### "Firebase n'est pas configuré"
- **Solution** : Vérifiez que le fichier `.env` existe et contient toutes les variables nécessaires
- Redémarrez le serveur après avoir créé/modifié `.env`

### "auth/popup-closed-by-user"
- L'utilisateur a fermé la fenêtre de connexion
- Ce n'est pas une erreur, juste une annulation

### "auth/network-request-failed"
- Problème de connexion internet
- Vérifiez votre connexion

### "Invalid API key"
- La clé API dans `.env` est incorrecte
- Vérifiez que vous avez copié la bonne clé depuis Firebase Console

## 6. Test rapide

Ouvrez la console du navigateur et tapez :
```javascript
console.log(import.meta.env.VITE_FIREBASE_API_KEY ? "✓ API Key défini" : "✗ API Key manquant");
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✓ Project ID défini" : "✗ Project ID manquant");
```

Si les deux affichent "✓", les variables sont chargées.

## 7. Vérifier que le serveur a été redémarré

**Important** : Après avoir créé ou modifié le fichier `.env`, vous DEVEZ redémarrer le serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

Les variables d'environnement ne sont chargées qu'au démarrage du serveur.

## 8. Format du fichier .env

Assurez-vous que votre fichier `.env` est au bon format :

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

- Pas d'espaces autour du `=`
- Pas de guillemets autour des valeurs
- Pas de virgules ou points-virgules à la fin

## Besoin d'aide ?

Si le problème persiste, copiez les messages d'erreur de la console et partagez-les.

