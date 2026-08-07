# Data privacy and repository policy

## 사용 식별자

- 분석 조인에는 정수형 `user_id`, `order_id`, `product_id`, `inventory_item_id`를 사용한다.
- 퍼널 분석 예정 범위에서는 `session_id`를 세션 내 이벤트 연결에만 사용한다.
- 식별자는 원천 테이블 내부 조인 키이며 README, PDF, CSV 미리보기에는 행 단위로 공개하지 않는다.

## 공개 가능한 집계

- 월·코호트·상태·채널·카테고리 단위의 합계와 비율만 공개한다.
- 현재 공개 결과는 월별 `37행`, 코호트 `37행`, 리텐션 `444셀`이다.
- 집계 결과에는 이름, 이메일, 주소, IP 주소를 포함하지 않는다.

## 금지 PII

- `first_name`, `last_name`, `email`, `street_address`, `postal_code`, `latitude`, `longitude`, `user_geom`은 공개 산출물에 사용하지 않는다.
- `events.ip_address`, 세부 `city/state`, 원문 `uri`도 행 단위로 저장·출력·커밋하지 않는다.
- 연락처가 포함된 지원용 PDF는 공개 저장소에서 제외한다.

## 로그 정책

- 로그에는 쿼리명, dry-run 바이트, 행수, 실행 성공·실패만 기록한다.
- 고객 식별자와 PII 값은 stdout, 오류 메시지, 감사 로그에 기록하지 않는다.
- `logs/*.txt`와 `logs/known_issues.md`는 `.gitignore`로 저장소에서 제외한다.

## 저장소 비포함 항목

- `data/raw/*`, `data/processed/*`, `*.duckdb`, `.env`, `.env.*`, `credentials/`, `secrets/`는 비추적 대상이며 공개 예시 `.env.example`만 예외다.
- `reports/application_plan_private.pdf`는 지원자 연락처를 포함하므로 비추적 대상이다.
- 공개 저장소에는 집계 CSV, 차트, 공개 수행계획서, SQL 정의와 데이터 한계 문서만 포함한다.
