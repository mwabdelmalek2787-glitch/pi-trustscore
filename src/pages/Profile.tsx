import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getProfile, type Profile as ProfileT } from "@/lib/auth";
import { aiSentiment, recentRatings, scoreHistory } from "@/lib/mock";
import { scoreColor } from "@/components/TrustGauge";
import { AlertTriangle, ArrowLeft, Calendar, ShieldCheck, Sparkles } from "lucide-react";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (!p || !p.privacy_accepted) {
        navigate("/", { replace: true });
        return;
      }
      setProfile(p);
      setLoading(false);
    })();
  }, [navigate]);

  const data = useMemo(
    () => (profile ? scoreHistory(profile.pi_user_id, profile.trust_score) : []),
    [profile],
  );
  const ratings = useMemo(() => (profile ? recentRatings(profile.pi_user_id) : []), [profile]);
  const ai = profile ? aiSentiment(profile.pi_user_id) : 0.5;

  if (loading || !profile) return null;

  const score = profile.trust_score;
  const showPure = score > 700 && ai > 0.5;
  const showWarn = score < 300 && ai < 0.5;
  const color = scoreColor(score);

  const chartData = data.map((d) => ({ ...d, label: t(`months.${d.month}`) }));

  return (
    <div className="min-h-screen">
      <Header
        right={
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{t("profile.back")}</span>
          </Button>
        }
      />
      <main className="container py-8">
        <section className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-2xl font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
                {profile.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">@{profile.username}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("profile.joined")}{" "}
                  {new Date(profile.created_at).toLocaleDateString(i18n.language, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-6 sm:gap-8">
              <Stat label={t("profile.score")} value={String(score)} color={color} />
              <Stat label={t("profile.ratings")} value={String(ratings.length * 7)} />
            </div>
          </div>

          {(showPure || showWarn) && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${
                showPure
                  ? "border-success/30 bg-success/10"
                  : "border-destructive/30 bg-destructive/10"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  showPure ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                }`}
              >
                {showPure ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${showPure ? "text-success" : "text-destructive"}`}>
                  {showPure ? t("profile.badgePure") : t("profile.badgeWarn")}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {showPure ? t("profile.badgePureDesc") : t("profile.badgeWarnDesc")}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" /> {t("profile.aiNote")}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="glass mt-6 rounded-2xl p-6 sm:p-8">
          <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">
            {t("profile.evolution")}
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 1000]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#lineGrad)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-1 text-3xl font-extrabold tabular-nums" style={color ? { color } : undefined}>
      {value}
    </p>
  </div>
);

export default Profile;
