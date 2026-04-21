import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = ({ right }: { right?: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-primary-foreground shadow-[var(--shadow-glow)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight">{t("app.name")}</span>
        </Link>
        <div className="flex items-center gap-2">
          {right}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
