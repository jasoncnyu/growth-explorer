# Changelog

## 2026-03-15

- Added PWT 11.0 data extraction to `public/data/pwt110.json` (185 countries, 1950–2023).
- Implemented country-driven calibration of level inputs (A₀, K₀, L₀) and auto-apply on selection.
- Switched capital input to PWT `cn` (capital stock at PPP, mil. 2021 US$) for USD-consistent scaling.
- Split labor (workers) vs population:
  - Production uses `emp` (labor).
  - Per-capita GDP uses `pop` (population).
- Added Real GDP (levels) chart with total GDP and per-capita GDP.
- Updated User Guide copy and simulation period max (150).
