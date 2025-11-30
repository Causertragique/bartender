# Guide pour Créer les Captures d'écran App Store

## 📱 Tailles Requises

Vous devez créer des captures d'écran pour ces tailles d'appareils :

### iPhone
- **iPhone 6.7"** (iPhone 14 Pro Max, 15 Pro Max) : **1290 x 2796 pixels**
- **iPhone 6.5"** (iPhone 11 Pro Max, XS Max) : **1242 x 2688 pixels**
- **iPhone 5.5"** (iPhone 8 Plus) : **1242 x 2208 pixels**

### iPad
- **iPad Pro 12.9"** : **2048 x 2732 pixels**
- **iPad Pro 11"** : **1668 x 2388 pixels**

**Minimum requis :** 3 captures d'écran par taille d'appareil (5 tailles = 15 captures minimum)

## 🎯 Pages à Capturer

1. **Page d'accueil** (authentification avec logo)
2. **Page Inventaire** (avec produits et statistiques)
3. **Page Ventes** (point de vente avec panier)
4. **Page Analytics** (avec un outil IA sélectionné)
5. **Page Paramètres** (avec sections visibles)

## 🛠️ Méthode 1 : Simulateur iOS (Xcode) - RECOMMANDÉ

### Prérequis
- Mac avec Xcode installé
- Ou accès à un Mac distant

### Étapes

1. **Ouvrir Xcode**
   ```
   Xcode > Open Developer Tool > Simulator
   ```

