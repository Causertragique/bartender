# Guide Complet : Publier sur l'App Store depuis Xcode

## 📋 Vue d'ensemble

Ce guide vous accompagne étape par étape pour publier votre application iOS sur l'App Store depuis Xcode.

**Temps estimé :** 2-4 heures (selon votre expérience)

---

## ⚠️ IMPORTANT : Avant de Commencer

**Si Xcode vous dit "ce n'est pas un projet iOS" :**

👉 **Vous devez d'abord créer un projet iOS !**

Consultez le guide : **`CREER_PROJET_IOS.md`**

Ce guide vous explique comment :
- Créer un nouveau projet Xcode iOS
- Ou utiliser Capacitor pour wrapper votre app web

**Une fois que vous avez un projet Xcode fonctionnel, revenez à ce guide.**

---

## ✅ PRÉREQUIS

Avant de commencer, assurez-vous d'avoir :

- [ ] Un compte **Apple Developer** actif ($99/an)
  - Inscription : https://developer.apple.com/programs/
- [ ] Xcode installé (dernière version recommandée)
- [ ] **Un projet iOS fonctionnel dans Xcode** (`.xcodeproj` ou `.xcworkspace`)
  - Si vous n'en avez pas, suivez `CREER_PROJET_IOS.md` d'abord
- [ ] Un iPhone/iPad pour tester (recommandé)

---

## 🚀 ÉTAPE 1 : Configuration du Projet dans Xcode

### 1.1 Ouvrir le Projet

1. Ouvrez Xcode
2. Ouvrez votre projet (`.xcodeproj` ou `.xcworkspace`)
3. Sélectionnez votre projet dans le navigateur de gauche

### 1.2 Configurer l'Identité de l'Application

**Comment trouver "Signing & Capabilities" :**

1. **Dans le panneau de gauche (Navigator)** :
   - Cliquez sur votre **projet** (icône bleue en haut, avec le nom de votre projet)
   - Vous devriez voir votre projet sélectionné dans le panneau central

2. **Dans le panneau central (Editor)** :
   - En haut, vous verrez plusieurs onglets : **General**, **Signing & Capabilities**, **Resource Tags**, **Info**, **Build Settings**, etc.
   - Cliquez sur l'onglet **"Signing & Capabilities"**

**Si vous ne voyez pas "Signing & Capabilities" :**

**Option A - Vérifier que vous avez sélectionné le bon élément :**
- Assurez-vous d'avoir cliqué sur le **projet** (icône bleue) et non sur un fichier
- Ensuite, dans le panneau central, cliquez sur votre **TARGET** (sous "TARGETS" dans la liste de gauche du panneau central)
- L'onglet "Signing & Capabilities" devrait apparaître en haut

**Option B - Utiliser le menu :**
- Cliquez sur votre projet (icône bleue)
- Dans le panneau central, sélectionnez votre **TARGET** (votre nom d'app sous "TARGETS")
- Les onglets devraient apparaître en haut : General, Signing & Capabilities, etc.

**Option C - Si vous utilisez une ancienne version de Xcode :**
- L'onglet peut s'appeler **"Signing"** (sans "& Capabilities")
- Ou allez dans **"Build Settings"** et cherchez "Code Signing"

**Structure visuelle :**
```
Navigateur (gauche)          Panneau Central
┌─────────────┐              ┌─────────────────────────────┐
│ 📁 Projet   │              │ TARGETS                      │
│   (bleu)    │─────────────▶│   ▶ Votre App                │
│             │              │                              │
│ 📁 Target   │              │ [General] [Signing & Cap...] │
│             │              │                              │
│ 📁 Fichiers │              │ Contenu de Signing...        │
└─────────────┘              └─────────────────────────────┘
```

#### Configuration de Base :

- **Bundle Identifier** : 
  - Format : `com.votrenom.lareserve` (ex: `com.guillaumehetu.lareserve`)
  - ⚠️ **IMPORTANT** : Ce Bundle ID doit être unique et correspondre à celui dans App Store Connect

- **Version** :
  - Version : `1.0.0` (ou votre version actuelle)
  - Build : `1` (incrémentez à chaque build)

- **Display Name** : 
  - Nom affiché sur l'iPhone : `La Réserve` (ou votre nom d'app)

