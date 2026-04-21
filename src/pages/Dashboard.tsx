import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TrustGauge } from "@/components/TrustGauge";
import { clearProfile, getProfile } from "@/lib/auth";
import { recentRatings } from "@/lib/mock";
import { ArrowRight, LogOut, MessageSquare, TrendingDown, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const profile = getProfile();

  useEffect(() => {
    if (!profile || !profile.privacy_accepted) navigate("/", { replace: true });
  }, [profile, navigate]);

  const ratings = useMemo(() => (profile ? recentRatings(profile.pi_user_id) : []), [profile]);

  if (!profile) return null;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, { month: "short", day: "numeric" });

  const signOut = () => {
    clearProfile();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <Header
        right={
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("dashboard.signOut")}</span>
          </Button>
        }
      />
      <main className="container py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("dashboard.title")}</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">@{profile.username}</h1>
          </div>
          <Button onClick={() => navigate("/profile/me")} className="btn-brand gap-2">
            {t("dashboard.viewProfile")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("dashboard.trustScore")}
            </p>
            <TrustGauge score={profile.trust_score} label={t("dashboard.outOf")} />
          </section>

          <section className="glass rounded-2xl p-6">
            <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              {t("dashboard.recent")}
            </p>
            <ul className="space-y-3">
              {ratings.map((r) => {
                const positive = r.delta >= 0;
                return (
                  <li
                    key={r.id}
                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/40 p-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">@{r.rater}</p>
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            positive ? "text-success" : "text-destructive"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {r.delta}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" /> {r.comment}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {fmtDate(r.date)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
