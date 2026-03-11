import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { SolowDataPoint } from "@/lib/solow";
import { t } from "@/lib/i18n";

interface SolowChartsProps {
  data: SolowDataPoint[];
  kStar: number;
  activeChart: "dynamics" | "levels" | "phase";
}

const chartColors = {
  capital: "hsl(var(--chart-capital))",
  output: "hsl(var(--chart-output))",
  consumption: "hsl(var(--chart-consumption))",
  investment: "hsl(var(--chart-investment))",
  depreciation: "hsl(var(--chart-depreciation))",
  steady: "hsl(var(--chart-steady))",
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "0.8rem",
};

const fmt = (v: number) => Number(v.toFixed(2)).toString();

const tooltipFmt = (value: number) => value.toFixed(3);

const SolowCharts = ({ data, kStar, activeChart }: SolowChartsProps) => {
  // Thin data for phase diagram to avoid overlapping x-axis ticks
  const phaseData = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 50)) === 0 || i === data.length - 1);

  if (activeChart === "dynamics") {
    return (
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 5, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            tickCount={8}
            stroke="hsl(var(--muted-foreground))"
            label={{ value: `${t("period")} (t)`, position: "insideBottom", offset: -15, fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={fmt} stroke="hsl(var(--muted-foreground))" width={50} />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
          <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 11, paddingBottom: 12, lineHeight: "22px" }} iconSize={10} />
          <Line type="monotone" dataKey="k" name={`${t("capital")} (k)`} stroke={chartColors.capital} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="y" name={`${t("output")} (y)`} stroke={chartColors.output} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="c" name={`${t("consumption")} (c)`} stroke={chartColors.consumption} strokeWidth={2} dot={false} strokeDasharray="6 3" />
          <ReferenceLine y={kStar} stroke={chartColors.steady} strokeDasharray="4 4" label={{ value: "k*", position: "right", fill: chartColors.steady }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (activeChart === "levels") {
    return (
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 5, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            tickCount={8}
            stroke="hsl(var(--muted-foreground))"
            label={{ value: `${t("period")} (t)`, position: "insideBottom", offset: -15, fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={fmt} stroke="hsl(var(--muted-foreground))" width={50} />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
          <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 11, paddingBottom: 12, lineHeight: "22px" }} iconSize={10} />
          <Line type="monotone" dataKey="i" name={t("investLabel")} stroke={chartColors.investment} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="breakEven" name={t("breakEven")} stroke={chartColors.depreciation} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={420}>
      <LineChart data={phaseData} margin={{ top: 10, right: 20, left: 5, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="k"
          tick={{ fontSize: 11 }}
          tickCount={6}
          tickFormatter={fmt}
          stroke="hsl(var(--muted-foreground))"
          label={{ value: `${t("capital")} (k)`, position: "insideBottom", offset: -15, fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={fmt} stroke="hsl(var(--muted-foreground))" width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
        <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 11, paddingBottom: 12, lineHeight: "22px" }} iconSize={10} />
        <Line type="monotone" dataKey="y" name={t("prodFunc")} stroke={chartColors.output} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="i" name="sf(k)" stroke={chartColors.investment} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="breakEven" name="(n+g+δ)k" stroke={chartColors.depreciation} strokeWidth={2.5} dot={false} />
        <ReferenceLine x={kStar} stroke={chartColors.steady} strokeDasharray="4 4" label={{ value: "k*", position: "top", fill: chartColors.steady }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SolowCharts;
