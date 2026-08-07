-- Cohort definition
-- A purchase excludes Cancelled and Returned orders and uses orders.created_at.
-- Cohort month is the first valid purchase month across all history through
-- 2026-08-07, then restricted to first purchases from 2023-08-01 onward.
-- M+N is censored when that target calendar month is not fully observed by
-- 2026-08-07; censored retention rates are NULL.
-- One row per cohort keeps the committed CSV below the 300-line file limit.

WITH params AS (
  SELECT DATE '2023-08-01' AS analysis_start, DATE '2026-08-07' AS analysis_end
),
valid_orders AS (
  SELECT order_id, user_id, DATE(created_at) AS order_date
  FROM `bigquery-public-data.thelook_ecommerce.orders`
  CROSS JOIN params
  WHERE DATE(created_at) <= analysis_end
    AND status NOT IN ('Cancelled', 'Returned')
),
customer_cohorts AS (
  SELECT user_id, DATE_TRUNC(MIN(order_date), MONTH) AS cohort_month
  FROM valid_orders
  GROUP BY user_id
),
window_cohorts AS (
  SELECT c.*
  FROM customer_cohorts AS c
  CROSS JOIN params
  WHERE c.cohort_month BETWEEN DATE_TRUNC(analysis_start, MONTH)
                           AND DATE_TRUNC(analysis_end, MONTH)
),
cohort_sizes AS (
  SELECT cohort_month, COUNT(*) AS cohort_size
  FROM window_cohorts
  GROUP BY cohort_month
),
retention_activity AS (
  SELECT
    c.cohort_month,
    DATE_DIFF(DATE_TRUNC(o.order_date, MONTH), c.cohort_month, MONTH)
      AS month_number,
    COUNT(DISTINCT o.user_id) AS active_customers
  FROM window_cohorts AS c
  JOIN valid_orders AS o USING (user_id)
  WHERE DATE_DIFF(DATE_TRUNC(o.order_date, MONTH), c.cohort_month, MONTH)
    BETWEEN 1 AND 12
  GROUP BY c.cohort_month, month_number
),
cohort_grid AS (
  SELECT
    s.cohort_month,
    month_number,
    s.cohort_size,
    LAST_DAY(DATE_ADD(s.cohort_month, INTERVAL month_number MONTH))
      > p.analysis_end AS is_censored,
    COALESCE(a.active_customers, 0) AS active_customers
  FROM cohort_sizes AS s
  CROSS JOIN UNNEST(GENERATE_ARRAY(1, 12)) AS month_number
  CROSS JOIN params AS p
  LEFT JOIN retention_activity AS a USING (cohort_month, month_number)
),
retention_long AS (
  SELECT
    cohort_month,
    month_number,
    cohort_size,
    is_censored,
    IF(
      is_censored,
      NULL,
      ROUND(SAFE_DIVIDE(active_customers, cohort_size), 6)
    ) AS retention_rate
  FROM cohort_grid
)
SELECT
  cohort_month,
  MAX(cohort_size) AS cohort_size,
  MAX(IF(month_number = 1, retention_rate, NULL)) AS m1_retention_rate,
  MAX(IF(month_number = 2, retention_rate, NULL)) AS m2_retention_rate,
  MAX(IF(month_number = 3, retention_rate, NULL)) AS m3_retention_rate,
  MAX(IF(month_number = 4, retention_rate, NULL)) AS m4_retention_rate,
  MAX(IF(month_number = 5, retention_rate, NULL)) AS m5_retention_rate,
  MAX(IF(month_number = 6, retention_rate, NULL)) AS m6_retention_rate,
  MAX(IF(month_number = 7, retention_rate, NULL)) AS m7_retention_rate,
  MAX(IF(month_number = 8, retention_rate, NULL)) AS m8_retention_rate,
  MAX(IF(month_number = 9, retention_rate, NULL)) AS m9_retention_rate,
  MAX(IF(month_number = 10, retention_rate, NULL)) AS m10_retention_rate,
  MAX(IF(month_number = 11, retention_rate, NULL)) AS m11_retention_rate,
  MAX(IF(month_number = 12, retention_rate, NULL)) AS m12_retention_rate,
  COUNTIF(month_number = 1 AND is_censored) > 0 AS m1_is_censored,
  COUNTIF(month_number = 2 AND is_censored) > 0 AS m2_is_censored,
  COUNTIF(month_number = 3 AND is_censored) > 0 AS m3_is_censored,
  COUNTIF(month_number = 4 AND is_censored) > 0 AS m4_is_censored,
  COUNTIF(month_number = 5 AND is_censored) > 0 AS m5_is_censored,
  COUNTIF(month_number = 6 AND is_censored) > 0 AS m6_is_censored,
  COUNTIF(month_number = 7 AND is_censored) > 0 AS m7_is_censored,
  COUNTIF(month_number = 8 AND is_censored) > 0 AS m8_is_censored,
  COUNTIF(month_number = 9 AND is_censored) > 0 AS m9_is_censored,
  COUNTIF(month_number = 10 AND is_censored) > 0 AS m10_is_censored,
  COUNTIF(month_number = 11 AND is_censored) > 0 AS m11_is_censored,
  COUNTIF(month_number = 12 AND is_censored) > 0 AS m12_is_censored
FROM retention_long
GROUP BY cohort_month
ORDER BY cohort_month;