2. **Choisir l'appareil**
   - iPhone 14 Pro Max (pour 6.7")
   - iPhone 11 Pro Max (pour 6.5")
   - iPhone 8 Plus (pour 5.5")
   - iPad Pro 12.9-inch
   - iPad Pro 11-inch

3. **Ouvrir l'application dans le simulateur**
   - Option 1 : Build depuis Xcode
   - Option 2 : Ouvrir Safari dans le simulateur et naviguer vers `http://localhost:8080`
   - Option 3 : Utiliser un serveur de développement local

4. **Prendre les captures**
   - `Cmd + S` pour sauvegarder la capture
   - Ou `Device > Screenshot` dans le menu
   - Les captures sont automatiquement aux bonnes dimensions

5. **Organiser les fichiers**
   ```
   screenshots/
   ├── iphone-6.7/
   │   ├── 01-home.png
   │   ├── 02-inventory.png
   │   ├── 03-sales.png
   │   ├── 04-analytics.png
   │   └── 05-settings.png
   ├── iphone-6.5/
   ├── iphone-5.5/
   ├── ipad-12.9/
   └── ipad-11/
   ```

## 🛠️ Méthode 2 : Appareil iOS Réel

### Étapes

1. **Ouvrir l'application sur votre iPhone/iPad**
   - Via Safari (si déployé)
   - Via TestFlight (si configuré)
   - Via build local

2. **Prendre les captures**
   - iPhone X et plus récent : `Bouton latéral + Volume haut`
   - iPhone 8 et plus ancien : `Bouton home + Power`

3. **Redimensionner si nécessaire**
   - Les captures peuvent être aux dimensions natives
   - Utiliser un outil de redimensionnement si besoin

## 🛠️ Méthode 3 : Outils en Ligne (Sans Mac)

### Option A : BrowserStack / LambdaTest
1. Créer un compte gratuit
2. Sélectionner un iPhone/iPad
3. Naviguer vers votre application
4. Prendre des captures d'écran

### Option B : Responsively App
1. Télécharger [Responsively App](https://responsively.app/)
2. Ajouter des appareils personnalisés avec les dimensions exactes
3. Prendre des captures

### Option C : Chrome DevTools (Approximation)
1. Ouvrir Chrome DevTools (`F12`)
2. Activer le mode responsive (`Cmd/Ctrl + Shift + M`)
3. Sélectionner un appareil ou créer une taille personnalisée
4. Prendre une capture (`Cmd/Ctrl + Shift + P` > "Capture screenshot")
5. **Note :** Les dimensions peuvent ne pas être exactes, redimensionner après

## 🖼️ Redimensionnement des Images

Si vous avez des captures aux mauvaises dimensions, utilisez :

### Outil en ligne
- [Squoosh](https://squoosh.app/) - Gratuit, simple
- [TinyPNG](https://tinypng.com/) - Compression + redimensionnement

### Logiciel
- **ImageMagick** (ligne de commande)
  ```bash
  magick input.png -resize 1290x2796! output.png
  ```
- **GIMP** (gratuit)
- **Photoshop**
- **Preview** (Mac) - Redimensionner via Outils > Ajuster la taille

### Script Node.js (si vous avez Node installé)
```javascript
const sharp = require('sharp');

async function resizeScreenshot(input, output, width, height) {
  await sharp(input)
    .resize(width, height, { fit: 'contain', background: '#ffffff' })
    .toFile(output);
}

// Exemple
resizeScreenshot('screenshot.png', 'iphone-6.7.png', 1290, 2796);
```

## 📋 Checklist de Capture

Pour chaque taille d'appareil, capturer :

- [ ] **Page d'accueil** - Logo visible, formulaire d'authentification
- [ ] **Page Inventaire** - Produits visibles, statistiques en haut
- [ ] **Page Ventes** - Interface de point de vente, panier visible
- [ ] **Page Analytics** - Un outil IA affiché, sidebar visible ou fermée
- [ ] **Page Paramètres** - Au moins une section ouverte

## 💡 Conseils

1. **Utiliser des données réalistes** - Remplir l'inventaire avec quelques produits avant de capturer
2. **Éviter les données sensibles** - Pas de vrais numéros de carte, emails personnels
3. **Mode clair et sombre** - Apple accepte les deux, choisissez celui qui met le mieux en valeur
4. **Qualité** - Utiliser PNG pour la meilleure qualité
5. **Ordre logique** - Nommer les fichiers dans l'ordre d'utilisation (01-, 02-, etc.)

## 🚀 Workflow Recommandé

1. **Préparer l'application**
   - Remplir avec des données de démonstration
   - S'assurer que toutes les pages sont accessibles
   - Vérifier que l'UI est propre et professionnelle

2. **Créer les captures**
   - Commencer par iPhone 6.7" (le plus utilisé)
   - Capturer les 5 pages principales
   - Répéter pour les autres tailles

3. **Vérifier les dimensions**
   - Utiliser un outil pour vérifier les dimensions exactes
   - S'assurer que les images ne sont pas déformées

4. **Optimiser**
   - Compresser les images (mais garder la qualité)
   - Nommer les fichiers de manière cohérente

5. **Organiser**
   - Créer un dossier `screenshots/` dans le projet
   - Organiser par taille d'appareil

## 📁 Structure de Dossiers Recommandée

```
screenshots/
├── iphone-6.7-inch/
│   ├── 01-home-1290x2796.png
│   ├── 02-inventory-1290x2796.png
│   ├── 03-sales-1290x2796.png
│   ├── 04-analytics-1290x2796.png
│   └── 05-settings-1290x2796.png
├── iphone-6.5-inch/
│   └── ...
├── iphone-5.5-inch/
│   └── ...
├── ipad-12.9-inch/
│   └── ...
└── ipad-11-inch/
    └── ...
```

## ⚠️ Points d'Attention

1. **Pas de barre d'état iOS** - Les captures doivent montrer l'app, pas la barre d'état système
2. **Pas de bordures** - Les images doivent être exactement aux dimensions requises
3. **Pas de texte superposé** - Éviter les annotations ou marques d'eau
4. **Contenu approprié** - Pas de contenu offensant ou inapproprié
5. **Qualité** - Images nettes, pas floues ou pixelisées

## 🔗 Ressources Utiles

- [Apple - App Screenshot Specifications](https://developer.apple.com/app-store/app-screenshots/)
- [App Store Connect - Screenshot Requirements](https://help.apple.com/app-store-connect/#/devd274dd925)
- [Squoosh - Image Optimizer](https://squoosh.app/)
- [Responsively App](https://responsively.app/)

## 📞 Besoin d'Aide ?

Si vous avez des questions ou besoin d'aide pour automatiser le processus, n'hésitez pas à demander !

