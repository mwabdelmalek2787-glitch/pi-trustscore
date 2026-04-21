import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

type Props = { open: boolean; onAccept: () => void };

export const PrivacyModal = ({ open, onAccept }: Props) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogContent
        className="glass max-w-lg [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl">{t("privacy.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("privacy.body")}</p>
        <Button onClick={onAccept} className="btn-brand h-11 w-full font-semibold">
          {t("privacy.agree")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
