# Outdoor Commerce CRM Decision Lab

![Project status: work in progress](https://img.shields.io/badge/status-work%20in%20progress-E2703A)

Outdoor Commerce CRM Decision Lab is a reproducible portfolio project that turns public ecommerce records into defensible customer-retention and campaign decisions.

**Target completion date: 2026-08-15**

## Five business questions this project answers

1. **How are revenue, order volume, and average order value changing over time?** The analysis will separate growth from seasonality and changes in basket size.

2. **Which acquisition cohorts return within 90 days of their first purchase?** Cohort-level repurchase rates will show whether recent customers are becoming more valuable.

3. **Which customer segments deserve retention, reactivation, or lower-cost communication?** Recency, frequency, monetary value, and observed purchase behavior will support clear segment rules instead of arbitrary labels.

4. **Which product and order patterns are associated with repeat purchasing?** The project will compare categories, basket characteristics, and timing signals while distinguishing useful associations from causal claims.

5. **How should a CRM campaign be tested before it is scaled?** A documented experiment plan will define the target population, primary metric, guardrails, minimum detectable effect, and decision rule before results are examined.

## Data sources and disclosure

The analytical layer is designed for public ecommerce datasets. Before ingestion, each source will be documented with its provider, access date, licence or usage terms, table grain, and known limitations. Raw source files, credentials, and customer-identifying fields will not be committed to this repository.

Campaign and treatment fields that are unavailable in public records will be generated as clearly labelled synthetic data. Every generated row will carry `is_synthetic = TRUE`, and synthetic outcomes will be used to demonstrate workflow mechanics rather than claim real commercial impact. This project does not use private data, internal systems, or brand assets from Youngone Outdoor, The North Face, or any other retailer.

## Current status

- [x] Repository structure and public-release safeguards
- [x] Business scope and disclosure boundaries
- [ ] Public-data access smoke tests
- [ ] Standardized staging models and data-quality checks
- [ ] Monthly KPI, cohort, and customer-segment analyses
- [ ] Experiment design and decision dashboard
- [ ] Reproducibility review and final one-page brief

## Reproduction

End-to-end reproduction is **planned and not yet available**. The repository currently contains the project structure and documentation boundary, but it does not yet contain a runnable pipeline. As implementation progresses, this section will provide exact environment requirements, source-access instructions, deterministic seeds for generated data, commands for building models and tests, and expected output locations. Until those steps exist and have been run twice with matching results, this repository should not be treated as reproducible.

## Technology stack

- **Python** for source adapters, synthetic-data generation, and validation
- **DuckDB and SQL** for local analytical processing
- **dbt** for staged models, marts, documentation, and data tests
- **Jupyter notebooks** for auditable exploratory analysis
- **Pytest** for source contracts and transformation checks
- **A lightweight dashboard layer** for decision-focused review outputs

Code and documentation use the [MIT License](LICENSE). Source datasets remain subject to their providers' separate terms.
