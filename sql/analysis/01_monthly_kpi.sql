-- Monthly KPI definition
-- Date basis: orders.created_at, not delivered_at.
-- Gross revenue: sum of order_items.sale_price for every order status.
-- Net revenue: excludes orders whose status is Cancelled or Returned.
-- Margin: net revenue minus products.cost for the same included items;
-- logistics, marketing, payment, and labor costs are not available.

WITH params AS (
  SELECT
    DATE '2023-08-01' AS analysis_start,
    DATE '2026-08-07' AS analysis_end
),
order_lines AS (
  SELECT
    DATE_TRUNC(DATE(o.created_at), MONTH) AS order_month,
    o.order_id,
    o.user_id,
    o.status AS order_status,
    oi.sale_price,
    p.cost
  FROM `bigquery-public-data.thelook_ecommerce.orders` AS o
  JOIN `bigquery-public-data.thelook_ecommerce.order_items` AS oi
    ON o.order_id = oi.order_id
   AND o.user_id = oi.user_id
  JOIN `bigquery-public-data.thelook_ecommerce.products` AS p
    ON oi.product_id = p.id
  CROSS JOIN params
  WHERE DATE(o.created_at) BETWEEN analysis_start AND analysis_end
),
monthly AS (
  SELECT
    order_month,
    SUM(IF(order_status NOT IN ('Cancelled', 'Returned'), sale_price, 0))
      AS net_revenue,
    SUM(sale_price) AS gross_revenue,
    COUNT(DISTINCT IF(
      order_status NOT IN ('Cancelled', 'Returned'), order_id, NULL
    )) AS order_count,
    COUNT(DISTINCT IF(
      order_status NOT IN ('Cancelled', 'Returned'), user_id, NULL
    )) AS purchasing_customers,
    SUM(IF(
      order_status NOT IN ('Cancelled', 'Returned'), sale_price - cost, 0
    )) AS margin
  FROM order_lines
  GROUP BY order_month
)
SELECT
  order_month,
  ROUND(net_revenue, 2) AS net_revenue,
  ROUND(gross_revenue, 2) AS gross_revenue,
  order_count,
  purchasing_customers,
  ROUND(SAFE_DIVIDE(net_revenue, order_count), 2) AS aov,
  ROUND(margin, 2) AS margin,
  ROUND(SAFE_DIVIDE(margin, net_revenue), 6) AS margin_rate,
  order_month = DATE_TRUNC((SELECT analysis_end FROM params), MONTH)
    AND (SELECT analysis_end FROM params)
      < LAST_DAY((SELECT analysis_end FROM params), MONTH) AS is_partial_month
FROM monthly
ORDER BY order_month;
