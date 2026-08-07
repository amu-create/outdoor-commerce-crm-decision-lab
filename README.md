# Outdoor Commerce CRM Decision Lab

![Project status: analysis in progress](https://img.shields.io/badge/status-analysis%20in%20progress-E2703A)

Outdoor Commerce CRM Decision Lab turns public synthetic fashion-commerce records into reproducible retention and CRM decisions. The current analysis uses BigQuery's theLook dataset and does not represent any retailer's private data or performance.

**Target completion date: 2026-08-15**

**Repository:** [github.com/amu-create/outdoor-commerce-crm-decision-lab](https://github.com/amu-create/outdoor-commerce-crm-decision-lab)
**One-page execution plan:** [reports/plan_onepager_public.pdf](reports/plan_onepager_public.pdf)

## Current evidence

### Monthly net revenue and margin rate

![Monthly net revenue and margin rate](reports/preview/01_monthly_kpi.png)

The analysis window retains `96,277` orders and `66,162` customers. Net revenue increased `30.1%` in 2026-07, driven by a `29.6%` increase in orders versus a `0.4%` increase in AOV. August 2026 is marked as a partial month through August 7.

### Cohort retention

![Cohort retention heatmap](reports/preview/02_cohort_retention.png)

감쇠가 관측되지 않음. [데이터 한계 참조](docs/limitations.md).

The cohort output contains `37` first-purchase months and `444` M+1-to-M+12 cells. `90` cells are censored and stored as NULL because their target month is not fully observed by `2026-08-07`.

## Five business questions this project answers

1. **Is monthly net-revenue growth driven by more orders or higher AOV?**
2. **Which first-purchase cohorts return in M+1 through M+12 after incomplete observation is censored?**
3. **How much gross revenue is removed by Cancelled and Returned orders, and what product-cost margin remains?**
4. **Which acquisition channels and first-purchase categories are associated with stronger repeat purchasing?**
5. **Which CRM audience should receive a campaign when repeat purchase, margin, and return rate are evaluated together?**

## Data source and disclosure

The source is `bigquery-public-data.thelook_ecommerce`, queried through project-scoped Application Default Credentials. The source provides `125,158` orders, `100,000` users, product costs, return statuses, acquisition sources, and behavior events.

theLook is synthetic public data, not actual company data. Campaign and treatment fields are absent, so this stage reports no campaign lift or causal commercial impact. Raw source files, credentials, customer names, email addresses, and addresses are not committed.

## Data limitations

- Signup-to-first-purchase time is distorted: P10 `28 days`, median `385 days`, and P90 `1,439 days`.
- Discounted items are `0/180,066`, so a discount-sensitive segment cannot be measured.
- Future order items and events are `1,197` rows each; time analysis is fixed at `as_of_date=2026-08-07`.

See [Data limitations and interpretation rules](docs/limitations.md) for the 12 quantified limitations, timestamp anomalies, censoring policy, and revenue reconciliation.

## Current status

- [x] Repository structure and public-release safeguards
- [x] BigQuery source access and seven-table smoke test
- [x] Actual source schema and fixed analysis window
- [x] Monthly KPI SQL, CSV, and trend chart
- [x] M+1-to-M+12 cohort-retention SQL, CSV, and heatmap
- [ ] Customer segments and channel/category retention decomposition
- [ ] Experiment design and decision dashboard
- [x] Reproducibility review and final one-page brief

## Reproduction

The source connection can be checked with:

```powershell
.venv\Scripts\python.exe src\smoke.py
```

The two reviewed queries are:

- [`sql/analysis/01_monthly_kpi.sql`](sql/analysis/01_monthly_kpi.sql)
- [`sql/analysis/02_repeat_rate.sql`](sql/analysis/02_repeat_rate.sql)

Their committed outputs are:

- [`reports/preview/01_monthly_kpi.csv`](reports/preview/01_monthly_kpi.csv)
- [`reports/preview/02_cohort_retention.csv`](reports/preview/02_cohort_retention.csv)
- [`reports/plan_onepager_public.pdf`](reports/plan_onepager_public.pdf)

Both queries use `2023-08-01` through `2026-08-07`, run with BigQuery Standard SQL, and were executed twice with matching SHA-256 output hashes.

## Technology stack

### In use

- **Python** for source access, deterministic execution, and artifact verification
- **BigQuery** for the public theLook dataset and query execution
- **SQL** for monthly KPI and cohort-retention definitions
- **pandas** for tabular result handling and CSV export
- **Matplotlib** for the two committed preview charts

### Planned work

- Customer segmentation and funnel analysis
- Experiment design and predictive modeling
- Decision dashboard and final reporting

Code and documentation use the [MIT License](LICENSE). Source datasets remain subject to their providers' separate terms.
