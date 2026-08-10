import Image from "next/image";
import { ContourField } from "../components/ContourField";
import content from "../content/site-content.json";
import contours from "../content/retention-contours.json";

const navigation = [
  ["summary", "30초 결론"],
  ["kpi", "월별 KPI"],
  ["retention", "코호트"],
  ["reality", "검증 범위"],
  ["evidence", "공개 근거"],
];

function EvidenceLink({ href, label }: { href: string; label: string }) {
  const external = href.startsWith("http");
  return (
    <a className="evidence-link" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function Status({ children }: { children: string }) {
  const state = children === "답변 가능" ? "possible" : children === "부분 가능" ? "partial" : "blocked";
  return <span className={`status status--${state}`}>{children}</span>;
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <header className="mobile-header">
        <span>OCCL / FIELD REPORT</span>
        <nav aria-label="모바일 목차">
          {navigation.slice(0, 4).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </header>

      <div className="shell">
        <aside className="rail">
          <a className="rail-mark" href="#top" aria-label="페이지 맨 위로">OCCL</a>
          <nav aria-label="페이지 목차">
            {navigation.map(([id, label], index) => (
              <a key={id} href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>
            ))}
          </nav>
          <div className="rail-freshness"><span>AS OF</span><time dateTime="2026-08-07">2026-08-07</time></div>
        </aside>

        <main id="main">
          <section className="hero" id="top" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1 id="hero-title">{content.hero.title}</h1>
              <p className="hero-definition">{content.hero.definition}</p>
              <p className="application-note">{content.hero.application}</p>
              <div className="hero-actions">
                {content.hero.actions.map((action, index) => (
                  <a key={action.href} className={index === 0 ? "button button--primary" : "button"} href={action.href} target="_blank" rel="noreferrer">{action.label}</a>
                ))}
              </div>
              <ul className="stack-list" aria-label="검증된 사용 기술">
                {content.hero.stack.map((technology) => <li key={technology}>{technology}</li>)}
              </ul>
            </div>
            <div className="hero-visual">
              <ContourField series={contours.series} />
              <div className="contour-note"><strong>24개 paired cohorts</strong><span>M+1 1.9684% → M+12 1.8353%</span></div>
            </div>
            <p className="disclosure"><span>SYNTHETIC DATA</span>{content.hero.disclosure}</p>
          </section>

          <section className="section" id="summary" aria-labelledby="summary-title">
            <div className="section-heading"><p>01 / EXECUTIVE SUMMARY</p><h2 id="summary-title">30초 결론</h2><span>검증된 숫자만 표시</span></div>
            <div className="summary-grid">
              {content.summary.map((item) => (
                <article className="summary-card" key={item.index}>
                  <span className="summary-index">{item.index}</span><h3>{item.title}</h3>
                  <p><strong>관측</strong>{item.observation}</p><p><strong>판단</strong>{item.decision}</p>
                </article>
              ))}
            </div>
            <dl className="evidence-strip">
              {content.evidence.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd><span>{item.detail}</span></div>)}
            </dl>
          </section>

          <section className="section chart-section" id="kpi" aria-labelledby="kpi-title">
            <div className="section-heading"><p>02 / MONTHLY KPI</p><h2 id="kpi-title">성장은 무엇이 만들었는가</h2><span>37개월 · 부분월 1개</span></div>
            <figure className="chart-frame">
              <Image src="/artifacts/monthly-kpi.png" alt={content.monthly.imageAlt} width={1600} height={900} sizes="(max-width: 900px) 100vw, 70vw" priority />
              <figcaption>{content.monthly.partialMonth}</figcaption>
            </figure>
            <div className="reasoning-grid">
              <div><span>관측</span><strong>{content.monthly.netRevenueDelta}</strong><p>2026년 7월 순매출 전월 대비</p></div>
              <div><span>원인</span><strong>{content.monthly.orderDelta} / {content.monthly.aovDelta}</strong><p>주문수 증가 / AOV 증가</p></div>
              <div><span>의사결정</span><p>주문 밀도 변화가 주도했습니다. 합성 데이터 생성 특성과 실제 사업 성장을 분리합니다.</p></div>
            </div>
          </section>

          <section className="section chart-section" id="retention" aria-labelledby="retention-title">
            <div className="section-heading"><p>03 / COHORT RETENTION</p><h2 id="retention-title">예상한 감쇠가 보이지 않았다</h2><span>37 cohorts · 444 cells</span></div>
            <figure className="chart-frame">
              <Image src="/artifacts/cohort-retention.png" alt={content.retention.imageAlt} width={1600} height={1200} sizes="(max-width: 900px) 100vw, 70vw" />
              <figcaption>회색 90셀은 2026-08-07 기준 관측 미완료 구간이며 0%가 아닙니다.</figcaption>
            </figure>
            <div className="reasoning-grid">
              <div><span>관측</span><strong>{content.retention.m1} → {content.retention.m12}</strong><p>동일 관측기간 {content.retention.pairedCohorts}개 코호트</p></div>
              <div><span>판정</span><strong>{content.retention.delta}</strong><p>horizon 중앙값 범위 {content.retention.range}</p></div>
              <div><span>의사결정</span><p>감쇠 부재를 숨기지 않습니다. 절대 수치로 CRM 발송 시점을 제안하지 않습니다.</p></div>
            </div>
          </section>

          <section className="section" id="reality" aria-labelledby="reality-title">
            <div className="section-heading"><p>04 / DATA REALITY CHECK</p><h2 id="reality-title">데이터가 답할 수 있는 경계</h2><span>가능 2 · 부분 1 · 불가 2</span></div>
            <div className="table-wrap" tabIndex={0} aria-label="데이터 현실 점검 표, 가로 스크롤 가능">
              <table><thead><tr><th>가설</th><th>데이터에서 확인한 사실</th><th>분석 가능 여부</th><th>설계 조정</th></tr></thead>
                <tbody>{content.realityChecks.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell} className={index === 2 && /불가/.test(cell) ? "cell-alert" : undefined}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="section" aria-labelledby="questions-title">
            <div className="section-heading"><p>05 / BUSINESS QUESTIONS</p><h2 id="questions-title">질문별 현재 답변 가능 범위</h2><span>5 questions</span></div>
            <div className="question-list">
              {content.businessQuestions.map((item, index) => (
                <article key={item.question} className="question-row">
                  <span className="question-number">{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{item.question}</h3><p><strong>근거</strong>{item.evidence}</p><p><strong>다음 행동</strong>{item.next}</p></div>
                  <Status>{item.status}</Status>
                </article>
              ))}
            </div>
          </section>

          <section className="section evidence-plan" id="evidence" aria-labelledby="evidence-title">
            <div>
              <div className="section-heading"><p>06 / REPRODUCIBILITY</p><h2 id="evidence-title">공개 근거로 바로 이동</h2><span>7 links</span></div>
              <div className="evidence-links">{content.evidenceLinks.map((link) => <EvidenceLink key={link.href} {...link} />)}</div>
            </div>
            <div>
              <div className="section-heading"><p>07 / AFTER JOINING</p><h2>30·60·90일 적용 계획</h2><span>제안 · 미실행</span></div>
              <div className="plan-grid">{content.applicationPlan.map((phase) => <article key={phase.day}><span>{phase.day}</span><h3>{phase.title}</h3><ol>{phase.items.map((item) => <li key={item}>{item}</li>)}</ol></article>)}</div>
            </div>
          </section>

          <footer className="final-cta">
            <p>분석 결과보다 먼저,</p><h2>그 결과를 믿을 수 있는지 검증했습니다.</h2>
            <div className="hero-actions">{content.finalActions.map((action, index) => <a key={action.href} className={index === 0 ? "button button--primary" : "button"} href={action.href} target="_blank" rel="noreferrer">{action.label}</a>)}</div>
            <small>공개 합성 데이터 · 실제 기업 데이터 및 성과 아님 · 분석 기준일 2026-08-07</small>
          </footer>
        </main>
      </div>
    </>
  );
}
