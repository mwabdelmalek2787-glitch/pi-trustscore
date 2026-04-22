import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      app: { name: "Trust Score", tagline: "Your reputation, verified." },
      landing: {
        title: "Build trust on Pi Network",
        subtitle:
          "Your verifiable reputation score, powered by community ratings and AI insights.",
        signIn: "Sign in with Pi",
        outsidePi:
          "Please open this app inside the Pi Browser to sign in.",
      },
      privacy: {
        title: "Privacy Policy",
        body:
          "By using Trust Score, you agree to share your Pi username with us to create your public reputation profile. We do not access your wallet, payments, or private keys. We store only your username, trust score, and ratings activity. You can request deletion at any time.",
        agree: "I Agree & Continue",
      },
      auth: {
        piRequired: "This app must be opened inside Pi Browser to sign in.",
        signInFailed: "Pi sign-in failed. Please try again.",
        welcome: "Welcome, @{{username}}",
      },
      dashboard: {
        title: "Dashboard",
        trustScore: "Trust Score",
        outOf: "out of 1000",
        recent: "Recent ratings",
        viewProfile: "View my profile",
        signOut: "Sign out",
        ratedYou: "rated you",
      },
      profile: {
        title: "My Profile",
        joined: "Joined",
        ratings: "Ratings",
        score: "Trust score",
        badgePure: "Trusted Badge",
        badgePureDesc: "High community trust + positive AI sentiment.",
        badgeWarn: "Warning Badge",
        badgeWarnDesc: "Low community trust + negative AI sentiment.",
        aiNote: "Backed by community ratings + AI analysis",
        evolution: "Score evolution (last 6 months)",
        back: "Back to dashboard",
      },
      months: {
        jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
        jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
      },
    },
  },
  ar: {
    translation: {
      app: { name: "درجة الثقة", tagline: "سمعتك، موثّقة." },
      landing: {
        title: "ابنِ الثقة على شبكة Pi",
        subtitle:
          "درجة سمعتك القابلة للتحقق، مدعومة بتقييمات المجتمع وتحليلات الذكاء الاصطناعي.",
        signIn: "تسجيل الدخول عبر Pi",
        outsidePi: "الرجاء فتح التطبيق داخل متصفح Pi لتسجيل الدخول.",
      },
      privacy: {
        title: "سياسة الخصوصية",
        body:
          "باستخدامك تطبيق درجة الثقة، فإنك توافق على مشاركة اسم مستخدم Pi معنا لإنشاء ملفك العام للسمعة. لا نصل إلى محفظتك أو مدفوعاتك أو مفاتيحك الخاصة. نخزّن فقط اسم المستخدم، درجة الثقة، ونشاط التقييمات. يمكنك طلب الحذف في أي وقت.",
        agree: "أوافق وأتابع",
      },
      auth: {
        piRequired: "هذا التطبيق يتطلب فتحه داخل Pi Browser لتسجيل الدخول.",
        signInFailed: "فشل تسجيل الدخول عبر Pi. حاول مرة أخرى.",
        welcome: "مرحباً، @{{username}}",
      },
      dashboard: {
        title: "لوحة التحكم",
        trustScore: "درجة الثقة",
        outOf: "من 1000",
        recent: "آخر التقييمات",
        viewProfile: "عرض ملفي الشخصي",
        signOut: "تسجيل الخروج",
        ratedYou: "قيّمك",
      },
      profile: {
        title: "ملفي الشخصي",
        joined: "تاريخ الانضمام",
        ratings: "التقييمات",
        score: "درجة الثقة",
        badgePure: "شارة النقاء",
        badgePureDesc: "ثقة مجتمعية مرتفعة + تقييم AI إيجابي.",
        badgeWarn: "شارة تحذير",
        badgeWarnDesc: "ثقة مجتمعية منخفضة + تقييم AI سلبي.",
        aiNote: "مدعومة بتحليل المجتمع + تقييم AI",
        evolution: "تطور الدرجة (آخر 6 أشهر)",
        back: "الرجوع للوحة التحكم",
      },
      months: {
        jan: "يناير", feb: "فبراير", mar: "مارس", apr: "أبريل", may: "مايو", jun: "يونيو",
        jul: "يوليو", aug: "أغسطس", sep: "سبتمبر", oct: "أكتوبر", nov: "نوفمبر", dec: "ديسمبر",
      },
    },
  },
  fr: {
    translation: {
      app: { name: "Trust Score", tagline: "Votre réputation, vérifiée." },
      landing: {
        title: "Bâtissez la confiance sur Pi Network",
        subtitle:
          "Votre score de réputation vérifiable, propulsé par les évaluations communautaires et l'IA.",
        signIn: "Se connecter avec Pi",
        outsidePi:
          "Veuillez ouvrir l'application dans Pi Browser pour vous connecter.",
      },
      privacy: {
        title: "Politique de confidentialité",
        body:
          "En utilisant Trust Score, vous acceptez de partager votre nom d'utilisateur Pi pour créer votre profil public de réputation. Nous n'accédons pas à votre portefeuille, paiements ou clés privées. Nous stockons uniquement votre nom d'utilisateur, votre score et vos évaluations. Vous pouvez demander la suppression à tout moment.",
        agree: "J'accepte et continuer",
      },
      dashboard: {
        title: "Tableau de bord",
        trustScore: "Score de confiance",
        outOf: "sur 1000",
        recent: "Évaluations récentes",
        viewProfile: "Voir mon profil",
        signOut: "Se déconnecter",
        ratedYou: "vous a évalué",
      },
      profile: {
        title: "Mon profil",
        joined: "Inscrit le",
        ratings: "Évaluations",
        score: "Score de confiance",
        badgePure: "Badge de confiance",
        badgePureDesc: "Confiance communautaire élevée + sentiment IA positif.",
        badgeWarn: "Badge d'avertissement",
        badgeWarnDesc: "Confiance communautaire faible + sentiment IA négatif.",
        aiNote: "Soutenu par la communauté + analyse IA",
        evolution: "Évolution du score (6 derniers mois)",
        back: "Retour au tableau de bord",
      },
      months: {
        jan: "Jan", feb: "Fév", mar: "Mar", apr: "Avr", may: "Mai", jun: "Juin",
        jul: "Juil", aug: "Août", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Déc",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ar", "fr"],
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
    interpolation: { escapeValue: false },
  });

const applyDir = (lng: string) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
};
applyDir(i18n.language);
i18n.on("languageChanged", applyDir);

export default i18n;
