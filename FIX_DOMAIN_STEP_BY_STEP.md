# Guide étape par étape : Corriger l'erreur "unauthorized-domain"

## 🔍 Étape 1 : Identifier votre domaine

Dans la console du navigateur, vous devriez voir :
- **Domaine actuel** : quelque chose comme `localhost` ou `127.0.0.1`
- **Hostname** : le nom de domaine exact

## 📋 Étape 2 : Ajouter le domaine dans Firebase Console

### Option A : Via l'interface web (recommandé)

1. **Ouvrez Firebase Console**
   - Allez sur : https://console.firebase.google.com/
   - Connectez-vous avec votre compte Google

2. **Sélectionnez votre projet**
   - Cliquez sur le nom de votre projet dans la liste

3. **Ouvrez Authentication**
   - Dans le menu de gauche, cliquez sur **"Authentication"** (ou "Authentification")

4. **Ouvrez les paramètres**
   - Cliquez sur l'onglet **"Settings"** (Paramètres) en haut de la page

5. **Trouvez "Authorized domains"**
   - Descendez jusqu'à la section **"Authorized domains"** (Domaines autorisés)
   - Vous verrez une liste avec probablement :
     - `localhost` (déjà présent normalement)
     - Votre domaine de production (si configuré)

6. **Ajoutez votre domaine**
   - Cliquez sur le bouton **"Add domain"** (Ajouter un domaine)
   - Dans le champ qui apparaît, entrez votre domaine :
     - Si vous êtes sur `http://localhost:8080` → entrez : `localhost`
     - Si vous êtes sur `http://127.0.0.1:8080` → entrez : `127.0.0.1`
     - Si vous êtes sur un autre domaine → entrez le domaine complet
   - Cliquez sur **"Add"** (Ajouter)

7. **Vérifiez**
   - Votre domaine devrait maintenant apparaître dans la liste
   - Attendez 10-30 secondes pour que les changements soient appliqués

8. **Rechargez votre application**
   - Revenez sur votre application
   - Rechargez la page (F5 ou Ctrl+R)
   - Réessayez de vous connecter avec Google

### Option B : Vérifier les domaines déjà autorisés

Si `localhost` est déjà dans la liste mais que ça ne fonctionne pas :

1. **Vérifiez l'URL exacte**
   - Regardez la barre d'adresse de votre navigateur
   - Notez si c'est `localhost` ou `127.0.0.1`

2. **Ajoutez les deux si nécessaire**
   - Ajoutez `localhost` (sans le port)
   - Ajoutez aussi `127.0.0.1` (sans le port)

## 🎯 Domaines courants à ajouter

### Pour le développement local :
- `localhost` (le plus courant)
- `127.0.0.1` (si vous utilisez l'adresse IP)

### Pour la production :
- `votre-site.com`
- `www.votre-site.com` (si vous utilisez www)

## ⚠️ Erreurs courantes

### "J'ai ajouté localhost mais ça ne marche toujours pas"
- Vérifiez que vous avez bien cliqué sur "Add" ou "Save"
- Attendez 30 secondes et réessayez
- Videz le cache du navigateur (Ctrl+Shift+R)

### "Je ne vois pas la section Authorized domains"
- Assurez-vous d'être dans **Authentication** > **Settings** (pas juste Authentication)
- Vérifiez que vous êtes sur le bon projet Firebase

### "Le domaine n'apparaît pas dans la liste après l'avoir ajouté"
- Rafraîchissez la page Firebase Console
- Vérifiez que vous avez bien cliqué sur "Add"

## 🔧 Vérification rapide

Pour voir votre domaine actuel, ouvrez la console du navigateur (F12) et tapez :
```javascript
console.log("Hostname:", window.location.hostname);
console.log("Host:", window.location.host);
console.log("URL complète:", window.location.href);
```

## 📸 Capture d'écran de référence

La section "Authorized domains" devrait ressembler à ça :

```
Authorized domains
──────────────────
localhost          [Remove]
127.0.0.1          [Remove]
votre-site.com     [Remove]

[Add domain]
```

## ✅ Après avoir ajouté le domaine

1. Attendez 10-30 secondes
2. Rechargez votre application
3. Réessayez de vous connecter avec Google
4. Si ça ne fonctionne toujours pas, vérifiez que vous avez ajouté le bon domaine (celui affiché dans l'erreur)

## 🆘 Besoin d'aide ?

Si le problème persiste après avoir ajouté le domaine :
1. Vérifiez que vous êtes connecté au bon compte Google dans Firebase Console
2. Vérifiez que vous avez sélectionné le bon projet Firebase
3. Partagez le message d'erreur complet avec le domaine affiché

