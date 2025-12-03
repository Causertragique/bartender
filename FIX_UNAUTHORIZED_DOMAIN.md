# Solution : Erreur auth/unauthorized-domain

## Problème

Vous voyez l'erreur `Firebase: Error (auth/unauthorized-domain)` car le domaine sur lequel votre application s'exécute n'est pas autorisé dans Firebase Console.

## Solution rapide

### Étape 1 : Identifier votre domaine actuel

Votre domaine actuel est affiché dans l'erreur, ou vous pouvez le voir dans la barre d'adresse de votre navigateur :
- `localhost` (si vous êtes sur http://localhost:8080)
- `127.0.0.1` (si vous êtes sur http://127.0.0.1:8080)
- Votre domaine de production (ex: `votre-site.com`)

### Étape 2 : Ajouter le domaine dans Firebase Console

1. **Allez sur Firebase Console**
   - [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sélectionnez votre projet Firebase

2. **Ouvrez les paramètres d'authentification**
   - Dans le menu de gauche, cliquez sur **"Authentication"**
   - Cliquez sur l'onglet **"Settings"** (Paramètres) en haut

3. **Ajoutez votre domaine**
   - Scroll jusqu'à la section **"Authorized domains"** (Domaines autorisés)
   - Vous verrez une liste de domaines autorisés
   - Cliquez sur **"Add domain"** (Ajouter un domaine)

4. **Entrez votre domaine**
   - Si vous êtes en développement local, ajoutez :
     - `localhost` (déjà présent normalement)
     - `127.0.0.1` (si vous utilisez cette adresse)
   - Si vous êtes en production, ajoutez votre domaine complet :
     - `votre-site.com`
     - `www.votre-site.com` (si nécessaire)

5. **Sauvegardez**
   - Cliquez sur **"Add"** ou **"Save"**
   - Le domaine sera ajouté à la liste

### Étape 3 : Vérifier

Après avoir ajouté le domaine :
1. Attendez quelques secondes (les changements peuvent prendre un peu de temps)
2. Rechargez votre application
3. Réessayez de vous connecter avec Google

## Domaines courants à ajouter

### Pour le développement local :
- `localhost`
- `127.0.0.1`
- `localhost:8080` (si nécessaire)

### Pour la production :
- Votre domaine principal : `votre-site.com`
- Avec www : `www.votre-site.com`
- Sous-domaines si nécessaire : `app.votre-site.com`

## Vérification rapide

Pour voir votre domaine actuel, ouvrez la console du navigateur (F12) et tapez :
```javascript
console.log("Domaine actuel:", window.location.hostname);
console.log("URL complète:", window.location.href);
```

## Note importante

- Les changements dans Firebase Console peuvent prendre quelques secondes à quelques minutes pour être appliqués
- Si vous avez ajouté `localhost` mais que ça ne fonctionne toujours pas, essayez aussi d'ajouter `127.0.0.1`
- Assurez-vous que vous êtes connecté au bon projet Firebase dans Firebase Console

## Si le problème persiste

1. Vérifiez que vous avez bien sauvegardé les changements dans Firebase Console
2. Attendez 1-2 minutes et réessayez
3. Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
4. Vérifiez que vous êtes sur le bon projet Firebase

