# Guide : Créer un Projet iOS pour La Réserve

## 🔍 Situation Actuelle

Vous avez :
- ✅ Une application web React/Vite
- ✅ Des fichiers Swift dans le dossier `ios/` (DatabaseManager.swift, etc.)
- ❌ Pas de projet Xcode (`.xcodeproj`)

## 🎯 Deux Options Disponibles

---

## OPTION 1 : Créer un Projet iOS Natif (Recommandé si vous voulez du code Swift natif)

### Étape 1 : Créer un Nouveau Projet Xcode

1. **Ouvrez Xcode**
2. **Menu : File > New > Project** (ou `Cmd + Shift + N`)
3. Sélectionnez **"iOS"** en haut
4. Choisissez **"App"** (icône avec un carré bleu)
5. Cliquez sur **"Next"**

### Étape 2 : Configurer le Projet

Remplissez les informations :

- **Product Name** : `La Reserve` (ou `LaReserve` sans espace)
- **Team** : Sélectionnez votre équipe Apple Developer
- **Organization Identifier** : `com.guillaumehetu` (ou votre identifiant)
- **Bundle Identifier** : Sera automatiquement `com.guillaumehetu.LaReserve`
- **Interface** : **SwiftUI** (recommandé) ou **Storyboard**
- **Language** : **Swift**
- **Storage** : **None** (vous utiliserez SQLite)

6. Cliquez sur **"Next"**
7. Choisissez où sauvegarder le projet
8. **IMPORTANT** : Créez-le dans un nouveau dossier ou à côté de votre projet actuel
9. Cliquez sur **"Create"**

### Étape 3 : Intégrer vos Fichiers Swift Existants

1. **Dans Xcode**, dans le navigateur de gauche :
   - Faites un clic droit sur votre projet (icône bleue)
   - Sélectionnez **"Add Files to [Nom du Projet]..."**

2. **Naviguez vers votre dossier `ios/`** dans votre projet web :
   - Sélectionnez les fichiers :
     - `DatabaseManager.swift`
     - `ProductRepository.swift`
     - `InventoryView.swift`

3. **Options importantes** :
   - ✅ Cochez **"Copy items if needed"** (pour copier les fichiers)
   - ✅ Cochez **"Add to targets: [Votre App]"**
   - Cliquez sur **"Add"**

4. **Vérifiez que les fichiers apparaissent** dans le navigateur de Xcode

### Étape 4 : Configurer SQLite

1. **Dans Xcode**, allez dans **File > Add Package Dependencies**
2. Entrez l'URL : `https://github.com/stephencelis/SQLite.swift.git`
3. Cliquez sur **"Add Package"**
4. Sélectionnez la version (dernière stable)
5. Cochez votre target et cliquez sur **"Add Package"**

### Étape 5 : Configurer le Signing

1. Cliquez sur votre **projet** (icône bleue) dans le navigateur
2. Sélectionnez votre **TARGET** (votre app)
3. Allez dans l'onglet **"Signing & Capabilities"**
4. Cochez **"Automatically manage signing"**
5. Sélectionnez votre **Team**

### Étape 6 : Tester

1. Sélectionnez un simulateur iOS (ex: iPhone 15 Pro)
2. Cliquez sur le bouton **Play** (▶️) ou `Cmd + R`
3. L'app devrait se compiler et s'ouvrir dans le simulateur

---

## OPTION 2 : Utiliser Capacitor (Recommandé pour wrapper votre app web)

Cette option permet de transformer votre app web React en app iOS native rapidement.

### Étape 1 : Installer Capacitor

```bash
# Dans le terminal, à la racine de votre projet
npm install @capacitor/core @capacitor/cli @capacitor/ios
# ou
pnpm add @capacitor/core @capacitor/cli @capacitor/ios
```

### Étape 2 : Initialiser Capacitor

```bash
# Initialiser Capacitor
npx cap init

# Répondez aux questions :
# App name: La Reserve
# App ID: com.guillaumehetu.lareserve
# Web dir: dist/spa (ou dist selon votre config)
```

### Étape 3 : Ajouter la Plateforme iOS

```bash
# Ajouter iOS
npx cap add ios
```

Cela créera un dossier `ios/` avec un projet Xcode complet.

### Étape 4 : Build de votre App Web

```bash
# Build votre app React
npm run build
# ou
pnpm build
```

### Étape 5 : Synchroniser avec iOS

```bash
# Synchroniser les fichiers web avec iOS
npx cap sync ios
```

### Étape 6 : Ouvrir dans Xcode

```bash
# Ouvrir le projet dans Xcode
npx cap open ios
```

Ou manuellement :
- Ouvrez Xcode
- Ouvrez le fichier `ios/App/App.xcworkspace` (⚠️ ouvrez le `.xcworkspace`, pas le `.xcodeproj`)

### Étape 7 : Configurer le Signing

1. Dans Xcode, cliquez sur votre **projet** (icône bleue)
2. Sélectionnez votre **TARGET** (App)
3. Allez dans **"Signing & Capabilities"**
4. Cochez **"Automatically manage signing"**
5. Sélectionnez votre **Team**

### Étape 8 : Intégrer vos Fichiers Swift (Optionnel)

Si vous voulez utiliser vos fichiers Swift existants avec Capacitor :

1. **Créez un plugin Capacitor** pour votre code Swift
2. Ou **ajoutez vos fichiers Swift** directement dans le projet Capacitor

---

## 🎯 Quelle Option Choisir ?

### Choisissez **Option 1 (Projet Natif)** si :
- ✅ Vous voulez une app 100% native iOS
- ✅ Vous préférez Swift/SwiftUI
- ✅ Vous n'avez pas besoin de partager le code avec le web
- ✅ Vous voulez des performances maximales

### Choisissez **Option 2 (Capacitor)** si :
- ✅ Vous voulez réutiliser votre code React existant
- ✅ Vous voulez publier sur iOS ET Android avec le même code
- ✅ Vous voulez une solution plus rapide
- ✅ Vous voulez maintenir une seule codebase

---

## 📝 Après Avoir Créé le Projet

Une fois que vous avez un projet Xcode fonctionnel, suivez le guide :
👉 **`GUIDE_XCODE_APP_STORE.md`** pour publier sur l'App Store

---

## 🆘 Problèmes Courants

### "No such module 'SQLite'"
- Vérifiez que vous avez bien ajouté le package SQLite.swift
- Dans Xcode : File > Packages > Reset Package Caches

### Erreurs de compilation dans vos fichiers Swift
- Vérifiez que les fichiers sont bien ajoutés au target
- Vérifiez les imports (ex: `import SQLite`)

### "Cannot find type 'Product'"
- Vous devrez créer vos modèles de données Swift
- Ou adapter vos fichiers Swift existants au nouveau projet

---

## 📚 Ressources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [SwiftUI Tutorial](https://developer.apple.com/tutorials/swiftui)
- [SQLite.swift GitHub](https://github.com/stephencelis/SQLite.swift)

