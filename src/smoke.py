from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

import yaml
from google.cloud import bigquery


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "source.yaml"
EXPECTED_TABLES = (
    "users",
    "orders",
    "order_items",
    "products",
    "events",
    "distribution_centers",
    "inventory_items",
)
MAX_QUERY_BYTES = 5 * 1024**3


def load_config() -> dict[str, Any]:
    with CONFIG_PATH.open(encoding="utf-8") as stream:
        config = yaml.safe_load(stream)
    if not isinstance(config, dict):
        raise TypeError("config/source.yaml must contain a mapping")
    if config.get("source") != "thelook":
        raise ValueError(f"Unsupported selected source: {config.get('source')!r}")
    # 프로젝트 ID는 실행자마다 다르다. 환경변수 > config 순으로 해석한다.
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT") or config.get("project_id")
    if not project_id:
        raise SystemExit(
            "GCP 프로젝트 ID를 찾을 수 없습니다.\n"
            "  환경변수 GOOGLE_CLOUD_PROJECT 를 설정하거나\n"
            "  config/source.yaml 의 project_id 를 지정하세요.\n"
            "  BigQuery 없이 산출물만 확인하려면: python tests/test_offline.py"
        )
    config["project_id"] = project_id
    if config.get("dataset") != "bigquery-public-data.thelook_ecommerce":
        raise ValueError(f"Unexpected dataset: {config.get('dataset')!r}")
    tables = config.get("tables")
    if not isinstance(tables, dict) or tuple(tables) != EXPECTED_TABLES:
        raise ValueError(f"tables must be exactly: {EXPECTED_TABLES}")
    if any(not isinstance(value, int) or value <= 0 for value in tables.values()):
        raise ValueError("every configured table count must be a positive integer")
    return config


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    config = load_config()
    client = bigquery.Client(project=config["project_id"])
    dry_run_total = 0
    actual_scan_total = 0

    print("[SOURCE_DECISION]")
    print(f"source={config['source']}")
    print(f"project_id={config['project_id']}")
    print(f"dataset={config['dataset']}")
    print(f"decided_at={config['decided_at']}")
    print(f"as_of_date={config['as_of_date']}")
    print(f"reason={config['reason']}")
    print("randomness=none")

    for table_name, expected_count in config["tables"].items():
        sql = f"SELECT COUNT(*) AS row_count FROM `{config['dataset']}.{table_name}`"
        dry_job = client.query(
            sql,
            job_config=bigquery.QueryJobConfig(dry_run=True, use_query_cache=False),
        )
        dry_bytes = int(dry_job.total_bytes_processed or 0)
        print(f"[DRY_RUN] {table_name} bytes={dry_bytes}")
        if dry_bytes > MAX_QUERY_BYTES:
            raise RuntimeError(
                f"{table_name} query scans {dry_bytes} bytes, above 5GB limit"
            )
        dry_run_total += dry_bytes

        query_job = client.query(sql)
        rows = list(query_job.result())
        if len(rows) != 1:
            raise AssertionError(f"{table_name} count query returned {len(rows)} rows")
        actual_count = rows[0].row_count
        actual_bytes = int(query_job.total_bytes_processed or 0)
        actual_scan_total += actual_bytes
        if actual_count != expected_count:
            raise AssertionError(
                f"{table_name} count mismatch: expected={expected_count}, "
                f"actual={actual_count}"
            )
        print(
            f"[TABLE_COUNT] {table_name}={actual_count} "
            f"expected={expected_count} actual_scan_bytes={actual_bytes}"
        )

    print(f"[COST] dry_run_total_bytes={dry_run_total}")
    print(f"[COST] actual_scan_total_bytes={actual_scan_total}")
    print(f"[SMOKE_RESULT] PASS tables={len(EXPECTED_TABLES)} mismatches=0")


if __name__ == "__main__":
    main()
