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

export interface SolowLevelParams {
  s: number;      // savings rate
  alpha: number;  // capital share
  delta: number;  // depreciation rate
  n: number;      // population growth rate
  g: number;      // tech growth rate
  A0: number;     // initial technology level
  K0: number;     // initial capital stock
  Lprod0: number; // initial labor (workers)
  Lpop0: number;  // initial population
  periods: number;
}

export interface SolowLevelDataPoint {
  t: number;
  A: number;
  K: number;
  Lprod: number;
  Lpop: number;
  Y: number;
  C: number;
  I: number;
  yPerWorker: number;
  yPerCapita: number;
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
    // ?k = sy^α - (n+g+δ)k
    const dk = i - breakEven;
    k = Math.max(k + dk, 0.001);
  }

  return data;
}

export function simulateLevels(params: SolowLevelParams): SolowLevelDataPoint[] {
  const { s, alpha, delta, n, g, A0, K0, Lprod0, Lpop0, periods } = params;
  const data: SolowLevelDataPoint[] = [];
  let K = K0;

  for (let t = 0; t <= periods; t++) {
    const A = A0 * Math.pow(1 + g, t);
    const Lprod = Lprod0 * Math.pow(1 + n, t);
    const Lpop = Lpop0 * Math.pow(1 + n, t);
    const Y = A * Math.pow(K, alpha) * Math.pow(Lprod, 1 - alpha);
    const I = s * Y;
    const C = (1 - s) * Y;
    const yPerWorker = Lprod > 0 ? Y / Lprod : 0;
    const yPerCapita = Lpop > 0 ? Y / Lpop : 0;
    data.push({ t, A, K, Lprod, Lpop, Y, C, I, yPerWorker, yPerCapita });

    K = Math.max((1 - delta) * K + I, 0.001);
  }

  return data;
}
