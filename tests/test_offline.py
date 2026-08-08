"""BigQuery 인증 없이 커밋된 산출물을 검증한다.

검토자가 GCP 계정 없이 결과를 확인할 수 있도록 하는 것이 목적이다.

실행:
    python tests/test_offline.py          # 단독 실행
    pytest tests/test_offline.py -v       # pytest
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

MONTHLY_CSV = ROOT / "reports" / "preview" / "01_monthly_kpi.csv"
COHORT_CSV = ROOT / "reports" / "preview" / "02_cohort_retention.csv"
MONTHLY_PNG = ROOT / "reports" / "preview" / "01_monthly_kpi.png"
COHORT_PNG = ROOT / "reports" / "preview" / "02_cohort_retention.png"
PUBLIC_PDF = ROOT / "reports" / "plan_onepager_public.pdf"
README = ROOT / "README.md"
LIMITATIONS = ROOT / "docs" / "limitations.md"

EXPECTED_MONTHS = 37
EXPECTED_COHORTS = 37
EXPECTED_HORIZONS = 12
EXPECTED_CENSORED_CELLS = 90
WINDOW_START = "2023-08-01"
WINDOW_END = "2026-08-01"

# 전체 주문(취소·반품 포함) vs 유효 주문(Cancelled/Returned 제외)
ALL_ORDERS_IN_WINDOW = 96_277
VALID_ORDERS_IN_WINDOW = 72_268

# 코호트 패널: M+12 까지 완전 관측된 코호트만 감쇠 판정에 사용한다
OBSERVED_CELLS = 354
PAIRED_COHORTS = 24


def _read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    if not path.exists():
        raise AssertionError(f"파일 없음: {path.relative_to(ROOT).as_posix()}")
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        header = list(reader.fieldnames or [])
        rows = list(reader)
    return header, rows


def _num(value: str | None) -> float | None:
    text = (value or "").strip()
    if text == "" or text.lower() in {"null", "none", "nan"}:
        return None
    return float(text)


def _flag(value: str | None) -> bool:
    return (value or "").strip().lower() in {"true", "1", "yes"}


# ---------------------------------------------------------------- 산출물 존재
def test_artifacts_exist():
    required = (MONTHLY_CSV, COHORT_CSV, MONTHLY_PNG, COHORT_PNG,
                PUBLIC_PDF, README, LIMITATIONS)
    missing = [p.relative_to(ROOT).as_posix() for p in required if not p.exists()]
    assert not missing, f"누락된 산출물: {missing}"


# ------------------------------------------------------------- 월별 KPI CSV
def test_monthly_kpi_schema_and_shape():
    header, rows = _read_csv(MONTHLY_CSV)
    expected_cols = [
        "order_month", "net_revenue", "gross_revenue", "order_count",
        "purchasing_customers", "aov", "margin", "margin_rate",
        "is_partial_month",
    ]
    assert header == expected_cols, f"컬럼 불일치: {header}"
    assert len(rows) == EXPECTED_MONTHS, (
        f"행수 불일치: 기대 {EXPECTED_MONTHS}, 실제 {len(rows)}"
    )
    assert rows[0]["order_month"] == WINDOW_START, rows[0]["order_month"]
    assert rows[-1]["order_month"] == WINDOW_END, rows[-1]["order_month"]


def test_monthly_kpi_values_are_sane():
    _, rows = _read_csv(MONTHLY_CSV)
    for row in rows:
        month = row["order_month"]
        net = _num(row["net_revenue"])
        gross = _num(row["gross_revenue"])
        orders = _num(row["order_count"])
        customers = _num(row["purchasing_customers"])
        margin = _num(row["margin"])
        assert net and net > 0, f"{month} 순매출 이상: {net}"
        assert gross and gross >= net, f"{month} 총매출 < 순매출"
        assert orders and orders > 0, f"{month} 주문수 이상"
        assert customers and 0 < customers <= orders, f"{month} 구매고객수 이상"
        assert margin and 0 < margin < net, f"{month} 마진 이상: {margin}"


def test_margin_rate_is_derived_consistently():
    """margin_rate = margin / net_revenue 관계가 성립하는지 확인한다."""
    _, rows = _read_csv(MONTHLY_CSV)
    for row in rows:
        net = _num(row["net_revenue"])
        margin = _num(row["margin"])
        rate = _num(row["margin_rate"])
        assert rate is not None and 0 < rate < 1, f"{row['order_month']} 마진율 범위"
        derived = margin / net
        assert abs(derived - rate) < 5e-4, (
            f"{row['order_month']} 마진율 불일치: 기재 {rate:.6f}, 계산 {derived:.6f}"
        )


def test_exactly_one_partial_month_and_it_is_last():
    _, rows = _read_csv(MONTHLY_CSV)
    partial = [r["order_month"] for r in rows if _flag(r["is_partial_month"])]
    assert partial == [WINDOW_END], f"부분월 표기 이상: {partial}"


def test_documents_agree_with_csv_on_order_counts():
    """상수 하드코딩이 아니라 문서를 읽어서 CSV 실측과 대조한다.

    config/source.yaml 의 window_orders=96,277 은 취소·반품을 포함한
    전체 주문이고, 월별 KPI 는 Cancelled/Returned 를 제외한 값이다.
    """
    _, rows = _read_csv(MONTHLY_CSV)
    valid = sum(int(r["order_count"]) for r in rows)
    assert valid == VALID_ORDERS_IN_WINDOW, (
        f"유효 주문 합계 불일치: 기대 {VALID_ORDERS_IN_WINDOW}, 실제 {valid}"
    )
    assert valid < ALL_ORDERS_IN_WINDOW, "유효 주문이 전체 주문보다 많을 수 없음"

    text = README.read_text(encoding="utf-8")
    assert f"{valid:,}" in text, f"README 에 유효 주문 {valid:,} 표기 없음"
    assert f"{ALL_ORDERS_IN_WINDOW:,}" in text, "README 에 전체 주문 표기 없음"
    assert "모든 지표는 유효 주문 기준" not in text, (
        "gross_revenue 는 전체 상태 기준이므로 이 표현은 거짓"
    )


# --------------------------------------------------------- 코호트 리텐션 CSV
def test_cohort_schema_and_shape():
    header, rows = _read_csv(COHORT_CSV)
    rate_cols = [f"m{i}_retention_rate" for i in range(1, EXPECTED_HORIZONS + 1)]
    flag_cols = [f"m{i}_is_censored" for i in range(1, EXPECTED_HORIZONS + 1)]
    expected = ["cohort_month", "cohort_size", *rate_cols, *flag_cols]
    assert header == expected, f"컬럼 불일치: {header}"
    assert len(rows) == EXPECTED_COHORTS, (
        f"코호트 수 불일치: 기대 {EXPECTED_COHORTS}, 실제 {len(rows)}"
    )


def test_cohort_censored_cell_count():
    _, rows = _read_csv(COHORT_CSV)
    censored = sum(
        1
        for row in rows
        for i in range(1, EXPECTED_HORIZONS + 1)
        if _flag(row[f"m{i}_is_censored"])
    )
    total = len(rows) * EXPECTED_HORIZONS
    assert total == EXPECTED_COHORTS * EXPECTED_HORIZONS, f"셀 총수 {total}"
    assert censored == EXPECTED_CENSORED_CELLS, (
        f"절단 셀 불일치: 기대 {EXPECTED_CENSORED_CELLS}, 실제 {censored}"
    )


def test_censored_cells_are_null_and_observed_cells_are_not():
    """절단 플래그와 값의 존재 여부가 정확히 반대여야 한다."""
    _, rows = _read_csv(COHORT_CSV)
    for row in rows:
        month = row["cohort_month"]
        for i in range(1, EXPECTED_HORIZONS + 1):
            censored = _flag(row[f"m{i}_is_censored"])
            value = _num(row[f"m{i}_retention_rate"])
            if censored:
                assert value is None, f"{month} M+{i}: 절단인데 값이 있음"
            else:
                assert value is not None, f"{month} M+{i}: 관측인데 값이 없음"
                assert 0 <= value <= 1, f"{month} M+{i} 범위 이탈: {value}"


def test_cohort_sizes_are_positive():
    _, rows = _read_csv(COHORT_CSV)
    for row in rows:
        size = int(row["cohort_size"])
        assert size > 0, f"{row['cohort_month']} 코호트 크기 {size}"


def _fully_observed_cohorts() -> list[dict[str, str]]:
    """M+12 까지 전부 관측된 코호트만 반환한다."""
    _, rows = _read_csv(COHORT_CSV)
    return [
        row
        for row in rows
        if all(not _flag(row[f"m{i}_is_censored"])
               for i in range(1, EXPECTED_HORIZONS + 1))
    ]


def _paired_horizon_medians() -> list[float]:
    import statistics

    full = _fully_observed_cohorts()
    return [
        statistics.median([_num(r[f"m{h}_retention_rate"]) for r in full])
        for h in range(1, EXPECTED_HORIZONS + 1)
    ]


def test_paired_panel_is_large_enough():
    """감쇠 판정은 동일 관측기간 코호트로만 해야 한다."""
    full = _fully_observed_cohorts()
    assert len(full) == PAIRED_COHORTS, (
        f"완전 관측 코호트 불일치: 기대 {PAIRED_COHORTS}, 실제 {len(full)}"
    )


def _flatness_verdict(meds: list[float]) -> tuple[bool, str]:
    """horizon 중앙값 목록이 '평탄'한지 판정한다."""
    band = max(meds) - min(meds)
    decay = meds[0] - meds[-1]
    if band >= 0.010:
        return False, f"진폭 {band*100:.2f}%p"
    if abs(decay) >= 0.005:
        return False, f"감소폭 {decay*100:.2f}%p"
    if not all(0.005 < m < 0.05 for m in meds):
        return False, "중앙값 범위 이탈"
    return True, f"진폭 {band*100:.2f}%p / 감소폭 {decay*100:.2f}%p"


def test_retention_is_flat_on_paired_panel():
    """평탄성을 실제로 검증한다.

    'max < 20%' 같은 느슨한 조건은 극단적 감쇠(19%->0%)도 통과시키므로
    사용하지 않는다. horizon 중앙값의 진폭과 M+1->M+12 감소폭을 직접 본다.
    """
    flat, detail = _flatness_verdict(_paired_horizon_medians())
    assert flat, f"평탄 결론 재검토 필요: {detail}"


def test_flatness_check_actually_rejects_decay():
    """이 검사가 통과만 시키는 껍데기가 아님을 증명한다.

    실제 감쇠 곡선을 넣었을 때 반드시 거부되어야 한다.
    """
    decaying = [0.19, 0.10, 0.05, 0.03, 0.02, 0.01,
                0.008, 0.006, 0.005, 0.004, 0.003, 0.002]
    flat, _ = _flatness_verdict(decaying)
    assert not flat, "감쇠 곡선을 평탄으로 판정함 - 검사 로직 결함"

    gentle = [0.030, 0.028, 0.026, 0.024, 0.022, 0.020,
              0.019, 0.018, 0.017, 0.016, 0.015, 0.014]
    flat, _ = _flatness_verdict(gentle)
    assert not flat, "완만한 감쇠도 거부해야 함"


def test_observed_cell_count_matches_documents():
    """문서가 말하는 관측 셀 수와 실제가 같아야 한다."""
    _, rows = _read_csv(COHORT_CSV)
    observed = sum(
        1
        for r in rows
        for i in range(1, EXPECTED_HORIZONS + 1)
        if not _flag(r[f"m{i}_is_censored"])
    )
    assert observed == OBSERVED_CELLS, f"관측 셀 불일치: {observed}"
    text = README.read_text(encoding="utf-8") + LIMITATIONS.read_text(encoding="utf-8")
    assert str(observed) in text, f"문서에 관측 셀 수 {observed} 표기 없음"


def test_no_unproven_reproducibility_claims():
    """SQL->CSV 실행기가 없으면 재현성을 단정하지 않는다."""
    text = README.read_text(encoding="utf-8")
    if not (ROOT / "src" / "run_analysis.py").exists():
        for claim in ("SHA-256이 일치", "원본 데이터부터 재실행", "결정적 실행"):
            assert claim not in text, f"실행기 없이 주장: {claim}"


# ------------------------------------------------------------ 문서와 산출물
def test_readme_internal_links_resolve():
    text = README.read_text(encoding="utf-8")
    broken = []
    for target in re.findall(r"\]\(([^)\s]+)\)", text):
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        if not (ROOT / target.split("#")[0]).exists():
            broken.append(target)
    assert not broken, f"깨진 내부 링크: {broken}"


def test_readme_declares_synthetic_data():
    text = README.read_text(encoding="utf-8")
    assert re.search(r"합성|synthetic", text, re.IGNORECASE), "합성 데이터 고지 없음"


def test_no_unimplemented_tools_claimed_as_in_use():
    """미구현 도구가 사용 중으로 표기되지 않았는지 확인한다."""
    text = README.read_text(encoding="utf-8").lower()
    head = text.split("### 예정")[0] if "### 예정" in text else text
    for tool in ("dbt", "airflow", "dagster", "jupyter"):
        assert not re.search(rf"\b{tool}\b", head), f"미구현 도구 표기: {tool}"


def test_public_pdf_is_single_page():
    assert PUBLIC_PDF.read_bytes()[:4] == b"%PDF", "PDF 시그니처 불일치"
    try:
        from pypdf import PdfReader
    except ImportError:
        print("  (pypdf 미설치: 페이지 수 검증 생략)")
        return
    pages = len(PdfReader(str(PUBLIC_PDF)).pages)
    assert pages == 1, f"공개 수행계획서는 1페이지여야 함. 실제 {pages}"


# ---------------------------------------------------------------- 단독 실행
def _main() -> int:
    import sys

    # Windows 콘솔(cp949)에서도 한글 출력이 깨지지 않도록 한다
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    tests = [
        (name, func)
        for name, func in sorted(globals().items())
        if name.startswith("test_") and callable(func)
    ]

    print(f"offline verification - {len(tests)} checks")
    print("BigQuery 인증 없이 커밋된 산출물만 검증합니다.\n")

    passed, failed = 0, []
    for name, func in tests:
        try:
            func()
        except AssertionError as exc:
            failed.append(name)
            print(f"[FAIL]  {name}\n        {exc}")
        except Exception as exc:  # noqa: BLE001
            failed.append(name)
            print(f"[ERROR] {name}\n        {exc!r}")
        else:
            passed += 1
            print(f"[PASS]  {name}")

    print(f"\npassed={passed} failed={len(failed)}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(_main())
