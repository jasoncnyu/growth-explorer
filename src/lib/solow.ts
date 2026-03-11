export interface SolowParams {
  s: number;      // savings rate
  alpha: number;  // capital share
  delta: number;  // depreciation rate
  n: number;      // population growth rate
  g: number;      // tech growth rate
  k0: number;     // initial capital per effective worker
  periods: number;
}

export interface SolowDataPoint {
  t: number;
  k: number;   // capital per effective worker
  y: number;   // output per effective worker
  c: number;   // consumption per effective worker
  i: number;   // investment per effective worker
  breakEven: number; // (n+g+δ)k
}

export function computeSteadyState(params: SolowParams) {
  const { s, alpha, delta, n, g } = params;
  const denom = n + g + delta;
  const kStar = Math.pow(s / denom, 1 / (1 - alpha));
  const yStar = Math.pow(kStar, alpha);
  const cStar = (1 - s) * yStar;
  const iStar = s * yStar;
  return { kStar, yStar, cStar, iStar };
}

export function goldenRuleSavingsRate(params: SolowParams) {
  return params.alpha;
}

export function simulate(params: SolowParams): SolowDataPoint[] {
  const { s, alpha, delta, n, g, k0, periods } = params;
  const data: SolowDataPoint[] = [];
  let k = k0;

  for (let t = 0; t <= periods; t++) {
    const y = Math.pow(k, alpha);
    const i = s * y;
    const c = (1 - s) * y;
    const breakEven = (n + g + delta) * k;
    data.push({ t, k, y, c, i, breakEven });
    // Δk = sy^α - (n+g+δ)k
    const dk = i - breakEven;
    k = Math.max(k + dk, 0.001);
  }

  return data;
}