### 1.3 Configurer le Signing

1. Cochez **"Automatically manage signing"** (recommandé)
2. Sélectionnez votre **Team** (votre compte Apple Developer)
3. Xcode générera automatiquement les certificats et provisioning profiles

**Si vous ne trouvez toujours pas "Signing & Capabilities" :**

1. **Vérifiez que vous avez bien un projet iOS :**
   - Le projet doit être un projet iOS (pas macOS, watchOS, etc.)
   - Vérifiez dans le panneau de gauche que vous voyez des fichiers `.swift` ou `.m`

2. **Essayez cette méthode alternative :**
   - Cliquez sur votre projet (icône bleue) dans le navigateur de gauche
   - Dans le panneau central, vous devriez voir une liste avec "PROJECT" et "TARGETS"
   - Cliquez sur votre **TARGET** (le nom de votre app, pas le projet)
   - Les onglets devraient maintenant apparaître en haut

3. **Vérifiez la version de Xcode :**
   - Menu : **Xcode > About Xcode** pour voir votre version
   - Dans Xcode 12+, l'onglet s'appelle "Signing & Capabilities"
   - Dans Xcode 11 et antérieur, cherchez "Signing" dans "General"

4. **Si vous utilisez un workspace (.xcworkspace) :**
   - Assurez-vous d'avoir ouvert le `.xcworkspace` et non le `.xcodeproj`
   - Sélectionnez le projet dans le navigateur
   - Puis sélectionnez le target

**Si vous avez des erreurs de signing :**
- Vérifiez que votre compte Apple Developer est bien connecté dans Xcode
- Allez dans **Xcode > Settings** (ou **Preferences** dans les anciennes versions) > **Accounts**
- Ajoutez votre compte si nécessaire
- Cliquez sur votre compte et vérifiez que votre Team apparaît

---

## 🎨 ÉTAPE 2 : Préparer les Assets (Icônes, Images)

### 2.1 Icône de l'Application

1. Dans Xcode, allez dans **Assets.xcassets**
2. Trouvez **AppIcon**
3. Ajoutez votre icône **1024x1024 pixels** (PNG, sans transparence)

**Tailles requises :**
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPhone)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPhone)
- 29x29 (iPhone)
- 20x20 (iPhone)

