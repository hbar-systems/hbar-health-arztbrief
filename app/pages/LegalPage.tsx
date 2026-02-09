import React from "react";
import type { Strings } from "../i18n";
import type { ThemeColors } from "../theme";

export function LegalPage({ s, c }: { s: Strings; c: ThemeColors }) {
  const sectionStyle: React.CSSProperties = {
    marginBottom: "1.75rem",
  };
  const h2Style: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: 600,
    color: c.accent,
    marginBottom: "0.4rem",
  };
  const pStyle: React.CSSProperties = {
    margin: 0,
    lineHeight: 1.7,
    color: c.text,
    fontSize: "0.9rem",
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: c.text, marginBottom: "1.5rem" }}>
        {s.legalTitle}
      </h1>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.legalIntendedUse}</h2>
        <p style={pStyle}>{s.legalIntendedUseText}</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.legalNotIntendedUse}</h2>
        <p style={pStyle}>{s.legalNotIntendedUseText}</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.legalResponsibility}</h2>
        <p style={pStyle}>{s.legalResponsibilityText}</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.legalDataHandling}</h2>
        <p style={pStyle}>{s.legalDataHandlingText}</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.legalEscalation}</h2>
        <p style={pStyle}>{s.legalEscalationText}</p>
      </div>
    </div>
  );
}
