import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wine,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/contexts/I18nContext";

export default function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("bartender-auth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
      navigate("/inventory");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError(t.home.fillAllFields);
      return;
    }

    try {
      if (isSignUp) {
        // Inscription
        console.log("Attempting to register:", formData.username);

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        let data: any = null;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse JSON from /api/auth/register", {
            error: parseError,
            status: response.status,
          });
        }

        console.log("Register response:", { status: response.status, data });

        if (!response.ok) {
          setError(data?.error || t.home.signUpError);
          return;
        }

        // Après inscription réussie, connecter automatiquement
        localStorage.setItem("bartender-auth", "authenticated");
        localStorage.setItem("bartender-username", formData.username);
        setIsAuthenticated(true);
        navigate("/inventory");
      } else {
        // Connexion
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        let data: any = null;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse JSON from /api/auth/login", {
            error: parseError,
            status: response.status,
          });
        }

        if (!response.ok) {
          setError(data?.error || t.home.loginError);
          return;
        }

        // Si 2FA est activé, on devra gérer ça plus tard
        // Pour l'instant, on connecte directement
        localStorage.setItem("bartender-auth", "authenticated");
        localStorage.setItem("bartender-username", formData.username);
        setIsAuthenticated(true);
        navigate("/inventory");
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.");
      } else {
        setError(t.home.generalError);
      }
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen w-full max-w-full overflow-x-hidden flex bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
        {/* Left Side - Logo and Welcome Section */}
        <div className="flex flex-col items-center justify-center text-center px-2 sm:px-4">
          <div className="flex justify-center mb-4 sm:mb-6 overflow-hidden">
            <picture>
              <source srcSet="/Logoaccueil.webp" type="image/webp" />
              <source srcSet="/Logoaccueil-optimized.png" type="image/png" />
              <img
                src="/Logoaccueil.png"
                alt="La Réserve"
                className="h-32 sm:h-36 md:h-40 w-auto max-w-full object-contain"
                width="160"
                height="160"
                loading="eager"
                // @ts-ignore - fetchpriority is valid HTML attribute
                fetchpriority="high"
              />
            </picture>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 break-words hyphens-auto">
            {t.home.title}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mt-1 px-2 break-words hyphens-auto">
            {t.home.subtitle}
          </p>
        </div>

        {/* Right Side - Login/Sign Up Card */}
        <div className="flex items-center justify-center px-2 sm:px-4">
          <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border-2 border-foreground/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {t.home.username}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={t.home.usernamePlaceholder}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="h-12 bg-background/50 border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 break-words">
                <Lock className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{t.home.password}</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.home.passwordPlaceholder}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 bg-background/50 border-border/50 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 font-semibold text-base"
            >
              {isSignUp ? t.home.createAccount : t.home.login}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t.home.or}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-background border-border hover:bg-secondary font-medium flex items-center justify-center gap-3"
                onClick={() => {
                  // TODO: Implement Google authentication
                  alert("Connexion Google - À implémenter");
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.home.continueWithGoogle}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-background border-border hover:bg-secondary font-medium flex items-center justify-center gap-3"
                onClick={() => {
                  // TODO: Implement Apple authentication
                  alert("Connexion Apple - À implémenter");
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.08-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {t.home.continueWithApple}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? t.home.alreadyHaveAccount : t.home.noAccountYet}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setFormData({ username: "", password: "" });
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? t.home.switchToLogin : t.home.switchToSignUp}
                </button>
              </p>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
