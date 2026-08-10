type ContourSeries = {
  cohort: string;
  values: number[];
};

type ContourFieldProps = {
  series: ContourSeries[];
};

function linePoints(values: number[], row: number) {
  return values
    .map((value, index) => {
      const x = 48 + index * 66;
      const y = 56 + row * 12 - value * 340;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ContourField({ series }: ContourFieldProps) {
  const highlighted = series.reduce((bestIndex, current, currentIndex, all) => {
    const best = all[bestIndex].values;
    const bestDelta = Math.abs(best[0] - best[best.length - 1]);
    const currentDelta = Math.abs(current.values[0] - current.values.at(-1)!);
    return currentDelta < bestDelta ? currentIndex : bestIndex;
  }, 0);

  return (
    <svg
      className="contour-field"
      viewBox="0 0 820 380"
      role="img"
      aria-labelledby="contour-title contour-desc"
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="contour-title">완전 관측 코호트 리텐션 등고선</title>
      <desc id="contour-desc">
        M+12까지 관측된 24개 월별 코호트의 M+1부터 M+12 재구매율을 선으로 표시했습니다.
        가장 평평한 코호트 한 개를 주황색으로 강조했습니다.
      </desc>
      <g className="contour-lines">
        {series.map((row, index) => (
          <polyline
            key={row.cohort}
            className={index === highlighted ? "contour-line contour-line--marker" : "contour-line"}
            points={linePoints(row.values, index)}
          >
            <title>{`${row.cohort} · M+1 ${(row.values[0] * 100).toFixed(2)}% · M+12 ${(row.values.at(-1)! * 100).toFixed(2)}%`}</title>
          </polyline>
        ))}
      </g>
      <g className="contour-axis" aria-hidden="true">
        <text x="48" y="370">M+1</text>
        <text x="774" y="370" textAnchor="end">M+12</text>
      </g>
    </svg>
  );
}
