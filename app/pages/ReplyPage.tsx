/**
 * Antwortschreiben entwerfen — incoming letter + the practice's bullet
 * points + reply type -> formal German reply draft. The prompt restricts
 * content to the provided inputs; output is always a reviewable ENTWURF.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { ThemeColors } from "../theme";
import type { TaskStrings } from "../i18nTasks";
import { runTask, bridgeErrorMessage, type TaskResult } from "../tasks";
import { copyText, textareaStyle, primaryBtnStyle, errorBoxStyle, PaperOutput, Toast } from "./shared";

import replyPrompt from "../../prompts/draft_reply.txt?raw";

type ReplyType = "befund" | "termin" | "ueberweisung" | "allgemein";

export function ReplyPage({ ts, c }: { ts: TaskStrings; c: ThemeColors }) {
  const [letterText, setLetterText] = useState("");
  const [points, setPoints] = useState("");
  const [replyType, setReplyType] = useState<ReplyType>("allgemein");
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const typeLabel = (t: ReplyType): string =>
    t === "befund" ? ts.replyTypeBefund
    : t === "termin" ? ts.replyTypeTermin
    : t === "ueberweisung" ? ts.replyTypeUeberweisung
    : ts.replyTypeAllgemein;

  const handleRun = async () => {
    if (!letterText.trim() || !points.trim()) {
      setError(ts.emptyInputError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const prompt = [
        replyPrompt,
        "",
        "EINGEGANGENER BRIEF:",
        letterText.trim(),
        "",
        "STICHPUNKTE DER PRAXIS:",
        points.trim(),
        "",
        `ART DER ANTWORT: ${typeLabel(replyType)}`,
      ].join("\n");
      const res = await runTask("Antwortschreiben", prompt, "reply");
      setResult(res);
    } catch (e) {
      setError(bridgeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const ok = await copyText(result.text);
    setToast(ok ? ts.copiedToast : ts.copyFailedToast);
  };

  const selectStyle: React.CSSProperties = {
    padding: "0.5rem 0.6rem",
    fontSize: "0.9rem",
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    background: c.inputBg,
    color: c.text,
    minWidth: 220,
  };

  return (
    <>
      <div className="no-print">
        <Link to="/" style={{ fontSize: "0.8rem", color: c.muted, textDecoration: "none" }}>
          {ts.backToTasks}
        </Link>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: c.text, margin: "0.6rem 0 0.3rem 0" }}>
          {ts.replyTitle}
        </h2>
        <p style={{ color: c.muted, fontSize: "0.85rem", margin: "0 0 1rem 0", lineHeight: 1.5 }}>
          {ts.replyIntro}
        </p>

        <fieldset style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
          <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: c.text, padding: "0 0.25rem" }}>
            {ts.replyLetterLabel}
          </legend>
          <textarea
            style={textareaStyle(c)}
            value={letterText}
            placeholder={ts.replyLetterPlaceholder}
            onChange={(e) => setLetterText(e.target.value)}
          />
        </fieldset>

        <fieldset style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
          <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: c.text, padding: "0 0.25rem" }}>
            {ts.replyPointsLabel}
          </legend>
          <textarea
            style={{ ...textareaStyle(c), minHeight: 90 }}
            value={points}
            placeholder={ts.replyPointsPlaceholder}
            onChange={(e) => setPoints(e.target.value)}
          />
        </fieldset>

        <fieldset style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: "0.75rem 1rem" }}>
          <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: c.text, padding: "0 0.25rem" }}>
            {ts.replyTypeLabel}
          </legend>
          <select
            style={selectStyle}
            value={replyType}
            onChange={(e) => setReplyType(e.target.value as ReplyType)}
          >
            <option value="allgemein">{ts.replyTypeAllgemein}</option>
            <option value="befund">{ts.replyTypeBefund}</option>
            <option value="termin">{ts.replyTypeTermin}</option>
            <option value="ueberweisung">{ts.replyTypeUeberweisung}</option>
          </select>
        </fieldset>

        <button type="button" onClick={handleRun} disabled={loading} style={primaryBtnStyle(c, loading)}>
          {loading ? ts.working : ts.replyButton}
        </button>

        {error && <div style={errorBoxStyle(c)}>{error}</div>}
      </div>

      {result && (
        <PaperOutput
          title={ts.replyResultTitle}
          text={result.text}
          model={result.model}
          draftBadge={ts.draftBadge}
          modelLabel={ts.modelLine}
          copyLabel={ts.copyButton}
          printLabel={ts.printButton}
          onCopy={handleCopy}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
