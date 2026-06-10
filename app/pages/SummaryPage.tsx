/**
 * Eingehenden Brief zusammenfassen — paste incoming letter text, get a
 * structured extraction (sender / findings / requested action / deadlines).
 * Extraction only: the prompt forbids interpretation and diagnosis.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { ThemeColors } from "../theme";
import type { TaskStrings } from "../i18nTasks";
import { runTask, bridgeErrorMessage, type TaskResult } from "../tasks";
import { copyText, textareaStyle, primaryBtnStyle, errorBoxStyle, PaperOutput, Toast } from "./shared";

import summaryPrompt from "../../prompts/summarize_letter.txt?raw";

export function SummaryPage({ ts, c }: { ts: TaskStrings; c: ThemeColors }) {
  const [letterText, setLetterText] = useState("");
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleRun = async () => {
    if (!letterText.trim()) {
      setError(ts.emptyInputError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const prompt = `${summaryPrompt}\n${letterText.trim()}`;
      const res = await runTask("Briefzusammenfassung", prompt, "summary");
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

  return (
    <>
      <div className="no-print">
        <Link to="/" style={{ fontSize: "0.8rem", color: c.muted, textDecoration: "none" }}>
          {ts.backToTasks}
        </Link>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: c.text, margin: "0.6rem 0 0.3rem 0" }}>
          {ts.summaryTitle}
        </h2>
        <p style={{ color: c.muted, fontSize: "0.85rem", margin: "0 0 1rem 0", lineHeight: 1.5 }}>
          {ts.summaryIntro}
        </p>

        <fieldset style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: "0.75rem 1rem" }}>
          <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: c.text, padding: "0 0.25rem" }}>
            {ts.summaryInputLabel}
          </legend>
          <textarea
            style={textareaStyle(c)}
            value={letterText}
            placeholder={ts.summaryPlaceholder}
            onChange={(e) => setLetterText(e.target.value)}
          />
        </fieldset>

        <button type="button" onClick={handleRun} disabled={loading} style={primaryBtnStyle(c, loading)}>
          {loading ? ts.working : ts.summaryButton}
        </button>

        {error && <div style={errorBoxStyle(c)}>{error}</div>}
      </div>

      {result && (
        <PaperOutput
          title={ts.summaryResultTitle}
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
