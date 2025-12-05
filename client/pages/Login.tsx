import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword } from "../services/firestore/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await signupWithEmail(email, password);
        toast({
          title: "Compte créé",
          description: "Bienvenue ! Votre compte a été créé avec succès.",
        });
      } else {
        await loginWithEmail(email, password);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
      }
      navigate("/inventory");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      navigate("/inventory");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Côté gauche - Logo uniquement */}
      <div className="hidden lg:flex lg:w-1/2 bg-background p-12 flex-col justify-between items-center">
        <div className="flex-1 flex items-center justify-center">
          <img src="/logo_bar.png" alt="Logo" className="h-64 w-auto drop-shadow-2xl" />
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="/privacy-policy" className="hover:text-foreground transition-colors">
            Politique de confidentialité
          </a>
          <span>•</span>
          <a href="/terms-of-service" className="hover:text-foreground transition-colors">
            Conditions d'utilisation
          </a>
        </div>
      </div>

      {/* Côté droit - Formulaire de connexion */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4 lg:hidden">
              <img src="/logo_bar.png" alt="Logo" className="h-20 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center">
              {isForgotPassword ? "Réinitialiser le mot de passe" : isSignup ? "Créer un compte" : "Connexion"}
            </CardTitle>
          <CardDescription className="text-center">
            {isForgotPassword
              ? "Entrez votre email pour recevoir un lien de réinitialisation"
              : isSignup
              ? "Créez votre compte pour gérer votre bar"
              : "Connectez-vous à votre compte"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 hover:underline font-medium"
                  onClick={() => setIsForgotPassword(false)}
                  disabled={loading}
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white" disabled={loading}>
              {loading ? "Chargement..." : isSignup ? "Créer mon compte" : "Se connecter"}
            </Button>
            {!isSignup && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-amber-700 hover:text-amber-800 hover:underline font-medium"
                  onClick={() => setIsForgotPassword(true)}
                  disabled={loading}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>
          )}

          {!isForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuer avec Google
          </Button>

          <div className="text-center text-sm">
            {isSignup ? (
              <>
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 hover:underline font-medium"
                  onClick={() => setIsSignup(false)}
                  disabled={loading}
                >
                  Se connecter
                </button>
              </>
            ) : (
              <>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 hover:underline font-medium"
                  onClick={() => setIsSignup(true)}
                  disabled={loading}
                >
                  Créer un compte
                </button>
              </>
            )}
          </div>
          </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
