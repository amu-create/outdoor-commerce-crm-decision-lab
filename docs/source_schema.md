# theLook source schema

조회 기준일: 2026-08-07
BigQuery 프로젝트: `occl-analytics-2026`
공개 데이터셋: `bigquery-public-data.thelook_ecommerce`

이 문서는 `INFORMATION_SCHEMA.COLUMNS` 실제 조회 결과와 같은 실행에서 확인한 전체 테이블 행수를 기록한다. 시간 기반 분석은 `as_of_date=2026-08-07`을 적용한다.

## Table counts

| table_name | row_count |
|---|---:|
| users | 100000 |
| orders | 125158 |
| order_items | 181263 |
| products | 29120 |
| events | 2424927 |
| distribution_centers | 10 |
| inventory_items | 489651 |

## Columns

| table_name | ordinal_position | column_name | data_type | is_nullable |
|---|---:|---|---|---|
| distribution_centers | 1 | id | INT64 | YES |
| distribution_centers | 2 | name | STRING | YES |
| distribution_centers | 3 | latitude | FLOAT64 | YES |
| distribution_centers | 4 | longitude | FLOAT64 | YES |
| distribution_centers | 5 | distribution_center_geom | GEOGRAPHY | YES |
| events | 1 | id | INT64 | YES |
| events | 2 | user_id | INT64 | YES |
| events | 3 | sequence_number | INT64 | YES |
| events | 4 | session_id | STRING | YES |
| events | 5 | created_at | TIMESTAMP | YES |
| events | 6 | ip_address | STRING | YES |
| events | 7 | city | STRING | YES |
| events | 8 | state | STRING | YES |
| events | 9 | postal_code | STRING | YES |
| events | 10 | browser | STRING | YES |
| events | 11 | traffic_source | STRING | YES |
| events | 12 | uri | STRING | YES |
| events | 13 | event_type | STRING | YES |
| inventory_items | 1 | id | INT64 | YES |
| inventory_items | 2 | product_id | INT64 | YES |
| inventory_items | 3 | created_at | TIMESTAMP | YES |
| inventory_items | 4 | sold_at | TIMESTAMP | YES |
| inventory_items | 5 | cost | FLOAT64 | YES |
| inventory_items | 6 | product_category | STRING | YES |
| inventory_items | 7 | product_name | STRING | YES |
| inventory_items | 8 | product_brand | STRING | YES |
| inventory_items | 9 | product_retail_price | FLOAT64 | YES |
| inventory_items | 10 | product_department | STRING | YES |
| inventory_items | 11 | product_sku | STRING | YES |
| inventory_items | 12 | product_distribution_center_id | INT64 | YES |
| order_items | 1 | id | INT64 | YES |
| order_items | 2 | order_id | INT64 | YES |
| order_items | 3 | user_id | INT64 | YES |
| order_items | 4 | product_id | INT64 | YES |
| order_items | 5 | inventory_item_id | INT64 | YES |
| order_items | 6 | status | STRING | YES |
| order_items | 7 | created_at | TIMESTAMP | YES |
| order_items | 8 | shipped_at | TIMESTAMP | YES |
| order_items | 9 | delivered_at | TIMESTAMP | YES |
| order_items | 10 | returned_at | TIMESTAMP | YES |
| order_items | 11 | sale_price | FLOAT64 | YES |
| orders | 1 | order_id | INT64 | YES |
| orders | 2 | user_id | INT64 | YES |
| orders | 3 | status | STRING | YES |
| orders | 4 | gender | STRING | YES |
| orders | 5 | created_at | TIMESTAMP | YES |
| orders | 6 | returned_at | TIMESTAMP | YES |
| orders | 7 | shipped_at | TIMESTAMP | YES |
| orders | 8 | delivered_at | TIMESTAMP | YES |
| orders | 9 | num_of_item | INT64 | YES |
| products | 1 | id | INT64 | YES |
| products | 2 | cost | FLOAT64 | YES |
| products | 3 | category | STRING | YES |
| products | 4 | name | STRING | YES |
| products | 5 | brand | STRING | YES |
| products | 6 | retail_price | FLOAT64 | YES |
| products | 7 | department | STRING | YES |
| products | 8 | sku | STRING | YES |
| products | 9 | distribution_center_id | INT64 | YES |
| users | 1 | id | INT64 | YES |
| users | 2 | first_name | STRING | YES |
| users | 3 | last_name | STRING | YES |
| users | 4 | email | STRING | YES |
| users | 5 | age | INT64 | YES |
| users | 6 | gender | STRING | YES |
| users | 7 | state | STRING | YES |
| users | 8 | street_address | STRING | YES |
| users | 9 | postal_code | STRING | YES |
| users | 10 | city | STRING | YES |
| users | 11 | country | STRING | YES |
| users | 12 | latitude | FLOAT64 | YES |
| users | 13 | longitude | FLOAT64 | YES |
| users | 14 | traffic_source | STRING | YES |
| users | 15 | created_at | TIMESTAMP | YES |
| users | 16 | user_geom | GEOGRAPHY | YES |
