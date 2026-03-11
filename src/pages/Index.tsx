import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParameterSlider from "@/components/ParameterSlider";
import SolowCharts from "@/components/SolowCharts";
import SteadyStatePanel from "@/components/SteadyStatePanel";
import NavHeader from "@/components/NavHeader";
import { simulate, computeSteadyState, goldenRuleSavingsRate, type SolowParams } from "@/lib/solow";
import { t, getLocale, setLocale, isRTL, type Locale } from "@/lib/i18n";

const Index = () => {
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  const changeLocale = useCallback((l: Locale) => { setLocale(l); setLocaleState(l); }, []);

  const [s, setS] = useState(0.3);
  const [alpha, setAlpha] = useState(0.33);
  const [delta, setDelta] = useState(0.05);
  const [n, setN] = useState(0.02);
  const [g, setG] = useState(0.02);
  const [k0, setK0] = useState(1);
  const [periods, setPeriods] = useState(100);
  const [activeChart, setActiveChart] = useState<"dynamics" | "levels" | "phase">("dynamics");

  const params: SolowParams = useMemo(() => ({ s, alpha, delta, n, g, k0, periods }), [s, alpha, delta, n, g, k0, periods]);
  const data = useMemo(() => simulate(params), [params]);
  const ss = useMemo(() => computeSteadyState(params), [params]);
  const goldenS = useMemo(() => goldenRuleSavingsRate(params), [params]);

  // Force re-render on locale change by using locale in key places
  void locale;

  const dir = isRTL() ? "rtl" : "ltr";

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <NavHeader locale={locale} onLocaleChange={changeLocale} />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("parameters")}</h2>
              <ParameterSlider label={t("savingsRate")} symbol="s" value={s} min={0.01} max={0.8} step={0.01} onChange={setS} format={v => `${(v * 100).toFixed(0)}%`} />
              <ParameterSlider label={t("capitalShare")} symbol="α" value={alpha} min={0.1} max={0.9} step={0.01} onChange={setAlpha} />
              <ParameterSlider label={t("depreciation")} symbol="δ" value={delta} min={0.01} max={0.2} step={0.005} onChange={setDelta} format={v => `${(v * 100).toFixed(1)}%`} />
              <ParameterSlider label={t("popGrowth")} symbol="n" value={n} min={0} max={0.1} step={0.005} onChange={setN} format={v => `${(v * 100).toFixed(1)}%`} />
              <ParameterSlider label={t("techGrowth")} symbol="g" value={g} min={0} max={0.1} step={0.005} onChange={setG} format={v => `${(v * 100).toFixed(1)}%`} />
              <ParameterSlider label={t("initialCapital")} symbol="k₀" value={k0} min={0.1} max={20} step={0.1} onChange={setK0} />
              <ParameterSlider label={t("simPeriods")} symbol="T" value={periods} min={20} max={300} step={10} onChange={setPeriods} format={v => `${v}`} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <SteadyStatePanel kStar={ss.kStar} yStar={ss.yStar} cStar={ss.cStar} iStar={ss.iStar} goldenS={goldenS} currentS={s} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("formulas")}</h3>
              <div className="space-y-1.5 font-mono text-xs text-muted-foreground leading-relaxed">
                <p>Δk = sf(k) − (n+g+δ)k</p>
                <p>f(k) = k<sup>α</sup></p>
                <p>k* = (s/(n+g+δ))<sup>1/(1−α)</sup></p>
                <p>s<sub>gold</sub> = α</p>
              </div>
            </div>
          </motion.aside>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-xl border border-border bg-card p-6">
              <Tabs value={activeChart} onValueChange={(v) => setActiveChart(v as typeof activeChart)}>
                <TabsList className="mb-6">
                  <TabsTrigger value="dynamics">{t("tabDynamics")}</TabsTrigger>
                  <TabsTrigger value="levels">{t("tabLevels")}</TabsTrigger>
                  <TabsTrigger value="phase">{t("tabPhase")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <SolowCharts data={data} kStar={ss.kStar} activeChart={activeChart} />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">{t("numericalData")}</h3>
              <div className="max-h-64 overflow-auto rounded-lg border border-border">
                <table className="w-full text-xs font-mono">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      {["t", "k", "y", "c", "i", "(n+g+δ)k"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 30)) === 0 || i === data.length - 1).map(d => (
                      <tr key={d.t} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="px-3 py-1.5 text-foreground">{d.t}</td>
                        <td className="px-3 py-1.5 text-primary">{d.k.toFixed(3)}</td>
                        <td className="px-3 py-1.5 text-accent">{d.y.toFixed(3)}</td>
                        <td className="px-3 py-1.5">{d.c.toFixed(3)}</td>
                        <td className="px-3 py-1.5">{d.i.toFixed(3)}</td>
                        <td className="px-3 py-1.5">{d.breakEven.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Index;
