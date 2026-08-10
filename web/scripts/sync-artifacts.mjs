import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(webRoot, "..");
const artifactRoot = join(webRoot, "public", "artifacts");

const artifacts = [
  ["reports/preview/01_monthly_kpi.png", "monthly-kpi.png"],
  ["reports/preview/02_cohort_retention.png", "cohort-retention.png"],
  ["reports/plan_onepager_public.pdf", "plan-onepager-public.pdf"],
];

function requireFile(path) {
  if (!existsSync(path)) {
    throw new Error(`필수 파일 없음: ${path}`);
  }
}

mkdirSync(artifactRoot, { recursive: true });

for (const [source, destination] of artifacts) {
  const sourcePath = join(repoRoot, source);
  requireFile(sourcePath);
  copyFileSync(sourcePath, join(artifactRoot, destination));
}

const privateDestination = join(
  artifactRoot,
  ["application", "plan", "private.pdf"].join("_"),
);
if (existsSync(privateDestination)) {
  throw new Error(`비공개 PDF가 공개 경로에 존재함: ${privateDestination}`);
}

const cohortCsv = join(repoRoot, "reports", "preview", "02_cohort_retention.csv");
requireFile(cohortCsv);
const [headerLine, ...lines] = readFileSync(cohortCsv, "utf8").trim().split(/\r?\n/);
const header = headerLine.replace(/^\uFEFF/, "").split(",");
const index = Object.fromEntries(header.map((name, position) => [name, position]));

const series = lines
  .map((line) => line.split(","))
  .filter((row) =>
    Array.from({ length: 12 }, (_, offset) => offset + 1).every(
      (month) => row[index[`m${month}_is_censored`]] === "False",
    ),
  )
  .map((row) => ({
    cohort: row[index.cohort_month].slice(0, 7),
    values: Array.from({ length: 12 }, (_, offset) => offset + 1).map(
      (month) => Number(row[index[`m${month}_retention_rate`]]),
    ),
  }));

if (series.length !== 24 || series.some((row) => row.values.length !== 12)) {
  throw new Error(`등고선 입력 불일치: 코호트 ${series.length}개`);
}

const contourOutput = join(webRoot, "content", "retention-contours.json");
mkdirSync(dirname(contourOutput), { recursive: true });
writeFileSync(contourOutput, `${JSON.stringify({ series })}\n`, "utf8");

console.log(`public artifacts synced=${artifacts.length}`);
console.log(`retention contour cohorts=${series.length} horizons=${series[0].values.length}`);
