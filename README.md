# Growth Explorer

Growth Explorer는 **Solow 성장모형을 실제 국가 데이터(PWT 11.0)에 연결해 시뮬레이션**하는 학습·탐구용 도구입니다.
국가를 선택하면 해당 국가의 최신 데이터로 **K, L, α, A₀**를 보정하고,
시간에 따른 **총 GDP, 1인당 GDP, 노동자 1인당 GDP**의 변화를 시각화합니다.

## Setup

```sh
npm i
npm run dev
```

## Tech

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Data Sources and Modeling Notes

This app uses **Penn World Table (PWT) 11.0** data extracted to a local JSON file for fast loading:

- Source file: `public/data/pwt110.json`
- Coverage: 185 countries, 1950–2023

### Variables used (PWT 11.0)

- `cn` (capital stock at current PPPs, in **million 2021 US$**)
  - Used as **K₀** (initial capital stock)
  - Converted to USD by multiplying by 1,000,000
- `rgdpo` (output-side real GDP at chained PPPs, in **million 2021 US$**)
  - Used as **Y₀** (initial output level)
  - Converted to USD by multiplying by 1,000,000
- `emp` (number of persons engaged, in **millions**)
  - Used as **L₀ (labor, workers)** for the production function
  - Converted to persons by multiplying by 1,000,000
- `pop` (population, in **millions**)
  - Used as **L₀ (population)** for **GDP per capita**
  - Converted to persons by multiplying by 1,000,000
- `labsh` (labor share of income)
  - Used to compute **α (capital share)** as `α = 1 - labsh`
  - If missing, the current UI slider value is retained
- `ctfp` / `rtfpna` (TFP indices)
  - Present in the JSON for optional use, but **not required** for core calibration

### Calibration / Estimated Components

Some values are **calibrated** from the data (not directly provided as raw levels):

- **A₀ (technology level)** is inferred to match the observed GDP level:
  - `A₀ = Y₀ / (K₀^α * L₀^(1-α))`
  - Here, **L₀ = emp** for production (workers), while population is used only for per-capita reporting.

### Fallback Rules

If a data field is missing for the selected country-year:

- `emp` falls back to `pop` for production labor.
- `pop` falls back to `emp` for per-capita population.
- `rgdpo` falls back to `rgdpna` for output.

### Notes on Interpretation

- The level simulation is in **PPP-adjusted 2021 US$** terms.
- Total GDP grows exponentially when `n` (population growth) and `g` (technology growth) are positive.
- The “GDP per worker” and “GDP per capita” lines differ because production uses workers while per-capita uses population.
