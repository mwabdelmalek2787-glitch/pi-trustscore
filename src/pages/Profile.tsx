import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TrustGauge } from "@/components/TrustGauge";
import { getProfile, getSessionPiUid, type Profile } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!getSessionPiUid()) {
        navigate("/", { replace: true });
        return;
      }
      const p = await getProfile();
      if (!p) {
        navigate("/", { replace: true });
        return;
      }
      setProfile(p);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        right={
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{t("dashboard.title")}</span>
          </Button>
        }
      />
      <main className="container py-8">
        <div className="mx-auto max-w-xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            @{profile.username}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {t("dashboard.viewProfile")}
          </h1>

          <section className="glass mt-6 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("dashboard.trustScore")}
            </p>
            <TrustGauge score={profile.trust_score} label={t("dashboard.outOf")} />
          </section>

          <section className="glass mt-4 rounded-2xl p-6 text-sm text-muted-foreground">
            <div className="flex justify-between py-1">
              <span>Privacy accepted</span>
              <span className="font-medium text-foreground">
                {profile.privacy_accepted ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Member since</span>
              <span className="font-medium text-foreground">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
