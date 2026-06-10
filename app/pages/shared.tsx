/**
 * Shared pieces for the task pages: paper-styled output card, copy helper,
 * common input styles. Letter paper matches the Arztbrief letter look.
 */

import React from "react";
import type { ThemeColors } from "../theme";

const LETTER_SERIF = 'Georgia, "Times New Roman", "Liberation Serif", serif';
const LETTER_INK = "#2a2a2a";
const LETTER_MUTED = "#6f6a5f";

/** Clipboard write with execCommand fallback (sandboxed iframes may block the async API). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function textareaStyle(c: ThemeColors): React.CSSProperties {
  return {
    width: "100%",
    minHeight: 160,
    padding: "0.6rem 0.7rem",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    outline: "none",
    boxSizing: "border-box",
    background: c.inputBg,
    color: c.text,
    fontFamily: "inherit",
    resize: "vertical",
  };
}

export function primaryBtnStyle(c: ThemeColors, busy: boolean): React.CSSProperties {
  return {
    marginTop: "0.5rem",
    padding: "0.6rem 2rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: c.btnText,
    background: busy ? c.muted : c.btnBg,
    border: "none",
    borderRadius: 6,
    cursor: busy ? "not-allowed" : "pointer",
  };
}

export function errorBoxStyle(c: ThemeColors): React.CSSProperties {
  return {
    marginTop: "1.25rem",
    padding: "1rem",
    background: c.errorBg,
    border: `1px solid ${c.errorBorder}`,
    borderRadius: 6,
    color: c.errorText,
    fontSize: "0.9rem",
  };
}

/**
 * Paper output card: serif on letter paper, ENTWURF badge, model line,
 * copy / print actions. Used by the Zusammenfassung and Antwort pages.
 */
export function PaperOutput({
  title,
  text,
  model,
  draftBadge,
  modelLabel,
  copyLabel,
  printLabel,
  onCopy,
}: {
  title: string;
  text: string;
  model: string;
  draftBadge: string;
  modelLabel: string;
  copyLabel: string;
  printLabel: string;
  onCopy: () => void;
}) {
  return (
    <>
      <div
        className="arztbrief-letter"
        style={{
          position: "relative",
          background: "#f7f3ea",
          color: LETTER_INK,
          padding: "2rem 2.5rem",
          marginTop: "1.5rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          borderRadius: 4,
          fontFamily: LETTER_SERIF,
        }}
      >
        <div style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#a08c5a",
          marginBottom: "0.8rem",
          textTransform: "uppercase",
        }}>
          {draftBadge}
        </div>
        <h3 style={{ fontFamily: LETTER_SERIF, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 0.6rem 0" }}>
          {title}
        </h3>
        <div style={{
          fontFamily: LETTER_SERIF,
          fontSize: "0.95rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}>
          {text}
        </div>
        <div style={{ marginTop: "1.25rem", fontSize: "0.78rem", fontStyle: "italic", color: LETTER_MUTED }}>
          {modelLabel}: {model}
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <button type="button" className="ab-btn-blue" onClick={onCopy}>
          {copyLabel}
        </button>
        <button type="button" className="ab-btn-blue" onClick={() => window.print()}>
          {printLabel}
        </button>
      </div>
    </>
  );
}

/** Fixed bottom toast, mirroring the Arztbrief page's pattern. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="no-print"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#2a2a2a",
        color: "#ffffff",
        padding: "0.7rem 1.25rem",
        borderRadius: 8,
        fontSize: "0.9rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        zIndex: 1100,
      }}
    >
      {message}
    </div>
  );
}
