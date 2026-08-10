import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const WEB_ROOT = new URL("..", import.meta.url);
const approvedColors = new Set([
  "#12161a",
  "#1a2027",
  "#232b33",
  "#2e3a42",
  "#e8edf0",
  "#8a9ba5",
  "#7a9a6b",
  "#5b8aa6",
  "#e2703a",
  "#c4453a",
]);

const publicFiles = [
  "public/artifacts/monthly-kpi.png",
  "public/artifacts/cohort-retention.png",
  "public/artifacts/plan-onepager-public.pdf",
];
const approvedStack = ["Python", "BigQuery", "SQL", "pandas", "Matplotlib"];

function absolute(relativePath) {
  return new URL(relativePath, WEB_ROOT);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (["node_modules", ".next", "out"].includes(entry.name)) return [];
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

test("공개 콘텐츠는 검증된 핵심 수치를 동일 모집단 기준으로 유지한다", () => {
  const contentPath = absolute("content/site-content.json");
  assert.equal(existsSync(contentPath), true, "site-content.json이 필요합니다");
  const content = JSON.parse(readFileSync(contentPath, "utf8"));

  assert.deepEqual(content.evidence.map((item) => item.value), [
    "125,158건",
    "96,277건",
    "72,268건",
    "19개",
  ]);
  assert.equal(content.retention.pairedCohorts, 24);
  assert.equal(content.retention.m1, "2.0%");
  assert.equal(content.retention.m12, "1.8%");
  assert.equal(content.retention.delta, "약 0.1%p");
  assert.equal(content.retention.range, "1.7%~2.0%");
  assert.equal(content.monthly.netRevenueDelta, "+30.1%");
  assert.equal(content.monthly.orderDelta, "+29.6%");
  assert.equal(content.monthly.aovDelta, "+0.4%");

});

test("공개 기술 스택은 승인된 5종만 표시하고 검사 근거는 별도로 제공한다", () => {
  const content = JSON.parse(
    readFileSync(absolute("content/site-content.json"), "utf8"),
  );
  const publicStrings = collectStrings(content);
  const forbiddenTools = /\b(?:pytest|dbt|Jupyter|dagster|airflow)\b/gi;

  assert.deepEqual(content.hero.stack, approvedStack);
  assert.deepEqual(publicStrings.join(" ").match(forbiddenTools) ?? [], []);
  assert.equal(
    publicStrings.includes("오프라인 정합성 검사 19개 통과"),
    true,
  );
});

test("공개 표시 문자열에는 소수점 셋째 자리 이상이 없다", () => {
  const content = JSON.parse(
    readFileSync(absolute("content/site-content.json"), "utf8"),
  );
  const publicStrings = collectStrings(content);
  const overPrecise = publicStrings.flatMap(
    (value) => value.match(/\d+\.\d{3,}/g) ?? [],
  );

  assert.deepEqual(overPrecise, []);
});

test("공개 비율은 소수 첫째 자리까지만 표시한다", () => {
  const content = JSON.parse(
    readFileSync(absolute("content/site-content.json"), "utf8"),
  );
  const publicStrings = collectStrings(content);
  const overPreciseRates = publicStrings.flatMap(
    (value) => value.match(/\d+\.\d{2,}(?=%p?)/g) ?? [],
  );

  assert.deepEqual(overPreciseRates, []);
});

test("공개 금액은 소수점 없이 천 단위로 표시한다", () => {
  const content = JSON.parse(
    readFileSync(absolute("content/site-content.json"), "utf8"),
  );
  const publicStrings = collectStrings(content);

  assert.equal(
    publicStrings.some((value) =>
      value.includes("순매출 6,248,326, 총매출 8,324,326"),
    ),
    true,
  );
});

test("히어로 등고선은 완전 관측된 24개 코호트의 12개월 실측값을 사용한다", () => {
  const contourPath = absolute("content/retention-contours.json");
  assert.equal(existsSync(contourPath), true, "retention-contours.json이 필요합니다");
  const contours = JSON.parse(readFileSync(contourPath, "utf8"));
  assert.equal(contours.series.length, 24);
  assert.equal(contours.series.every((series) => series.values.length === 12), true);
});

test("공개 아티팩트는 허용된 3개만 동기화하고 비공개 PDF는 제외한다", () => {
  for (const file of publicFiles) {
    assert.equal(existsSync(absolute(file)), true, `${file}가 필요합니다`);
  }
  assert.equal(
    existsSync(
      absolute(
        `public/artifacts/${["application", "plan", "private.pdf"].join("_")}`,
      ),
    ),
    false,
    "비공개 PDF가 공개 경로에 존재합니다",
  );
});

test("웹 소스에는 금지 문자열과 승인되지 않은 hex 색상이 없다", () => {
  const root = WEB_ROOT.pathname.replace(/^\/(.:)/, "$1");
  const files = walk(root).filter((path) => /\.(css|json|mjs|tsx?)$/.test(path));
  const forbidden = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b01[016789]-?\d{3,4}-?\d{4}\b/i;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const name = relative(root, file);
    if (!name.startsWith("tests")) {
      assert.equal(forbidden.test(text), false, `${name}에 금지 문자열이 있습니다`);
    }
    for (const match of text.matchAll(/#[0-9a-f]{6}\b/gi)) {
      assert.equal(
        approvedColors.has(match[0].toLowerCase()),
        true,
        `${name}에 승인되지 않은 색상 ${match[0]}가 있습니다`,
      );
    }
  }
});

test("웹 루트에는 자동 추가되는 Markdown 지시 파일이 없다", () => {
  const root = WEB_ROOT.pathname.replace(/^\/(.:)/, "$1");
  const markdownFiles = readdirSync(root).filter((name) => name.endsWith(".md"));
  assert.deepEqual(markdownFiles, []);
  const config = readFileSync(absolute("next.config.mjs"), "utf8");
  assert.equal(config.includes("agentRules: false"), true);
});

test("공유 이미지는 flex 내부 br 태그에 줄바꿈을 의존하지 않는다", () => {
  const source = readFileSync(absolute("app/opengraph-image.tsx"), "utf8");
  assert.equal(source.includes("<br />"), false);
});

test("화면 링크는 실제 공개 근거만 가리킨다", () => {
  const content = JSON.parse(
    readFileSync(absolute("content/site-content.json"), "utf8"),
  );
  const hrefs = [
    ...content.hero.actions.map((action) => action.href),
    ...content.evidenceLinks.map((link) => link.href),
    ...content.finalActions.map((action) => action.href),
  ];

  assert.equal(hrefs.some((href) => href === "" || href === "#"), false);
  assert.equal(
    hrefs.every((href) => href.startsWith("https://github.com/") || href.startsWith("/artifacts/")),
    true,
  );
});
