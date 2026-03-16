import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { t, getLocale, setLocale, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-border bg-card p-6 md:p-8"
  >
    <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
    <div className="prose-sm text-foreground/90 leading-relaxed space-y-3">{children}</div>
  </motion.section>
);

const Formula = ({ children }: { children: string }) => (
  <span className="inline-block font-mono text-sm bg-muted px-2 py-0.5 rounded text-primary">{children}</span>
);

const TheoryPage = () => {
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  const navigate = useNavigate();
  const location = useLocation();
  const localePattern = useMemo(
    () => new RegExp(`^/(${SUPPORTED_LOCALES.map((l) => l.code).join("|")})(?=/|$)`),
    [],
  );
  const changeLocale = useCallback((l: Locale) => {
    setLocale(l);
    setLocaleState(l);
    const nextPath = location.pathname.replace(localePattern, `/${l}`);
    navigate(`${nextPath}${location.search}`, { replace: true });
  }, [location.pathname, location.search, localePattern, navigate]);
  useEffect(() => {
    setLocaleState(getLocale());
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader locale={locale} onLocaleChange={changeLocale} />
      <main className="container mx-auto px-6 py-8 max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("theoryTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("theorySubtitle")}</p>
        </motion.div>

        <Section title={t("theoryOverviewTitle")}>
          <p>{t("theoryOverview1")}</p>
          <p>{t("theoryOverview2")}</p>
        </Section>

        <Section title={t("theoryAssumptionsTitle")}>
          <ul className="list-disc list-inside space-y-2">
            <li>{t("theoryA1")}</li>
            <li>{t("theoryA2")}</li>
            <li>{t("theoryA3")}</li>
            <li>{t("theoryA4")}</li>
            <li>{t("theoryA5")}</li>
          </ul>
        </Section>

        <Section title={t("theoryEquationsTitle")}>
          <p>{t("theoryEq1")}</p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
            <p>Y = F(K, AL) = K<sup>α</sup>(AL)<sup>1−α</sup></p>
            <p>y = Y/(AL), k = K/(AL)</p>
            <p>y = k<sup>α</sup></p>
          </div>
          <p>{t("theoryEq2")}</p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
            <p>Δk = sf(k) − (n + g + δ)k</p>
            <p>Δk = sk<sup>α</sup> − (n + g + δ)k</p>
          </div>
          <p>{t("theoryEq3")}</p>
        </Section>

        <Section title={t("theorySteadyTitle")}>
          <p>{t("theorySteady1")}</p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <p>k* = (s / (n + g + δ))<sup>1/(1−α)</sup></p>
            <p>y* = (k*)<sup>α</sup></p>
          </div>
          <p>{t("theorySteady2")}</p>
        </Section>

        <Section title={t("theoryGoldenTitle")}>
          <p>{t("theoryGolden1")}</p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <p>s<sub>gold</sub> = α</p>
            <p>c* = (1 − α) · (α / (n + g + δ))<sup>α/(1−α)</sup></p>
          </div>
          <p>{t("theoryGolden2")}</p>
        </Section>

        <Section title={t("theoryImplicationsTitle")}>
          <ul className="list-disc list-inside space-y-2">
            <li>{t("theoryImp1")}</li>
            <li>{t("theoryImp2")}</li>
            <li>{t("theoryImp3")}</li>
            <li>{t("theoryImp4")}</li>
          </ul>
        </Section>

        <Section title={t("theoryLimitationsTitle")}>
          <ul className="list-disc list-inside space-y-2">
            <li>{t("theoryLim1")}</li>
            <li>{t("theoryLim2")}</li>
            <li>{t("theoryLim3")}</li>
            <li>{t("theoryLim4")}</li>
          </ul>
        </Section>
      </main>
    </div>
  );
};

export default TheoryPage;
