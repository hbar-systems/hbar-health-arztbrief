/**
 * Task home — the first thing a Praxis sees. Four task cards, no chat.
 */

import React from "react";
import { Link } from "react-router-dom";
import type { ThemeColors } from "../theme";
import type { TaskStrings } from "../i18nTasks";

function Card({
  to,
  title,
  desc,
  c,
}: {
  to: string;
  title: string;
  desc: string;
  c: ThemeColors;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        textDecoration: "none",
        border: `1px solid ${hover ? c.brand : c.border}`,
        borderRadius: 8,
        padding: "1.1rem 1.2rem",
        background: c.card,
        boxShadow: hover ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
        transition: "border-color 120ms ease, box-shadow 120ms ease",
      }}
    >
      <div style={{ fontSize: "1rem", fontWeight: 700, color: c.text, marginBottom: "0.35rem" }}>
        {title}
      </div>
      <div style={{ fontSize: "0.82rem", lineHeight: 1.5, color: c.muted }}>
        {desc}
      </div>
    </Link>
  );
}

export function TaskHome({ ts, c }: { ts: TaskStrings; c: ThemeColors }) {
  return (
    <>
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: c.text, margin: "0 0 0.3rem 0" }}>
        {ts.homeTitle}
      </h2>
      <p style={{ color: c.muted, fontSize: "0.85rem", margin: "0 0 1.25rem 0", lineHeight: 1.5 }}>
        {ts.homeIntro}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.8rem" }}>
        <Card to="/arztbrief" title={ts.cardArztbriefTitle} desc={ts.cardArztbriefDesc} c={c} />
        <Card to="/zusammenfassung" title={ts.cardSummaryTitle} desc={ts.cardSummaryDesc} c={c} />
        <Card to="/antwort" title={ts.cardReplyTitle} desc={ts.cardReplyDesc} c={c} />
        <Card to="/protokoll" title={ts.cardProtokollTitle} desc={ts.cardProtokollDesc} c={c} />
      </div>

      <p style={{ color: c.muted, fontSize: "0.78rem", margin: "1rem 0 0 0", lineHeight: 1.5 }}>
        {ts.ocrNote}
      </p>

      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "0.8rem",
          borderTop: `1px solid ${c.border}`,
          fontSize: "0.78rem",
          color: c.muted,
          lineHeight: 1.6,
        }}
      >
        {ts.sovereigntyLine}
      </div>
    </>
  );
}
