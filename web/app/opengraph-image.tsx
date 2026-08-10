import { ImageResponse } from "next/og";

export const alt = "Outdoor Commerce CRM Decision Lab - Executive Case Study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#12161A",
        color: "#E8EDF0",
        padding: "72px 78px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg width="760" height="420" viewBox="0 0 760 420" style={{ position: "absolute", right: -90, top: 28, opacity: 0.7 }}>
        {Array.from({ length: 12 }, (_, index) => (
          <path
            key={index}
            d={`M20 ${70 + index * 24} C160 ${52 + index * 24}, 270 ${84 + index * 24}, 410 ${66 + index * 24} S650 ${72 + index * 24}, 760 ${58 + index * 24}`}
            fill="none"
            stroke={index === 5 ? "#E2703A" : "#2E3A42"}
            strokeWidth={index === 5 ? 4 : 2}
          />
        ))}
      </svg>
      <div style={{ display: "flex", fontSize: 22, color: "#7A9A6B", letterSpacing: "0.12em" }}>
        EXECUTIVE CASE STUDY / 2026-08-07
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 68, lineHeight: 1.04, fontWeight: 700, letterSpacing: "-0.035em" }}>
          <div style={{ display: "flex" }}>Outdoor Commerce</div>
          <div style={{ display: "flex" }}>CRM Decision Lab</div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 26, color: "#8A9BA5", lineHeight: 1.4 }}>
          결과를 말하기 전에, 그 결과를 믿을 수 있는지 검증했습니다.
        </div>
      </div>
      <div style={{ display: "flex", gap: 34, fontSize: 20, color: "#E8EDF0" }}>
        <span>125,158 source orders</span><span>24 paired cohorts</span><span>19 offline checks</span>
      </div>
    </div>,
    size,
  );
}
