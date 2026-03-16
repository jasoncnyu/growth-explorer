import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { BlockMath } from "react-katex";
import { ChevronDown } from "lucide-react";
import ParameterSlider from "@/components/ParameterSlider";
import SolowCharts from "@/components/SolowCharts";
import SteadyStatePanel from "@/components/SteadyStatePanel";
import NavHeader from "@/components/NavHeader";
import { simulate, simulateLevels, computeSteadyState, goldenRuleSavingsRate, type SolowParams } from "@/lib/solow";
import { t, getLocale, setLocale, isRTL, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";

type PwtYearRow = {
  y: number;
  cn_m: number | null;
  emp_m: number | null;
  pop_m: number | null;
  labsh: number | null;
  rgdpna_m: number | null;
  rgdpo_m: number | null;
  ctfp: number | null;
  rtfpna: number | null;
};

type PwtCountry = {
  code: string;
  name: string;
  years: PwtYearRow[];
};

type PwtDataset = {
  source: string;
  generated: string;
  countries: Record<string, PwtCountry>;
};

const Index = () => {
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

  const [pwtData, setPwtData] = useState<PwtDataset | null>(null);
  const [pwtCountries, setPwtCountries] = useState<PwtCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("KOR");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [pwtError, setPwtError] = useState<string | null>(null);

  const [A0, setA0] = useState(1);
  const [KLevel0, setKLevel0] = useState(6_000_000_000_000);
  const [Lprod0, setLprod0] = useState(25_000_000);
  const [Lpop0, setLpop0] = useState(50_000_000);

  const [s, setS] = useState(0.3);
  const [alpha, setAlpha] = useState(0.33);
  const [alphaAuto, setAlphaAuto] = useState(true);
  const [delta, setDelta] = useState(0.05);
  const [n, setN] = useState(0.02);
  const [g, setG] = useState(0.02);
  const [k0, setK0] = useState(1);
  const [periods, setPeriods] = useState(30);
  const [activeChart, setActiveChart] = useState<"dynamics" | "levels" | "phase">("dynamics");
  const [steadyOpen, setSteadyOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(true);

  const applyCountry = useCallback((code: string, dataset: PwtDataset) => {
    const country = dataset.countries[code];
    if (!country) return;
    const rowsWithCore = country.years.filter(r =>
      r.cn_m !== null &&
      (r.pop_m !== null || r.emp_m !== null) &&
      (r.rgdpo_m !== null || r.rgdpna_m !== null),
    );
    const row = (rowsWithCore.length ? rowsWithCore[rowsWithCore.length - 1] : country.years[country.years.length - 1]);
    if (!row) return;

    const alphaValue = row.labsh !== null ? Math.max(0.01, Math.min(0.99, 1 - row.labsh)) : alpha;
    const LprodValue = (row.emp_m ?? row.pop_m ?? 0) * 1_000_000;
    const LpopValue = (row.pop_m ?? row.emp_m ?? 0) * 1_000_000;
    const Y0 = (row.rgdpo_m ?? row.rgdpna_m ?? 0) * 1_000_000;
    const K0 = (row.cn_m ?? 0) * 1_000_000;
    const A0Value = (K0 > 0 && LprodValue > 0)
      ? (Y0 / (Math.pow(K0, alphaValue) * Math.pow(LprodValue, 1 - alphaValue)))
      : A0;

    if (row.labsh !== null && alphaAuto) setAlpha(alphaValue);
    if (K0 > 0) setKLevel0(K0);
    if (LprodValue > 0) setLprod0(LprodValue);
    if (LpopValue > 0) setLpop0(LpopValue);
    if (Number.isFinite(A0Value) && A0Value > 0) setA0(A0Value);
    setSelectedYear(row.y);
  }, [A0, KLevel0, Lprod0, Lpop0, alpha, alphaAuto]);

  useEffect(() => {
    fetch("/data/pwt110.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load PWT data");
        return res.json();
      })
      .then((data: PwtDataset) => {
        setPwtData(data);
        const list = Object.values(data.countries).sort((a, b) => a.name.localeCompare(b.name));
        setPwtCountries(list);
      })
      .catch((err) => {
        setPwtError(String(err));
      });
  }, []);

  useEffect(() => {
    setAlphaAuto(true);
  }, [selectedCountry]);

  useEffect(() => {
    if (pwtData) applyCountry(selectedCountry, pwtData);
  }, [pwtData, selectedCountry, applyCountry]);

  const params: SolowParams = useMemo(() => ({ s, alpha, delta, n, g, k0, periods }), [s, alpha, delta, n, g, k0, periods]);
  const data = useMemo(() => simulate(params), [params]);
  const ss = useMemo(() => computeSteadyState(params), [params]);
  const goldenS = useMemo(() => goldenRuleSavingsRate(params), [params]);
  const levelParams = useMemo(
    () => ({ s, alpha, delta, n, g, A0, K0: KLevel0, Lprod0, Lpop0, periods }),
    [s, alpha, delta, n, g, A0, KLevel0, Lprod0, Lpop0, periods],
  );
  const levelData = useMemo(() => simulateLevels(levelParams), [levelParams]);
  const levelT0 = levelData[0];

  const formatCurrency = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    [],
  );
  const formatCurrencyCompact = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }),
    [],
  );
  const formatNumberCompact = useMemo(
    () => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }),
    [],
  );

  const formatNumber = useMemo(
    () => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }),
    [],
  );
  const toMillions = useCallback((value: number) => value / 1_000_000, []);
  const fromMillions = useCallback((value: number) => value * 1_000_000, []);

  useEffect(() => {
    setLocaleState(getLocale());
  }, [location.pathname]);

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
              <ParameterSlider
                label={t("capitalShare")}
                symbol="α"
                value={alpha}
                min={0.1}
                max={0.9}
                step={0.01}
                onChange={(v) => { setAlphaAuto(false); setAlpha(v); }}
              />
              <ParameterSlider label={t("depreciation")} symbol="δ" value={delta} min={0.01} max={0.2} step={0.005} onChange={setDelta} format={v => `${(v * 100).toFixed(1)}%`} />
              <ParameterSlider label={t("popGrowth")} symbol="n" value={n} min={0} max={0.1} step={0.005} onChange={setN} format={v => `${(v * 100).toFixed(1)}%`} />
              <ParameterSlider label={t("techGrowth")} symbol="g" value={g} min={0} max={0.1} step={0.005} onChange={setG} format={v => `${(v * 100).toFixed(1)}%`} />
              <ParameterSlider label={t("initialCapital")} symbol="k₀" value={k0} min={0.1} max={20} step={0.1} onChange={setK0} />
              <ParameterSlider label={t("simPeriods")} symbol="T" value={periods} min={20} max={150} step={10} onChange={setPeriods} format={v => `${v}`} />
            </div>

            <Collapsible open={steadyOpen} onOpenChange={setSteadyOpen}>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("steadyState")}</h3>
                  <CollapsibleTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className={`h-4 w-4 transition-transform ${steadyOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SteadyStatePanel kStar={ss.kStar} yStar={ss.yStar} cStar={ss.cStar} iStar={ss.iStar} goldenS={goldenS} currentS={s} />
                </CollapsibleContent>
              </div>
            </Collapsible>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("levelInputsTitle")}</h3>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{t("levelInputsCountry")}</label>
                <Select
                  value={selectedCountry}
                  onValueChange={(value) => setSelectedCountry(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pwtCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  {pwtError
                    ? `${t("pwtLoadError")}: ${pwtError}`
                    : `${t("pwtAutoCalibrated")}: ${selectedYear ?? "—"}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("levelInputsA0")}</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number.isFinite(A0) ? Number(A0.toFixed(2)) : 0}
                    onChange={(e) => setA0(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("levelInputsK0")}</label>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={Number.isFinite(KLevel0) ? Number(toMillions(KLevel0).toFixed(2)) : 0}
                    onChange={(e) => setKLevel0(fromMillions(Number(e.target.value)))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("levelInputsL0")}</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={Number.isFinite(Lprod0) ? Number(toMillions(Lprod0).toFixed(2)) : 0}
                    onChange={(e) => setLprod0(fromMillions(Number(e.target.value)))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("levelInputsP0")}</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={Number.isFinite(Lpop0) ? Number(toMillions(Lpop0).toFixed(2)) : 0}
                    onChange={(e) => setLpop0(fromMillions(Number(e.target.value)))}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{t("levelInputsImpliedY0")}: <span className="text-foreground">{levelT0 ? formatNumber.format(toMillions(levelT0.Y)) : "-"}</span></div>
                <div>{t("levelInputsImpliedWorker")}: <span className="text-foreground">{levelT0 ? formatCurrency.format(levelT0.yPerWorker) : "-"}</span></div>
                <div>{t("levelInputsImpliedCapita")}: <span className="text-foreground">{levelT0 ? formatCurrency.format(levelT0.yPerCapita) : "-"}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("formulas")}</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <BlockMath math={String.raw`\dot{k} = s f(k) - (n + g + \delta)k`} />
                <BlockMath math={String.raw`f(k) = k^{\alpha}`} />
                <BlockMath math={String.raw`k^* = \left(\frac{s}{n+g+\delta}\right)^{\frac{1}{1-\alpha}}`} />
                <BlockMath math={String.raw`s_{gold} = \alpha`} />
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
            <Collapsible open={dataOpen} onOpenChange={setDataOpen}>
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("numericalData")}</h3>
                  <CollapsibleTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className={`h-4 w-4 transition-transform ${dataOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="max-h-64 overflow-auto rounded-lg border border-border">
                    <table className="w-full text-xs font-mono">
                      <thead className="sticky top-0 bg-muted">
                        <tr>
                          {['t', 'k', 'y', 'c', 'i', '(n+g+?)k'].map(h => (
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
                </CollapsibleContent>
              </div>
            </Collapsible>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">{t("realGdpTitle")}</h3>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={levelData} margin={{ top: 10, right: 20, left: 5, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 11 }}
                      tickCount={8}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: `${t("period")} (t)`, position: "insideBottom", offset: -15, fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => formatCurrencyCompact.format(v)}
                      stroke="hsl(var(--muted-foreground))"
                      width={70}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => formatCurrency.format(v)}
                      stroke="hsl(var(--muted-foreground))"
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                      formatter={(value, name) => {
                        const v = Number(value);
                        if (name === t("realGdpTotal")) return [formatCurrencyCompact.format(v), name];
                        if (name === t("realGdpPerCapita")) return [formatCurrency.format(v), name];
                        return [formatNumber.format(v), name];
                      }}
                    />
                    <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 11, paddingBottom: 12, lineHeight: "22px" }} iconSize={10} />
                    <Line yAxisId="left" type="monotone" dataKey="Y" name={t("realGdpTotal")} stroke="hsl(var(--chart-output))" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="yPerCapita" name={t("realGdpPerCapita")} stroke="hsl(var(--chart-capital))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {[levelData[0], levelData[levelData.length - 1]].map(row => (
                  <div key={row?.t ?? "t"} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">t = {row?.t ?? 0}</div>
                    <div className="text-foreground">{t("realGdpTotal")}: <span className="text-primary">{row ? formatCurrencyCompact.format(row.Y) : "-"}</span></div>
                    <div className="text-foreground">{t("realGdpPerCapita")}: <span className="text-primary">{row ? formatCurrency.format(row.yPerCapita) : "-"}</span></div>
                    <div className="text-muted-foreground text-xs">{t("realGdpPopulation")}: {row ? formatNumberCompact.format(row.Lpop) : "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Index;
