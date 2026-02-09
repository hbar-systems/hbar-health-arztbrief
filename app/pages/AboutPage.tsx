import React from "react";
import type { Strings } from "../i18n";
import type { ThemeColors } from "../theme";

export function AboutPage({ s, c }: { s: Strings; c: ThemeColors }) {
  const sectionStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
  };
  const h2Style: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: 600,
    color: c.accent,
    marginBottom: "0.5rem",
  };
  const liStyle: React.CSSProperties = {
    marginBottom: "0.35rem",
    lineHeight: 1.6,
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: c.text, marginBottom: "1.5rem" }}>
        {s.aboutTitle}
      </h1>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.aboutWhatItDoes}</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li style={liStyle}>{s.aboutDoes1}</li>
          <li style={liStyle}>{s.aboutDoes2}</li>
          <li style={liStyle}>{s.aboutDoes3}</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.aboutWhatItDoesNot}</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li style={liStyle}>{s.aboutDoesNot1}</li>
          <li style={liStyle}>{s.aboutDoesNot2}</li>
          <li style={liStyle}>{s.aboutDoesNot3}</li>
          <li style={liStyle}>{s.aboutDoesNot4}</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>{s.aboutHowToUse}</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li style={liStyle}>{s.aboutSafe1}</li>
          <li style={liStyle}>{s.aboutSafe2}</li>
          <li style={liStyle}>{s.aboutSafe3}</li>
        </ul>
      </div>
    </div>
  );
}
