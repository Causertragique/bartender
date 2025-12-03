# FAQ Stripe Terminal

## Questions fréquentes sur la configuration Stripe

### Dois-je créer un compte Stripe complet ?

**Oui, absolument.** Chaque utilisateur doit créer un compte Stripe complet pour utiliser Stripe Terminal. Voici pourquoi :

1. **Sécurité et conformité** : Stripe doit vérifier votre identité (KYC) pour se conformer aux réglementations bancaires
2. **Réception des fonds** : Vous devez fournir vos informations bancaires pour recevoir les paiements
3. **Gestion des transactions** : Votre compte Stripe vous permet de voir toutes vos transactions, remboursements, etc.
4. **Support** : Avec un compte complet, vous avez accès au support Stripe

### Combien coûte un compte Stripe ?

**Le compte Stripe est gratuit.** Il n'y a pas de frais mensuels pour avoir un compte Stripe.

Les seuls frais sont :
- **Frais par transaction** : 2.6% + 0.10$ CAD par paiement réussi
- **Coût du lecteur** : Si vous achetez un lecteur Terminal (optionnel, vous pouvez tester avec le mode simulation gratuitement)

### Puis-je tester sans créer de compte complet ?

**Oui, partiellement.** Vous pouvez :
- Créer un compte Stripe en mode test (gratuit, pas de vérification complète)
- Utiliser le mode simulation dans l'application (pas besoin de lecteur physique)
- Tester toutes les fonctionnalités sans frais

**Mais pour les vrais paiements**, vous devrez :
- Compléter la vérification d'identité (KYC)
- Fournir vos informations bancaires
- Activer le mode production

### Puis-je partager un compte Stripe entre plusieurs utilisateurs ?

**Non, ce n'est pas recommandé** pour plusieurs raisons :

1. **Sécurité** : Chaque utilisateur devrait avoir ses propres identifiants
2. **Traçabilité** : Il est difficile de savoir qui a fait quelle transaction
3. **Conformité** : Stripe vérifie l'identité de chaque compte
4. **Responsabilité** : En cas de problème, il est plus facile de tracer la source

**L'application est conçue pour que chaque utilisateur ait son propre compte Stripe.**

### Que se passe-t-il si je n'ai pas encore de compte Stripe ?

Vous pouvez toujours utiliser l'application, mais :
- Les paiements avec **Stripe Terminal** ne fonctionneront pas
- Vous pouvez toujours utiliser les autres méthodes de paiement (carte manuelle, Apple Pay, etc.)
- Vous pouvez créer votre compte Stripe plus tard et l'ajouter dans les paramètres

### Combien de temps prend la création d'un compte Stripe ?

- **Création du compte** : 5-10 minutes
- **Vérification email** : Immédiat
- **Vérification d'identité (KYC)** : 1-3 jours ouvrables (parfois instantané)
- **Activation des paiements** : Généralement immédiat après vérification

**Mode test** : Vous pouvez commencer immédiatement, sans vérification

### Puis-je utiliser Stripe Terminal sans lecteur physique ?

**Oui !** Vous pouvez utiliser le **mode simulation** qui :
- Est gratuit
- Ne nécessite pas de lecteur physique
- Permet de tester toutes les fonctionnalités
- Utilise des cartes de test (4242 4242 4242 4242, etc.)

C'est parfait pour :
- Tester l'application
- Former le personnel
- Démonstrations

### Dois-je payer pour le lecteur Terminal ?

**Non, ce n'est pas obligatoire.** Vous pouvez :
- Utiliser le mode simulation (gratuit)
- Acheter un lecteur plus tard si nécessaire
- Certains plans Stripe incluent des lecteurs gratuits (selon votre région)

### Comment recevrai-je mes paiements ?

1. Les clients paient avec leur carte
2. Stripe traite le paiement (2.6% + 0.10$ CAD de frais)
3. Les fonds sont déposés dans votre compte Stripe
4. Stripe transfère les fonds sur votre compte bancaire (généralement 2-7 jours)

Vous pouvez configurer la fréquence des transferts dans votre tableau de bord Stripe.

### Puis-je changer mes clés Stripe plus tard ?

**Oui, à tout moment.** Allez dans **Paramètres > Configuration Stripe** et modifiez vos clés. Les nouvelles clés seront utilisées immédiatement pour les nouveaux paiements.

### Que se passe-t-il si je supprime mes clés Stripe ?

Si vous supprimez vos clés :
- Les paiements Stripe Terminal ne fonctionneront plus
- Les autres méthodes de paiement continueront de fonctionner
- Vous pouvez réajouter vos clés à tout moment

### Puis-je utiliser plusieurs comptes Stripe ?

**Oui, mais un à la fois.** L'application utilise les clés de l'utilisateur connecté. Si vous avez plusieurs comptes Stripe, vous devrez vous déconnecter et vous reconnecter avec le compte approprié, ou créer plusieurs comptes utilisateur dans l'application.

### Support

Pour toute question sur Stripe :
- **Documentation Stripe** : https://stripe.com/docs
- **Support Stripe** : Disponible dans votre tableau de bord Stripe
- **Support Terminal** : https://stripe.com/docs/terminal

