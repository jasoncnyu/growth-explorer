import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { t, getLocale, setLocale, type Locale } from "@/lib/i18n";
import { useState, useCallback } from "react";

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: number * 0.05 }}
    className="flex gap-4"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
      {number}
    </div>
    <div className="flex-1 rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <div className="text-sm text-foreground/85 leading-relaxed space-y-2">{children}</div>
    </div>
  </motion.div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-border bg-card p-6 md:p-8"
  >
    <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
    <div className="text-sm text-foreground/90 leading-relaxed space-y-3">{children}</div>
  </motion.section>
);

const GuidePage = () => {
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  const changeLocale = useCallback((l: Locale) => { setLocale(l); setLocaleState(l); }, []);
  void locale;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader locale={locale} onLocaleChange={changeLocale} />
      <main className="container mx-auto px-6 py-8 max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("guideTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("guideSubtitle")}</p>
        </motion.div>

        {/* Quick start steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("guideQuickStart")}</h2>
          <Step number={1} title={t("guideStep1Title")}>
            <p>{t("guideStep1Desc")}</p>
          </Step>
          <Step number={2} title={t("guideStep2Title")}>
            <p>{t("guideStep2Desc")}</p>
          </Step>
          <Step number={3} title={t("guideStep3Title")}>
            <p>{t("guideStep3Desc")}</p>
          </Step>
          <Step number={4} title={t("guideStep4Title")}>
            <p>{t("guideStep4Desc")}</p>
          </Step>
        </div>

        {/* Parameter reference */}
        <Section title={t("guideParamsTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">{t("guideParamSymbol")}</th>
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">{t("guideParamName")}</th>
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">{t("guideParamRange")}</th>
                  <th className="text-left py-2 font-semibold text-muted-foreground">{t("guideParamDesc")}</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">s</td>
                  <td className="py-2 pr-4">{t("savingsRate")}</td>
                  <td className="py-2 pr-4">1% – 80%</td>
                  <td className="py-2 font-sans">{t("guideDescS")}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">α</td>
                  <td className="py-2 pr-4">{t("capitalShare")}</td>
                  <td className="py-2 pr-4">0.1 – 0.9</td>
                  <td className="py-2 font-sans">{t("guideDescAlpha")}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">δ</td>
                  <td className="py-2 pr-4">{t("depreciation")}</td>
                  <td className="py-2 pr-4">1% – 20%</td>
                  <td className="py-2 font-sans">{t("guideDescDelta")}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">n</td>
                  <td className="py-2 pr-4">{t("popGrowth")}</td>
                  <td className="py-2 pr-4">0% – 10%</td>
                  <td className="py-2 font-sans">{t("guideDescN")}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">g</td>
                  <td className="py-2 pr-4">{t("techGrowth")}</td>
                  <td className="py-2 pr-4">0% – 10%</td>
                  <td className="py-2 font-sans">{t("guideDescG")}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">k₀</td>
                  <td className="py-2 pr-4">{t("initialCapital")}</td>
                  <td className="py-2 pr-4">0.1 – 20</td>
                  <td className="py-2 font-sans">{t("guideDescK0")}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-primary font-semibold">T</td>
                  <td className="py-2 pr-4">{t("simPeriods")}</td>
                  <td className="py-2 pr-4">20 – 300</td>
                  <td className="py-2 font-sans">{t("guideDescT")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Charts explanation */}
        <Section title={t("guideChartsTitle")}>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">{t("tabDynamics")}</h3>
              <p>{t("guideChartDynamics")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("tabLevels")}</h3>
              <p>{t("guideChartLevels")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("tabPhase")}</h3>
              <p>{t("guideChartPhase")}</p>
            </div>
          </div>
        </Section>

        {/* Experiments */}
        <Section title={t("guideExperimentsTitle")}>
          <ul className="list-disc list-inside space-y-2">
            <li>{t("guideExp1")}</li>
            <li>{t("guideExp2")}</li>
            <li>{t("guideExp3")}</li>
            <li>{t("guideExp4")}</li>
            <li>{t("guideExp5")}</li>
          </ul>
        </Section>

        {/* Tips */}
        <Section title={t("guideTipsTitle")}>
          <ul className="list-disc list-inside space-y-2">
            <li>{t("guideTip1")}</li>
            <li>{t("guideTip2")}</li>
            <li>{t("guideTip3")}</li>
          </ul>
        </Section>
      </main>
    </div>
  );
};

export default GuidePage;
