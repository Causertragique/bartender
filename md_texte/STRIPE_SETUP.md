# Configuration Stripe Terminal

Ce guide explique comment configurer Stripe Terminal pour les paiements en personne avec carte.

## Important : Gestion par utilisateur

**Chaque utilisateur gère ses propres clés Stripe.** Cela signifie que :
- Chaque utilisateur doit avoir son propre compte Stripe
- Chaque utilisateur configure ses propres clés API dans les paramètres de l'application
- Les paiements sont traités avec les clés de l'utilisateur connecté
- Les clés sont stockées de manière sécurisée dans la base de données, associées à chaque utilisateur

## Prérequis

### Compte Stripe requis

**Oui, chaque utilisateur doit créer un compte Stripe complet.** Voici ce qui est nécessaire :

1. **Créer un compte Stripe** (https://stripe.com)
   - Inscription gratuite
   - Vérification d'identité (KYC) requise pour activer les paiements
   - Informations bancaires pour recevoir les fonds

2. **Activer Stripe Terminal** dans votre compte
   - Allez dans **Terminal** dans votre tableau de bord Stripe
   - Suivez les instructions pour activer Terminal
   - Commandez un lecteur Terminal (ou utilisez le mode simulation pour tester)

3. **Obtenir vos clés API**
   - Allez dans **Developers > API keys**
   - Copiez vos clés (test et/ou production)

### Matériel requis

- Un lecteur de carte Stripe Terminal (ou utiliser le mode simulation pour les tests)
  - **Stripe Reader M2** (Bluetooth) - ~$59 USD
  - **Stripe Reader S700** (USB/Internet) - ~$299 USD
  - **Stripe Reader S200** (Bluetooth) - ~$249 USD
  - Ou **mode simulation** (gratuit, pour les tests)

## Configuration

### 1. Créer et configurer votre compte Stripe

#### Étape 1 : Créer le compte

1. Allez sur https://stripe.com et cliquez sur **"Créer un compte"**
2. Remplissez les informations requises :
   - Email
   - Mot de passe
   - Informations sur votre entreprise/bar
   - Adresse
   - Numéro de téléphone
3. Vérifiez votre email
4. Complétez la vérification d'identité (KYC) - nécessaire pour activer les paiements

#### Étape 2 : Activer Stripe Terminal

1. Connectez-vous à votre [tableau de bord Stripe](https://dashboard.stripe.com)
2. Allez dans **Terminal** dans le menu de gauche
3. Suivez les instructions pour activer Terminal
4. Si vous avez un lecteur physique, enregistrez-le dans votre compte
5. Si vous testez, vous pouvez utiliser le **mode simulation** (gratuit)

#### Étape 3 : Obtenir les clés API

1. Dans votre tableau de bord Stripe, allez dans **Developers > API keys**
2. Vous verrez deux types de clés :
   - **Mode test** (pour tester sans frais réels)
   - **Mode production** (pour les vrais paiements)
3. Copiez votre **Secret key** :
   - Mode test : commence par `sk_test_`
   - Mode production : commence par `sk_live_`
4. Copiez votre **Publishable key** :
   - Mode test : commence par `pk_test_`
   - Mode production : commence par `pk_live_`

### 2. Configurer les clés dans l'application

1. Connectez-vous à l'application
2. Allez dans **Paramètres** (Settings)
3. Trouvez la section **"Configuration Stripe"**
4. Entrez vos clés :
   - **Clé secrète Stripe** : Votre Secret key (sk_test_... ou sk_live_...)
   - **Clé publique Stripe** : Votre Publishable key (pk_test_... ou pk_live_...)
   - **Location ID Terminal** (optionnel) : ID de location pour les lecteurs Terminal
   - **Mode test** : Activez pour tester sans frais réels
5. Cliquez sur **"Enregistrer les clés Stripe"**

**Note :** Les clés sont stockées de manière sécurisée et ne sont utilisées que pour vos propres transactions.

### 3. Configurer Stripe Terminal

#### Mode Test (Simulation)

Pour tester sans lecteur physique, le code utilise automatiquement le mode simulation. Aucune configuration supplémentaire n'est nécessaire. Assurez-vous simplement que le **Mode test** est activé dans les paramètres de l'application.

#### Mode Production

1. Dans votre tableau de bord Stripe, allez dans **Terminal > Locations**
2. Créez une location ou utilisez une location existante
3. Copiez le **Location ID** (commence par `tmloc_`)
4. Entrez ce Location ID dans la section **Configuration Stripe** des paramètres de l'application
5. Connectez votre lecteur Terminal via Bluetooth, USB ou Internet
6. Le lecteur sera automatiquement découvert par l'application

## Utilisation

### Dans l'application

1. Lors du paiement, sélectionnez **"Card Reader (Stripe Terminal)"**
2. L'application se connectera automatiquement au lecteur Terminal disponible
3. Une fois connecté, cliquez sur **"Pay"**
4. Insérez, tapez ou glissez la carte dans le lecteur
5. Le paiement sera traité automatiquement

### Types de lecteurs supportés

- **Stripe Reader M2** (Bluetooth)
- **Stripe Reader S700** (USB/Internet)
- **Stripe Reader S200** (Bluetooth)

## Tarification

### Frais Stripe

**Le compte Stripe est gratuit** - Pas de frais mensuels pour avoir un compte.

Les seuls frais sont :
- **Frais par transaction** : 2.6% + 0.10$ CAD par paiement réussi
- **Coût du lecteur** : Si vous achetez un lecteur Terminal (optionnel)

### Coût des lecteurs

Les lecteurs Terminal sont disponibles à l'achat :
- **Stripe Reader M2** : ~$59 USD (Bluetooth) - Le plus économique
- **Stripe Reader S200** : ~$249 USD (Bluetooth)
- **Stripe Reader S700** : ~$299 USD (USB/Internet)

Ou à la location (selon disponibilité dans votre région).

**Note importante** : Vous pouvez tester gratuitement avec le **mode simulation** sans acheter de lecteur.

### Comparaison avec Moneris

Comparé à Moneris, les tarifs sont similaires ou inférieurs :
- **Moneris** : généralement 2.5% - 3.5% + frais par transaction + frais mensuels possibles
- **Stripe** : 2.6% + 0.10$ CAD (tarif fixe, transparent)
- Pas de frais mensuels cachés avec Stripe
- Interface plus moderne et facile à utiliser

### Important

- **Chaque utilisateur paie ses propres frais Stripe** - Les frais sont déduits directement de votre compte Stripe
- Les fonds sont transférés sur votre compte bancaire selon le calendrier de Stripe (généralement 2-7 jours)
- Vous recevez un relevé détaillé de toutes les transactions dans votre tableau de bord Stripe

## Sécurité

- **Chaque utilisateur gère ses propres clés Stripe** - Les clés sont stockées dans la base de données, associées à chaque compte utilisateur
- Les clés sont stockées de manière sécurisée dans la base de données SQLite
- Les paiements sont traités via Stripe, conforme PCI-DSS
- Aucune donnée de carte n'est stockée localement
- Les connexions Terminal sont chiffrées
- Les clés ne sont utilisées que pour les transactions de l'utilisateur propriétaire
- Les clés secrètes ne sont jamais exposées au client (elles restent côté serveur)

## Dépannage

### Le lecteur n'est pas détecté

1. Vérifiez que le lecteur est allumé et à portée
2. Pour Bluetooth : activez le Bluetooth sur votre appareil
3. Pour USB : vérifiez la connexion USB
4. Pour Internet : vérifiez la connexion réseau du lecteur

### Erreur de connexion

1. Vérifiez que vos clés Stripe sont correctement configurées dans les paramètres de l'application
2. Vérifiez que vous êtes connecté à l'application (les clés sont associées à votre compte utilisateur)
3. Vérifiez que vous utilisez les bonnes clés (test vs production)
4. Vérifiez que le format des clés est correct (sk_test_... ou sk_live_... pour la clé secrète)
5. Vérifiez les logs du serveur pour plus de détails

### "Stripe keys not configured"

Cette erreur signifie que vous n'avez pas encore configuré vos clés Stripe. Allez dans **Paramètres > Configuration Stripe** et entrez vos clés API Stripe.

### Mode simulation

Si vous testez sans lecteur physique, le code utilisera automatiquement le mode simulation. Aucune configuration supplémentaire n'est nécessaire.

## Ressources

- [Documentation Stripe Terminal](https://stripe.com/docs/terminal)
- [Guide de démarrage Stripe Terminal](https://stripe.com/docs/terminal/quickstart)
- [API Reference Stripe Terminal](https://stripe.com/docs/terminal/reference)

