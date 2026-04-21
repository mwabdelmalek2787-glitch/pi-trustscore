import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { PrivacyModal } from "@/components/PrivacyModal";
import { isPiBrowser, piAuthenticate } from "@/lib/pi";
import { acceptPrivacy, getProfile, upsertFromPi } from "@/lib/auth";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const inPi = isPiBrowser();

  useEffect(() => {
    document.title = "Trust Score — Pi Reputation";
  }, []);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p?.privacy_accepted) navigate("/dashboard", { replace: true });
      else if (p && !p.privacy_accepted) setShowPrivacy(true);
    })();
  }, [navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      if (!inPi) {
        // Dev fallback so UI is testable outside Pi Browser
        const mock = await upsertFromPi("dev-uid-001", "dev_user");
        if (mock.privacy_accepted) navigate("/dashboard");
        else setShowPrivacy(true);
        return;
      }
      const auth = await piAuthenticate();
      const p = await upsertFromPi(auth.user.uid, auth.user.username);
      if (p.privacy_accepted) navigate("/dashboard");
      else setShowPrivacy(true);
    } catch (e) {
      console.error(e);
      toast.error("Pi sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const onAccept = async () => {
    await acceptPrivacy();
    setShowPrivacy(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Pi Network · {t("app.tagline")}
        </div>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          {t("landing.title").split(" ").slice(0, -2).join(" ")}{" "}
          <span className="text-gradient">{t("landing.title").split(" ").slice(-2).join(" ")}</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("landing.subtitle")}
        </p>

        <Button
          onClick={handleSignIn}
          disabled={loading}
          className="btn-brand mt-10 h-14 px-10 text-base font-semibold"
        >
          <ShieldCheck className="h-5 w-5" /> {t("landing.signIn")}
        </Button>

        {!inPi && (
          <p className="mt-4 max-w-sm text-xs text-muted-foreground">{t("landing.outsidePi")}</p>
        )}

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, k: "Verified" },
            { icon: TrendingUp, k: "Reputation" },
            { icon: Sparkles, k: "AI Insights" },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-start">
              <f.icon className="mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-semibold">{f.k}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Built on Pi · Powered by community.
              </p>
            </div>
          ))}
        </div>
      </main>

      <PrivacyModal open={showPrivacy} onAccept={onAccept} />
    </div>
  );
};

export default Index;
