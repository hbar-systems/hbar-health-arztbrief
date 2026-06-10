/**
 * Protokoll — the practice-visible audit log: every AI call this app made
 * (time, task, model, sources, duration, status), plus local data deletion
 * (DSGVO Art. 17, local scope).
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { ThemeColors } from "../theme";
import type { TaskStrings } from "../i18nTasks";
import { readAudit, clearAllLocalData, type AuditEntry } from "../audit";
import { Toast } from "./shared";

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
}

export function ProtokollPage({ ts, c }: { ts: TaskStrings; c: ThemeColors }) {
  const [entries, setEntries] = useState<AuditEntry[]>(readAudit);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleClear = () => {
    clearAllLocalData();
    setEntries([]);
    setConfirming(false);
    setToast(ts.clearedToast);
  };

  const th: React.CSSProperties = {
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: c.muted,
    padding: "0.4rem 0.6rem",
    borderBottom: `1px solid ${c.border}`,
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    fontSize: "0.82rem",
    color: c.text,
    padding: "0.45rem 0.6rem",
    borderBottom: `1px solid ${c.border}`,
    verticalAlign: "top",
  };

  return (
    <>
      <Link to="/" style={{ fontSize: "0.8rem", color: c.muted, textDecoration: "none" }}>
        {ts.backToTasks}
      </Link>
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: c.text, margin: "0.6rem 0 0.3rem 0" }}>
        {ts.protokollTitle}
      </h2>
      <p style={{ color: c.muted, fontSize: "0.85rem", margin: "0 0 1rem 0", lineHeight: 1.5 }}>
        {ts.protokollIntro}
      </p>

      {entries.length === 0 ? (
        <p style={{ color: c.muted, fontSize: "0.85rem" }}>{ts.protokollEmpty}</p>
      ) : (
        <div style={{ overflowX: "auto", border: `1px solid ${c.border}`, borderRadius: 6 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: c.card }}>
            <thead>
              <tr>
                <th style={th}>{ts.colTime}</th>
                <th style={th}>{ts.colTask}</th>
                <th style={th}>{ts.colModel}</th>
                <th style={th}>{ts.colSources}</th>
                <th style={th}>{ts.colDuration}</th>
                <th style={th}>{ts.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtTime(e.ts)}</td>
                  <td style={td}>{e.task}</td>
                  <td style={td}>{e.model}</td>
                  <td style={td}>{e.sources}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDuration(e.ms)}</td>
                  <td style={{ ...td, color: e.ok ? c.text : c.errorText, fontWeight: 600 }}>
                    {e.ok ? ts.statusOk : ts.statusError}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ color: c.muted, fontSize: "0.75rem", margin: "0.8rem 0 1.25rem 0", lineHeight: 1.5 }}>
        {ts.retentionNote}
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          style={{
            padding: "0.45rem 1rem",
            fontSize: "0.85rem",
            border: `1px solid ${c.errorBorder}`,
            borderRadius: 6,
            background: "transparent",
            color: c.errorText,
            cursor: "pointer",
          }}
        >
          {ts.clearLocalButton}
        </button>
      ) : (
        <div style={{
          padding: "0.9rem 1rem",
          border: `1px solid ${c.errorBorder}`,
          borderRadius: 6,
          background: c.errorBg,
        }}>
          <p style={{ margin: "0 0 0.7rem 0", fontSize: "0.85rem", color: c.errorText }}>
            {ts.clearLocalConfirm}
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "0.4rem 0.9rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: "none",
                borderRadius: 5,
                background: c.errorBorder,
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              {ts.clearLocalButton}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              style={{
                padding: "0.4rem 0.9rem",
                fontSize: "0.82rem",
                border: `1px solid ${c.border}`,
                borderRadius: 5,
                background: c.card,
                color: c.text,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </>
  );
}
