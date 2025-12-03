# 🔍 Diagnostic du domaine Firebase

## Étape 1 : Voir votre domaine exact

Ouvrez la console du navigateur (F12) et regardez les logs qui commencent par :
```
=== Informations de domaine ===
Hostname: ...
Host (avec port): ...
URL complète: ...
```

## Étape 2 : Vérifier dans Firebase Console

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet
3. **Authentication** > **Settings** > **Authorized domains**

## Étape 3 : Ajouter le domaine

Ajoutez le **hostname** (pas le host avec port) dans la liste des domaines autorisés.

### Exemples :

| URL dans le navigateur | Hostname à ajouter |
|------------------------|-------------------|
| `http://localhost:8080` | `localhost` |
| `http://127.0.0.1:8080` | `127.0.0.1` |
| `http://192.168.1.100:8080` | `192.168.1.100` |

**Important** : N'ajoutez PAS le port, seulement le hostname !

## Étape 4 : Vérifier que le domaine est bien ajouté

Dans Firebase Console, vous devriez voir votre domaine dans la liste :
```
Authorized domains
──────────────────
localhost          [Remove]
127.0.0.1          [Remove]
```

## Étape 5 : Attendre et réessayer

1. Attendez 10-30 secondes après avoir ajouté le domaine
2. Rechargez votre application (F5)
3. Réessayez la connexion Google

## ⚠️ Si ça ne fonctionne toujours pas

1. **Vérifiez que vous êtes sur le bon projet Firebase**
   - Le projet dans Firebase Console doit correspondre à celui dans votre `.env`

2. **Vérifiez que Google est activé**
   - Authentication > Sign-in method > Google doit être "Enabled"

3. **Videz le cache du navigateur**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

4. **Essayez en navigation privée**
   - Pour éviter les problèmes de cache

5. **Vérifiez les domaines autorisés dans Google Cloud Console**
   - Allez sur https://console.cloud.google.com/
   - Sélectionnez votre projet
   - APIs & Services > Credentials
   - Cliquez sur votre OAuth 2.0 Client ID
   - Vérifiez "Authorized JavaScript origins" et "Authorized redirect URIs"
   - Ajoutez `http://localhost:8080` (avec le port cette fois) si nécessaire

## 🆘 Besoin d'aide ?

Partagez :
1. Le hostname affiché dans la console
2. La liste des domaines autorisés dans Firebase Console
3. Le message d'erreur complet

