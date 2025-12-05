import Layout from "@/components/Layout";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions d'utilisation</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant La Réserve ("le Service"), vous acceptez d'être lié par ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Description du service</h2>
            <p>
              La Réserve est une application de gestion d'inventaire pour bars et restaurants qui permet de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gérer l'inventaire de produits et recettes</li>
              <li>Suivre les ventes et transactions</li>
              <li>Obtenir des analyses et recommandations intelligentes</li>
              <li>Gérer les paiements via Stripe Terminal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Compte utilisateur</h2>
            <p className="mb-2">
              Pour utiliser le Service, vous devez créer un compte. Vous êtes responsable de :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Toutes les activités effectuées sous votre compte</li>
              <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Utilisation acceptable</h2>
            <p className="mb-2">Vous vous engagez à :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utiliser le Service de manière légale et conforme aux lois applicables</li>
              <li>Ne pas tenter d'accéder de manière non autorisée au Service</li>
              <li>Ne pas utiliser le Service pour des activités frauduleuses</li>
              <li>Ne pas perturber ou interférer avec le Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Données et contenu</h2>
            <p>
              Vous conservez tous les droits sur vos données. En utilisant le Service, vous nous accordez une licence
              pour stocker, traiter et afficher vos données dans le but de fournir le Service.
            </p>
            <p className="mt-2">
              Nous utilisons Firebase (Google Cloud) pour le stockage de vos données. Vos données sont stockées de manière
              sécurisée et ne sont accessibles que par vous et les systèmes nécessaires au fonctionnement du Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Paiements</h2>
            <p>
              Les fonctionnalités de paiement sont fournies via Stripe. En utilisant ces fonctionnalités, vous acceptez
              également les conditions d'utilisation de Stripe. Nous ne stockons pas vos informations de carte bancaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. Intelligence artificielle</h2>
            <p>
              Le Service utilise OpenAI pour fournir des analyses et recommandations. Ces suggestions sont générées
              automatiquement et doivent être considérées comme des outils d'aide à la décision, non comme des conseils
              professionnels définitifs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. Limitation de responsabilité</h2>
            <p>
              Le Service est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas responsables de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pertes de données ou interruptions de service</li>
              <li>Décisions prises sur la base des analyses fournies</li>
              <li>Problèmes liés aux services tiers (Firebase, Stripe, OpenAI)</li>
              <li>Dommages indirects ou consécutifs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. Résiliation</h2>
            <p>
              Vous pouvez cesser d'utiliser le Service à tout moment. Nous nous réservons le droit de suspendre ou
              résilier votre accès en cas de violation de ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet
              dès leur publication. Votre utilisation continue du Service constitue votre acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">11. Droit applicable</h2>
            <p>
              Ces conditions sont régies par les lois du Québec, Canada. Tout litige sera soumis à la juridiction
              exclusive des tribunaux du Québec.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">12. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse email associée à votre compte.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t text-sm">
            <p>Dernière mise à jour : 4 décembre 2025</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