**Astuce :** Vous pouvez utiliser un outil comme [AppIcon.co](https://www.appicon.co/) pour générer toutes les tailles automatiquement.

### 2.2 Images de Lancement (Splash Screen)

1. Dans **Assets.xcassets**, créez un nouvel **Image Set** nommé `LaunchImage`
2. Ajoutez vos images de lancement pour différentes tailles d'écran

---

## 📱 ÉTAPE 3 : Configurer App Store Connect

### 3.1 Créer l'Application dans App Store Connect

1. Allez sur [App Store Connect](https://appstoreconnect.apple.com/)
2. Connectez-vous avec votre compte Apple Developer
3. Cliquez sur **"My Apps"**
4. Cliquez sur le **"+"** en haut à gauche
5. Sélectionnez **"New App"**

### 3.2 Remplir les Informations de Base

**Informations requises :**

- **Platform** : iOS
- **Name** : `La Réserve` (nom de l'app dans l'App Store)
- **Primary Language** : Français (ou votre langue principale)
- **Bundle ID** : Sélectionnez celui que vous avez créé (ou créez-en un nouveau)
  - Si vous n'avez pas de Bundle ID, créez-le dans [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
- **SKU** : Identifiant unique (ex: `lareserve-001`)
- **User Access** : Full Access (par défaut)

Cliquez sur **"Create"**

### 3.3 Remplir les Métadonnées

Une fois l'app créée, allez dans **"App Information"** et remplissez :

#### Informations de Base :

- **Category** :
  - Primary : **Business**
  - Secondary : **Food & Drink**

- **Privacy Policy URL** : 
  - URL de votre politique de confidentialité
  - Exemple : `https://votresite.com/privacy-policy`

#### Description et Marketing :

Allez dans **"App Store"** > **"1.0 Prepare for Submission"**

**Description complète** (jusqu'à 4000 caractères) :
```
La Réserve est l'application de gestion de bar professionnelle dont vous avez besoin pour gérer efficacement votre établissement. Conçue pour les bars, restaurants, cafés et établissements de restauration, elle combine simplicité et fonctionnalités avancées.

📦 GESTION D'INVENTAIRE

Gérez votre stock en temps réel avec un système intuitif. Suivez vos produits par catégories (Spiritueux, Vin, Bière, Boissons gazeuses, Jus, Autres), ajoutez des images, définissez des seuils d'alerte et recevez des notifications automatiques. Le scanner QR code intégré vous permet de retrouver instantanément n'importe quel produit. Exportez vos données en CSV ou Excel.

💰 POINT DE VENTE MODERNE

Interface rapide et efficace. Ajoutez des produits en quelques clics, gérez plusieurs onglets clients simultanément, calculez automatiquement les taxes selon votre région (Canada, États-Unis, Europe, Amérique Latine). Créez et vendez vos recettes et cocktails avec calcul de coût automatique. Intégration Stripe Terminal pour paiements en personne par carte.

📊 ANALYTICS & INTELLIGENCE ARTIFICIELLE

Insights précieux grâce à notre moteur d'analyse IA. Recommandations de cocktails basées sur vos ventes, détection d'anomalies, prédictions de rupture de stock, optimisation de menu. Analysez les tendances pour identifier vos meilleurs jours. Rapports de ventes et taxes détaillés.

🔐 SÉCURITÉ

Données stockées localement avec SQLite pour une confidentialité maximale. Authentification sécurisée avec double authentification (2FA). Chaque utilisateur gère son propre compte Stripe.

🌍 MULTILINGUE

S'adapte automatiquement à la langue de votre appareil (Français, Anglais, Allemand, Espagnol). Supporte de nombreuses devises et régions fiscales. Calculs de taxes automatiques.

✨ FONCTIONNALITÉS

• Inventaire en temps réel avec alertes
• Scanner QR code
• Point de vente multi-onglets
• Recettes avec calcul de coût
• Taxes automatiques (20+ régions)
• Stripe Terminal intégré
• Analytics IA avancés
• Rapports détaillés
• Export CSV/Excel
• Interface moderne
• Mode sombre
• Stockage local sécurisé

🎯 POUR QUI ?

Propriétaires de bars et restaurants, gérants d'établissements, gestionnaires de stocks, entrepreneurs du secteur hôtellerie-restauration.

💡 POURQUOI LA RÉSERVE ?

Alternative moderne, abordable et facile à utiliser. Interface intuitive, pas de formation nécessaire. Données sur votre appareil, contrôle total. Stripe intégré sans investissement matériel supplémentaire.

🚀 COMMENCEZ MAINTENANT

Téléchargez La Réserve et transformez la gestion de votre établissement. Créez votre compte en quelques secondes.

Support : contact@guillaumehetu.com
```

**Description courte** (jusqu'à 170 caractères) :
```
Gestion de bar professionnelle : inventaire, point de vente, analytics IA, Stripe Terminal. Pour bars, restaurants et cafés.
```

**Keywords** (jusqu'à 100 caractères) :
```
bar,restaurant,gestion,inventaire,point de vente,POS,cocktail,vente,stock,analytics,stripe,terminal
```

**Support URL** :
```
https://votresite.com/support
```
(ou votre email : `mailto:contact@guillaumehetu.com`)

**Marketing URL** (optionnel) :
```
https://votresite.com
```

### 3.4 Ajouter les Captures d'Écran

**Tailles requises :**

1. **iPhone 6.7"** (iPhone 14 Pro Max, 15 Pro Max) : **1290 x 2796 pixels**
2. **iPhone 6.5"** (iPhone 11 Pro Max, XS Max) : **1242 x 2688 pixels**
3. **iPhone 5.5"** (iPhone 8 Plus) : **1242 x 2208 pixels**
4. **iPad Pro 12.9"** : **2048 x 2732 pixels**
5. **iPad Pro 11"** : **1668 x 2388 pixels**

**Minimum :** 3 captures d'écran par taille

**Pages à capturer :**
1. Page d'accueil (authentification)
2. Page Inventaire
3. Page Ventes (point de vente)
4. Page Analytics
5. Page Paramètres

**Comment capturer :**
1. Utilisez le **Simulateur iOS** dans Xcode
2. Ou utilisez un **iPhone réel** avec Screenshot
3. Redimensionnez avec un outil comme [Squoosh](https://squoosh.app/) ou Photoshop

**Upload dans App Store Connect :**
1. Allez dans **"App Store"** > **"1.0 Prepare for Submission"**
2. Faites défiler jusqu'à **"Screenshots"**
3. Glissez-déposez vos captures d'écran pour chaque taille d'appareil

---

## 🔨 ÉTAPE 4 : Créer le Build de Production

### 4.1 Configurer le Schéma de Build

1. Dans Xcode, en haut à gauche, cliquez sur le schéma (à côté du bouton Play)
2. Sélectionnez **"Any iOS Device"** ou **"Generic iOS Device"**

### 4.2 Nettoyer le Projet

1. Menu : **Product > Clean Build Folder** (ou `Cmd + Shift + K`)

### 4.3 Archiver l'Application

1. Menu : **Product > Archive**
2. ⏳ Attendez que l'archive soit créée (peut prendre plusieurs minutes)
3. La fenêtre **Organizer** s'ouvrira automatiquement

### 4.4 Valider l'Archive

1. Dans l'**Organizer**, sélectionnez votre archive
2. Cliquez sur **"Validate App"**
3. Suivez les étapes :
   - Sélectionnez votre **Team**
   - Laissez les options par défaut
   - Cliquez sur **"Validate"**
4. ⏳ Attendez la validation (vérifie les erreurs)

**Si des erreurs apparaissent :**
- Corrigez-les dans Xcode
- Recommencez l'archivage

### 4.5 Distribuer vers App Store Connect

1. Dans l'**Organizer**, sélectionnez votre archive
2. Cliquez sur **"Distribute App"**
3. Sélectionnez **"App Store Connect"**
4. Cliquez sur **"Next"**
5. Sélectionnez **"Upload"** (pour uploader directement)
6. Cliquez sur **"Next"**
7. Laissez les options par défaut (inclure bitcode, etc.)
8. Cliquez sur **"Next"**
9. Sélectionnez votre **Team** et **Distribution Certificate**
10. Cliquez sur **"Next"**
11. Vérifiez les informations
12. Cliquez sur **"Upload"**
13. ⏳ Attendez que l'upload soit terminé (peut prendre 10-30 minutes)

**Alternative : Export pour upload manuel :**
- Si vous préférez uploader manuellement, sélectionnez **"Export"** au lieu de **"Upload"**
- Sauvegardez le fichier `.ipa`
- Utilisez **Transporter** (anciennement Application Loader) pour uploader

---

## 📤 ÉTAPE 5 : Finaliser dans App Store Connect

### 5.1 Attendre le Traitement du Build

1. Allez sur [App Store Connect](https://appstoreconnect.apple.com/)
2. Sélectionnez votre application
3. Allez dans **"App Store"** > **"1.0 Prepare for Submission"**
4. Faites défiler jusqu'à **"Build"**
5. ⏳ Attendez que votre build apparaisse (peut prendre 30 minutes à 2 heures)
6. Une fois disponible, sélectionnez votre build dans le menu déroulant

### 5.2 Remplir les Informations de Soumission

**Informations de Contact :**

- **App Review Information** :
  - **First Name** : Votre prénom
  - **Last Name** : Votre nom
  - **Phone Number** : Votre numéro de téléphone
  - **Email** : Votre email (ex: contact@guillaumehetu.com)
  - **Notes** (optionnel) : Instructions pour les reviewers si nécessaire
    - Exemple : "L'application nécessite une connexion internet pour fonctionner. Utilisez les identifiants de test fournis pour vous connecter."

**Version Information :**

- **What's New in This Version** (Release Notes) :
```
Version initiale de La Réserve
- Gestion d'inventaire en temps réel
- Point de vente avec Stripe Terminal
- Analytics avec IA
- Support multilingue
```

**App Review :**

- **Advertising Identifier** : Non (si vous n'utilisez pas d'IDFA)
- **Export Compliance** : 
  - Si votre app utilise du chiffrement, vous devrez peut-être remplir des informations supplémentaires
  - Pour la plupart des apps, sélectionnez "No"

**Content Rights :**

- **Content Rights** : Cochez la case si vous avez les droits sur tout le contenu

### 5.3 Ajouter les Informations de Pricing

1. Allez dans **"Pricing and Availability"**
2. Sélectionnez **"Price Schedule"**
3. Choisissez votre prix (gratuit ou payant)
4. Sélectionnez les pays où l'app sera disponible

### 5.4 Soumettre pour Review

1. Vérifiez que toutes les sections sont complètes :
   - ✅ Screenshots ajoutées
   - ✅ Description complète
   - ✅ Build sélectionné
   - ✅ Informations de contact
   - ✅ Politique de confidentialité
   - ✅ Version information

2. Cliquez sur **"Add for Review"** ou **"Submit for Review"**

3. Répondez aux questions de conformité :
   - **Export Compliance** : Généralement "No"
   - **Content Rights** : Cochez si applicable
   - **Advertising Identifier** : Généralement "No"

4. Cliquez sur **"Submit"**

5. ✅ **Félicitations !** Votre app est maintenant soumise pour review

---

## ⏳ ÉTAPE 6 : Attendre la Review

### 6.1 Statuts Possibles

- **Waiting for Review** : En attente de review
- **In Review** : En cours d'examen
- **Pending Developer Release** : Approuvée, en attente de publication
- **Ready for Sale** : Disponible sur l'App Store
- **Rejected** : Rejetée (vous recevrez des détails)

### 6.2 Temps de Review

- **Généralement :** 24-48 heures
- **Parfois :** Jusqu'à 7 jours
- **Première soumission :** Peut prendre plus de temps

### 6.3 Si l'App est Rejetée

1. Apple vous enverra un email avec les raisons
2. Allez dans App Store Connect pour voir les détails
3. Corrigez les problèmes mentionnés
4. Créez un nouveau build
5. Resoumettez

**Raisons communes de rejet :**
- Captures d'écran manquantes ou incorrectes
- Politique de confidentialité manquante
- Fonctionnalités qui ne fonctionnent pas
- Non-conformité aux guidelines Apple
- Informations de contact incorrectes

---

## ✅ CHECKLIST FINALE AVANT SOUMISSION

### Configuration Xcode
- [ ] Bundle Identifier configuré
- [ ] Version et Build Number définis
- [ ] Signing configuré correctement
- [ ] Icône 1024x1024 ajoutée
- [ ] Archive créée avec succès
- [ ] Build validé sans erreurs

### App Store Connect
- [ ] Application créée
- [ ] Description complète ajoutée (4000 caractères max)
- [ ] Description courte ajoutée (170 caractères max)
- [ ] Keywords ajoutés (100 caractères max)
- [ ] Captures d'écran pour toutes les tailles requises
- [ ] Politique de confidentialité URL ajoutée
- [ ] Support URL ajoutée
- [ ] Catégories sélectionnées (Business, Food & Drink)
- [ ] Build uploadé et sélectionné
- [ ] Informations de contact remplies
- [ ] Release notes ajoutées
- [ ] Pricing configuré

### Tests
- [ ] Testé sur iPhone réel
- [ ] Testé sur iPad (si supporté)
- [ ] Toutes les fonctionnalités testées
- [ ] Performance vérifiée
- [ ] Pas d'erreurs critiques

---

## 🆘 RÉSOLUTION DE PROBLÈMES

### Problème : "Je ne trouve pas Signing & Capabilities"

**Solution étape par étape :**

1. **Ouvrez Xcode et votre projet**

2. **Dans le panneau de gauche (navigateur de fichiers)** :
   - Cherchez l'icône bleue en haut (c'est votre projet)
   - Cliquez dessus une fois

3. **Dans le panneau central** :
   - Vous devriez voir deux sections : "PROJECT" et "TARGETS"
   - Sous "TARGETS", cliquez sur le nom de votre application (ex: "La Reserve" ou votre nom d'app)
   - ⚠️ **IMPORTANT** : Cliquez sur le TARGET, pas sur le PROJECT

4. **En haut du panneau central** :
   - Vous devriez maintenant voir les onglets : **General**, **Signing & Capabilities**, **Resource Tags**, etc.
   - Cliquez sur **"Signing & Capabilities"**

**Si ça ne fonctionne toujours pas :**

- **Méthode alternative via Build Settings :**
  1. Cliquez sur votre projet (icône bleue)
  2. Sélectionnez votre TARGET
  3. Cliquez sur l'onglet **"Build Settings"**
  4. Dans la barre de recherche en haut, tapez : `signing`
  5. Vous verrez "Code Signing Identity" et "Provisioning Profile"
  6. Pour une configuration plus simple, revenez à l'onglet "General" ou cherchez "Signing"

- **Vérifiez que vous avez bien un projet iOS :**
  - Menu : **File > Project Settings** (ou **File > Workspace Settings**)
  - Vérifiez que le SDK est bien iOS

**Capture d'écran mentale de ce que vous devriez voir :**
```
┌─────────────────────────────────────────────────┐
│ [General] [Signing & Capabilities] [Info] ...  │ ← Onglets ici
├─────────────────────────────────────────────────┤
│ Signing                                         │
│ ☑ Automatically manage signing                  │
│ Team: [Votre Team ▼]                            │
│ Bundle Identifier: com.xxx.xxx                  │
└─────────────────────────────────────────────────┘
```

### Erreur : "No signing certificate found"

**Solution :**
1. Allez dans **Xcode > Settings > Accounts**
2. Sélectionnez votre compte
3. Cliquez sur **"Download Manual Profiles"**
4. Ou cochez **"Automatically manage signing"** dans les paramètres du projet

### Erreur : "Bundle ID already exists"

**Solution :**
- Changez votre Bundle ID dans Xcode
- Ou utilisez celui qui existe déjà dans App Store Connect

### Erreur : "Invalid provisioning profile"

**Solution :**
1. Dans Xcode, allez dans **Signing & Capabilities**
2. Décochez puis recochez **"Automatically manage signing"**
3. Sélectionnez à nouveau votre Team

### Build n'apparaît pas dans App Store Connect

**Solutions :**
- Attendez 30 minutes à 2 heures
- Vérifiez que l'upload s'est bien terminé dans Xcode
- Vérifiez les emails d'App Store Connect pour les erreurs
- Vérifiez que le Bundle ID correspond

### Erreur lors de l'upload

**Solutions :**
- Vérifiez votre connexion internet
- Réessayez l'upload
- Utilisez **Transporter** (anciennement Application Loader) pour uploader manuellement

---

## 📚 RESSOURCES UTILES

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)

---

## 🎉 FÉLICITATIONS !

Une fois votre app approuvée, elle sera disponible sur l'App Store dans les 24 heures suivant l'approbation.

**Prochaines étapes après publication :**
- Surveillez les reviews et ratings
- Répondez aux commentaires utilisateurs
- Planifiez les mises à jour futures
- Analysez les métriques dans App Store Connect

---

**Support :** Pour toute question, consultez la documentation Apple ou contactez le support Apple Developer.

**Dernière mise à jour :** 2024

