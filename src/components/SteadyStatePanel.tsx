import { motion } from "framer-motion";
import { t } from "@/lib/i18n";

interface SteadyStatePanelProps {
  kStar: number;
  yStar: number;
  cStar: number;
  iStar: number;
  goldenS: number;
  currentS: number;
}

const StatCard = ({ label, symbol, value, color }: { label: string; symbol: string; value: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-lg border border-border bg-card p-4 text-center"
  >
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className={`mt-1 font-mono text-2xl font-bold ${color}`}>{value.toFixed(3)}</p>
    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{symbol}</p>
  </motion.div>
);

const SteadyStatePanel = ({ kStar, yStar, cStar, iStar, goldenS, currentS }: SteadyStatePanelProps) => {
  const isGolden = Math.abs(currentS - goldenS) < 0.01;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("capital")} symbol="k*" value={kStar} color="text-primary" />
        <StatCard label={t("output")} symbol="y*" value={yStar} color="text-accent" />
        <StatCard label={t("consumption")} symbol="c*" value={cStar} color="text-[hsl(var(--chart-consumption))]" />
        <StatCard label={t("investment")} symbol="i*" value={iStar} color="text-[hsl(var(--chart-investment))]" />
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">
          {t("goldenRule")}: <span className="font-mono font-semibold text-foreground">{goldenS.toFixed(3)}</span>
        </p>
        <p className="mt-1 text-xs">
          {isGolden ? (
            <span className="text-accent font-medium">{t("goldenMatch")}</span>
          ) : currentS > goldenS ? (
            <span className="text-destructive font-medium">{t("overSaving")}</span>
          ) : (
            <span className="text-muted-foreground">{t("underSaving")}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default SteadyStatePanel;
