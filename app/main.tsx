/**
 * Entry point: router, layout, theme, i18n.
 * UI language toggleable (DE/EN). Generated letter is ALWAYS German.
 * Dark/Light theme with muted purple accent.
 */

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
// HashRouter, not BrowserRouter — the app runs as a brain-app iframe served
// from /api/bf/apps/<id>/; path-based routing can't know that prefix, hash
// routing is self-contained and works from any base path.
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import type { AnamneseInput, ZeitlicherVerlauf, Unsicherheit } from "./inputSchema";
import { generateDraft, type GenerateResult } from "./generateDraft";
import { type Lang, getStoredLang, storeLang, t, type Strings } from "./i18n";
import { type Theme, type ThemeColors, getStoredTheme, storeTheme, colors } from "./theme";
import { AudioModule } from "./AudioModule";
import { AboutPage } from "./pages/AboutPage";
import { LegalPage } from "./pages/LegalPage";
import { copyText } from "./pages/shared";
import { tt, type TaskStrings } from "./i18nTasks";
import { memoryWrite } from "./brainBridge";

import promptText from "../prompts/draft_arztbrief.txt?raw";
import "./styles.css";

// ---------------------------------------------------------------------------
// Style helpers (theme-aware)
// ---------------------------------------------------------------------------

function fieldsetStyle(c: ThemeColors): React.CSSProperties {
  return {
    border: `1px solid ${c.border}`,
    borderRadius: 6,
    padding: "0.75rem 1rem",
    marginBottom: "0.75rem",
  };
}

function legendStyle(c: ThemeColors): React.CSSProperties {
  return {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: c.text,
    padding: "0 0.25rem",
  };
}

function inputStyle(c: ThemeColors): React.CSSProperties {
  return {
    width: "100%",
    padding: "0.5rem 0.6rem",
    fontSize: "0.9rem",
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    outline: "none",
    boxSizing: "border-box",
    background: c.inputBg,
    color: c.text,
  };
}

function selectStyle(c: ThemeColors): React.CSSProperties {
  // Strip the native OS select chrome; draw a clean chevron instead.
  const chevron = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 4.5l3.5 3.5 3.5-3.5" fill="none" stroke="${c.text}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )}`;
  return {
    ...inputStyle(c),
    width: "auto",
    minWidth: 160,
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
    paddingRight: "2rem",
    background: `${c.inputBg} url("${chevron}") no-repeat right 0.6rem center`,
  };
}

function smallBtnStyle(c: ThemeColors): React.CSSProperties {
  return {
    padding: "0.3rem 0.6rem",
    fontSize: "0.8rem",
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    background: c.card,
    color: c.text,
    cursor: "pointer",
  };
}

function pillBtnStyle(c: ThemeColors, active: boolean): React.CSSProperties {
  return {
    padding: "0.2rem 0.55rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    border: `1px solid ${active ? c.accent : c.border}`,
    borderRadius: 4,
    background: active ? c.accent : "transparent",
    color: active ? c.btnText : c.muted,
    cursor: "pointer",
    letterSpacing: "0.02em",
  };
}

// ---------------------------------------------------------------------------
// Empty input
// ---------------------------------------------------------------------------

const EMPTY_INPUT: AnamneseInput = {
  hauptproblem: "",
  aktuelleBeschwerden: [""],
  zeitlicherVerlauf: "akut",
  vorerkrankungen: [],
  medikation: [],
  bildgebung: "",
  unsicherheit: "mittel",
};

// Ready-to-plug demo cases — one-click fill for the demo and first Praxis testers.
// Content is German (the letter is always German). Safe to delete this block later.
const EXAMPLE_CASES: { name: string; input: AnamneseInput }[] = [
  {
    name: "COPD-Bronchitis",
    input: {
      hauptproblem: "Akute Bronchitis bei bekannter COPD",
      aktuelleBeschwerden: ["Husten mit gelblichem Auswurf", "Belastungsdyspnoe", "kein Fieber"],
      zeitlicherVerlauf: "akut",
      vorerkrankungen: ["COPD GOLD II", "arterielle Hypertonie"],
      medikation: ["Ramipril 5 mg 1-0-0", "Salbutamol bei Bedarf"],
      unsicherheit: "mittel",
    },
  },
  {
    name: "Kreuzschmerz",
    input: {
      hauptproblem: "Akuter Kreuzschmerz ohne Trauma",
      aktuelleBeschwerden: ["Lumbaler Druckschmerz", "keine Ausstrahlung", "keine neurologischen Ausfälle"],
      zeitlicherVerlauf: "akut",
      vorerkrankungen: ["Adipositas"],
      medikation: ["Ibuprofen 400 mg bei Bedarf"],
      unsicherheit: "gering",
    },
  },
  {
    name: "Diabetes-Kontrolle",
    input: {
      hauptproblem: "Routinekontrolle bei Diabetes mellitus Typ 2",
      aktuelleBeschwerden: ["keine akuten Beschwerden", "HbA1c 7,8 %"],
      zeitlicherVerlauf: "chronisch",
      vorerkrankungen: ["Diabetes mellitus Typ 2", "arterielle Hypertonie", "Hyperlipidämie"],
      medikation: ["Metformin 1000 mg 1-0-1", "Ramipril 5 mg 1-0-0", "Atorvastatin 20 mg 0-0-1"],
      unsicherheit: "gering",
    },
  },
];

// ---------------------------------------------------------------------------
// Reusable: dynamic string-list editor
// ---------------------------------------------------------------------------

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  addLabel,
  removeTitle,
  c,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  removeTitle: string;
  c: ThemeColors;
}) {
  const update = (index: number, value: string) => {
    const copy = [...items];
    copy[index] = value;
    onChange(copy);
  };
  const add = () => onChange([...items, ""]);
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <fieldset style={fieldsetStyle(c)}>
      <legend style={legendStyle(c)}>{label}</legend>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "0.35rem", marginBottom: "0.35rem" }}>
          <input
            style={{ ...inputStyle(c), flex: 1, width: "auto" }}
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          {items.length > 1 && (
            <button type="button" onClick={() => remove(i)} title={removeTitle} style={smallBtnStyle(c)}>
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} style={{ ...smallBtnStyle(c), marginTop: "0.25rem" }}>
        {addLabel}
      </button>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Nav bar
// ---------------------------------------------------------------------------

function NavBar({
  s,
  c,
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
}: {
  s: Strings;
  c: ThemeColors;
  lang: Lang;
  theme: Theme;
  onToggleLang: () => void;
  onToggleTheme: () => void;
}) {
  const location = useLocation();
  const linkStyle = (path: string): React.CSSProperties => ({
    textDecoration: "none",
    fontSize: "0.8rem",
    fontWeight: location.pathname === path ? 600 : 400,
    color: location.pathname === path ? c.accent : c.muted,
    borderBottom: location.pathname === path ? `2px solid ${c.accent}` : "2px solid transparent",
    paddingBottom: "0.15rem",
  });

  return (
    <nav className="no-print" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.6rem 0",
      borderBottom: `1px solid ${c.navBorder}`,
      marginBottom: "1.25rem",
    }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: c.brand, letterSpacing: "0.04em" }}>
          {s.brand}
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/about" style={linkStyle("/about")}>{s.navAbout}</Link>
        <Link to="/legal" style={linkStyle("/legal")}>{s.navLegal}</Link>

        <div style={{ display: "flex", gap: "0.2rem" }}>
          <button type="button" onClick={onToggleLang} style={pillBtnStyle(c, false)}>
            {lang === "de" ? "DE → EN" : "EN → DE"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.2rem" }}>
          <button
            type="button"
            onClick={onToggleTheme}
            style={pillBtnStyle(c, false)}
            title={theme === "light" ? s.themeDark : s.themeLight}
          >
            {theme === "light" ? "☀ → ☾" : "☾ → ☀"}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Letter rendering — turn the generated draft string into a clinical letter
// ---------------------------------------------------------------------------

interface LetterData {
  hauptproblem: string;
  verlauf: string;
  unsicherheit: string;
  anamnese: string;
  befund: string;
  bildgebung: string | null;
  beurteilung: string;
  weiteresVorgehen: string;
}

// The draft string is deterministic (renderTemplate + enforceDraft): ALLCAPS
// section headers, a "Key: value" meta block, "─" separators, a leading
// ENTWURF line and a trailing disclaimer. Parse it back into fields so we can
// render a real letter instead of a monospace dump.
function parseLetter(draft: string): LetterData {
  const HEADERS: Record<string, keyof LetterData> = {
    "ANAMNESE": "anamnese",
    "KLINISCHER BEFUND": "befund",
    "BEURTEILUNG": "beurteilung",
    "WEITERES VORGEHEN": "weiteresVorgehen",
  };

  const meta: string[] = [];
  const buckets: Record<string, string[]> = {
    anamnese: [], befund: [], beurteilung: [], weiteresVorgehen: [],
  };
  let current: keyof typeof buckets | "meta" = "meta";

  for (const raw of draft.split("\n")) {
    const line = raw.replace(/\r$/, "");
    const trimmed = line.trim();
    if (trimmed.includes("─")) continue;                       // separator
    if (/^ENTWURF\s*[–—-]/i.test(trimmed)) continue;           // header line
    if (/^Dieser Text stellt einen unterstützenden Entwurf/i.test(trimmed)) continue; // disclaimer

    const header = HEADERS[trimmed.toUpperCase()];
    if (header) { current = header; continue; }

    if (current === "meta") meta.push(line);
    else buckets[current].push(line);
  }

  const metaText = meta.join("\n");
  const grab = (re: RegExp): string => (metaText.match(re)?.[1] ?? "").trim();

  // Pull any Bildgebung/Radiologie line out of the Befund into its own block.
  let befund = buckets.befund.join("\n").trim();
  let bildgebung: string | null = null;
  const imaging = befund.match(/^[ \t]*(?:Bildgebung|Radiologie)\s*:\s*(.+)$/im);
  if (imaging) {
    bildgebung = imaging[1].trim();
    befund = befund.replace(imaging[0], "").replace(/\n{3,}/g, "\n\n").trim();
  }

  return {
    hauptproblem: grab(/^Hauptproblem\s*:\s*(.*)$/im),
    verlauf: grab(/^Zeitlicher Verlauf\s*:\s*(.*)$/im),
    unsicherheit: grab(/^Unsicherheit\s*:\s*(.*)$/im),
    anamnese: buckets.anamnese.join("\n").trim(),
    befund,
    bildgebung,
    beurteilung: buckets.beurteilung.join("\n").trim(),
    weiteresVorgehen: buckets.weiteresVorgehen.join("\n").trim(),
  };
}

const LETTER_SERIF = 'Georgia, "Times New Roman", "Liberation Serif", serif';
const LETTER_INK = "#2a2a2a";
const LETTER_MUTED = "#6f6a5f";

function todayDE(): string {
  try {
    return new Date().toLocaleDateString("de-DE", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function LetterSection({ title, body }: { title: string; body: string }) {
  return (
    <section style={{ marginTop: "1rem" }}>
      <h3 style={{
        fontFamily: LETTER_SERIF,
        fontWeight: 700,
        fontSize: "1.05rem",
        color: LETTER_INK,
        margin: "1rem 0 0.35rem 0",
      }}>
        {title}
      </h3>
      <div style={{
        fontFamily: LETTER_SERIF,
        fontSize: "0.95rem",
        lineHeight: 1.6,
        color: LETTER_INK,
        whiteSpace: "pre-wrap",
      }}>
        {body || "—"}
      </div>
    </section>
  );
}

function Letter({ draft }: { draft: string }) {
  const d = parseLetter(draft);
  return (
    <div
      className="arztbrief-letter"
      style={{
        position: "relative",
        background: "#f7f3ea",
        color: LETTER_INK,
        padding: "2.5rem",
        marginTop: "1.5rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        borderRadius: 4,
        fontFamily: LETTER_SERIF,
      }}
    >
      {/* ENTWURF watermark, top-right */}
      <div style={{
        position: "absolute",
        top: "1.4rem",
        right: "1.6rem",
        fontFamily: LETTER_SERIF,
        fontSize: "1.4rem",
        fontWeight: 700,
        letterSpacing: "0.35em",
        color: "#a08c5a",
        opacity: 0.55,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        ENTWURF
      </div>

      {/* Letterhead */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "1rem",
      }}>
        <span style={{ fontFamily: LETTER_SERIF, fontSize: "1.25rem", fontWeight: 700, color: LETTER_INK }}>
          hbar.health — Demo-Praxis
        </span>
        <span style={{ fontFamily: LETTER_SERIF, fontSize: "0.9rem", color: LETTER_MUTED, textAlign: "right" }}>
          {todayDE()}
        </span>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #d9d0bd", margin: "0.9rem 0 0.4rem 0" }} />

      {/* Meta block */}
      <div style={{ fontFamily: LETTER_SERIF, fontSize: "0.88rem", color: LETTER_MUTED, lineHeight: 1.7 }}>
        {d.hauptproblem && <div><strong style={{ color: LETTER_INK }}>Hauptproblem:</strong> {d.hauptproblem}</div>}
        {d.verlauf && <div><strong style={{ color: LETTER_INK }}>Zeitlicher Verlauf:</strong> {d.verlauf}</div>}
        {d.unsicherheit && <div><strong style={{ color: LETTER_INK }}>Unsicherheit:</strong> {d.unsicherheit}</div>}
      </div>

      <LetterSection title="Anamnese" body={d.anamnese} />

      {/* Klinischer Befund + conditional Bildgebung subsection */}
      <LetterSection title="Klinischer Befund" body={d.befund} />
      {d.bildgebung && (
        <div style={{ marginTop: "0.5rem", marginLeft: "0.25rem" }}>
          <h4 style={{
            fontFamily: LETTER_SERIF,
            fontWeight: 700,
            fontSize: "0.95rem",
            color: LETTER_INK,
            margin: "0.4rem 0 0.2rem 0",
          }}>
            Bildgebung
          </h4>
          <div style={{
            fontFamily: LETTER_SERIF,
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: LETTER_INK,
            whiteSpace: "pre-wrap",
          }}>
            {d.bildgebung}
          </div>
        </div>
      )}

      <LetterSection title="Beurteilung" body={d.beurteilung} />
      <LetterSection title="Weiteres Vorgehen" body={d.weiteresVorgehen} />

      {/* Signature line */}
      <hr style={{ border: "none", borderTop: "1px solid #c9bfa8", margin: "2.5rem 0 0.4rem 0" }} />
      <div style={{ fontFamily: LETTER_SERIF, fontSize: "0.92rem", color: LETTER_MUTED }}>
        Dr. med. [Unterschrift]
      </div>

      {/* Closing footer */}
      <div style={{
        fontFamily: LETTER_SERIF,
        fontStyle: "italic",
        fontSize: "0.82rem",
        color: LETTER_MUTED,
        marginTop: "1.25rem",
      }}>
        Entwurf — ärztliche Prüfung und Freigabe erforderlich.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arztbrief page (the structured anamnesis form — formerly the home page)
// ---------------------------------------------------------------------------

function ArztbriefPage({ s, c, lang, ts }: { s: Strings; c: ThemeColors; lang: Lang; ts: TaskStrings }) {
  const [input, setInput] = useState<AnamneseInput>(EMPTY_INPUT);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPvsModal, setShowPvsModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss the toast.
  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // "Entwurf speichern" — persist via the brain memory.write bridge; fall back
  // to localStorage if the bridge is unavailable (not embedded, or the brain
  // has not yet re-approved the memory.write permission).
  const handleSaveDraft = async () => {
    const text = result?.draft;
    if (!text) return;
    try {
      await memoryWrite(text, "episodic", { kind: "arztbrief-entwurf" });
    } catch {
      try {
        localStorage.setItem(`hbar-health-arztbrief-draft-${Date.now()}`, text);
      } catch {
        // last-resort: nothing else we can do; still confirm to the user.
      }
    }
    setToast("Entwurf gespeichert.");
  };

  // "In Zwischenablage kopieren" — the PVS bridge: plain-text draft into the
  // clipboard, the MFA pastes it into the practice's PVS.
  const handleCopyDraft = async () => {
    const text = result?.draft;
    if (!text) return;
    const ok = await copyText(text);
    setToast(ok ? ts.copiedToast : ts.copyFailedToast);
  };

  const handleApplyAudio = (fields: Partial<AnamneseInput>) => {
    setInput((prev) => ({
      ...prev,
      ...fields,
      aktuelleBeschwerden: fields.aktuelleBeschwerden ?? prev.aktuelleBeschwerden,
      vorerkrankungen: fields.vorerkrankungen ?? prev.vorerkrankungen,
      medikation: fields.medikation ?? prev.medikation,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    // The app runs in a sandboxed iframe (sandbox="allow-scripts
    // allow-same-origin") with NO allow-forms — the browser blocks native form
    // submission and never fires the submit event. So generation is driven by
    // the button's onClick, not form submit. This handler tolerates being
    // called with or without an event.
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await generateDraft(input, promptText);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Subtitle */}
      <p className="no-print" style={{ color: c.muted, fontSize: "0.82rem", margin: "0 0 0.75rem 0", lineHeight: 1.5 }}>
        {s.subtitle}
      </p>

      {/* Quick-fill demo examples — one click fills the whole form. Delete later if desired. */}
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center", margin: "0 0 1.25rem 0" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: c.muted }}>{s.beispielLabel}</span>
        {EXAMPLE_CASES.map((ex) => (
          <button
            key={ex.name}
            type="button"
            onClick={() => { setInput(ex.input); setResult(null); }}
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem", fontWeight: 600, border: `1px solid ${c.border}`, borderRadius: 999, background: "transparent", color: c.muted, cursor: "pointer" }}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Audio module (collapsed) */}
      <div className="no-print">
        <AudioModule s={s} c={c} lang={lang} onApply={handleApplyAudio} />
      </div>

      <form className="no-print" onSubmit={handleSubmit}>
        {/* Hauptproblem */}
        <fieldset style={fieldsetStyle(c)}>
          <legend style={legendStyle(c)}>{s.hauptproblemLabel}</legend>
          <input
            style={inputStyle(c)}
            value={input.hauptproblem}
            placeholder={s.hauptproblemPlaceholder}
            onChange={(e) => setInput({ ...input, hauptproblem: e.target.value })}
          />
        </fieldset>

        {/* Aktuelle Beschwerden */}
        <ListEditor
          label={s.beschwerdenLabel}
          items={input.aktuelleBeschwerden}
          onChange={(items) => setInput({ ...input, aktuelleBeschwerden: items })}
          placeholder={s.beschwerdenPlaceholder}
          addLabel={s.addButton}
          removeTitle={s.removeTitle}
          c={c}
        />

        {/* Zeitlicher Verlauf */}
        <fieldset style={fieldsetStyle(c)}>
          <legend style={legendStyle(c)}>{s.verlaufLabel}</legend>
          <select
            style={selectStyle(c)}
            value={input.zeitlicherVerlauf}
            onChange={(e) =>
              setInput({ ...input, zeitlicherVerlauf: e.target.value as ZeitlicherVerlauf })
            }
          >
            <option value="akut">{s.verlaufAkut}</option>
            <option value="subakut">{s.verlaufSubakut}</option>
            <option value="chronisch">{s.verlaufChronisch}</option>
          </select>
        </fieldset>

        {/* Vorerkrankungen */}
        <ListEditor
          label={s.vorerkrankungenLabel}
          items={input.vorerkrankungen.length > 0 ? input.vorerkrankungen : [""]}
          onChange={(items) => setInput({ ...input, vorerkrankungen: items.filter((v) => v.trim()) })}
          placeholder={s.vorerkrankungenPlaceholder}
          addLabel={s.addButton}
          removeTitle={s.removeTitle}
          c={c}
        />

        {/* Medikation */}
        <ListEditor
          label={s.medikationLabel}
          items={input.medikation.length > 0 ? input.medikation : [""]}
          onChange={(items) => setInput({ ...input, medikation: items.filter((m) => m.trim()) })}
          placeholder={s.medikationPlaceholder}
          addLabel={s.addButton}
          removeTitle={s.removeTitle}
          c={c}
        />

        {/* Bildgebung / Radiologie (optional) */}
        <fieldset style={fieldsetStyle(c)}>
          <legend style={legendStyle(c)}>{s.bildgebungLabel}</legend>
          <input
            style={inputStyle(c)}
            value={input.bildgebung ?? ""}
            placeholder={s.bildgebungPlaceholder}
            onChange={(e) => setInput({ ...input, bildgebung: e.target.value })}
          />
        </fieldset>

        {/* Unsicherheit */}
        <fieldset style={fieldsetStyle(c)}>
          <legend style={legendStyle(c)}>{s.unsicherheitLabel}</legend>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              style={selectStyle(c)}
              value={input.unsicherheit}
              onChange={(e) =>
                setInput({ ...input, unsicherheit: e.target.value as Unsicherheit })
              }
            >
              <option value="hoch">{s.unsicherheitHoch}</option>
              <option value="mittel">{s.unsicherheitMittel}</option>
              <option value="gering">{s.unsicherheitGering}</option>
            </select>
            <span style={{ color: c.muted, fontSize: "0.8rem" }}>
              {s.unsicherheitHint}
            </span>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading}
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 2rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: c.btnText,
            background: loading ? c.muted : c.btnBg,
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? s.submittingButton : s.submitButton}
        </button>
      </form>

      {/* Input validation errors */}
      {result && !result.success && !result.blocked && (
        <div className="no-print" style={{
          marginTop: "1.25rem",
          padding: "1rem",
          background: c.errorBg,
          border: `1px solid ${c.errorBorder}`,
          borderRadius: 6,
          color: c.errorText,
          fontSize: "0.9rem",
        }}>
          <strong>{s.errorHeading}</strong>
          <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
            {result.errors?.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Blocked by enforceDraft (fail closed) */}
      {result && !result.success && result.blocked && (
        <div className="no-print" style={{
          marginTop: "1.25rem",
          padding: "1rem",
          background: c.blockedBg,
          border: `1px solid ${c.blockedBorder}`,
          borderRadius: 6,
          color: c.errorText,
          fontSize: "0.9rem",
        }}>
          <strong>{s.blockedHeading}</strong>
          <p style={{ margin: "0.5rem 0", fontSize: "0.85rem" }}>{s.blockedExplanation}</p>
          <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
            {result.errors?.map((err, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Draft output — rendered as a clinical letter */}
      {result?.draft && (
        <>
          <Letter draft={result.draft} />

          {/* Workflow actions (never printed) */}
          <div className="no-print" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <button type="button" className="ab-btn-blue" onClick={handleCopyDraft}>
              {ts.copyButton}
            </button>
            <button type="button" className="ab-btn-blue" onClick={() => window.print()}>
              Drucken
            </button>
            <button type="button" className="ab-btn-blue" onClick={() => setShowPvsModal(true)}>
              An PVS übermitteln
            </button>
            <button type="button" className="ab-btn-blue" onClick={handleSaveDraft}>
              Entwurf speichern
            </button>
          </div>
        </>
      )}

      {/* PVS modal */}
      {showPvsModal && (
        <div
          className="no-print"
          onClick={() => setShowPvsModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: c.card,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              padding: "1.5rem",
              maxWidth: 420,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          >
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Verbindung zum Praxisverwaltungssystem wird im Onboarding aufgesetzt.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="ab-btn-blue" onClick={() => setShowPvsModal(false)}>
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
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
          {toast}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Root App with router
// ---------------------------------------------------------------------------

function App() {
  const [lang, setLang] = useState<Lang>(getStoredLang);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const s = t(lang);
  const ts = tt(lang);
  const c = colors(theme);

  const toggleLang = () => {
    const next: Lang = lang === "de" ? "en" : "de";
    setLang(next);
    storeLang(next);
  };

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    storeTheme(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "0 1rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: "1rem", paddingBottom: "3rem" }}>
        <NavBar s={s} c={c} lang={lang} theme={theme} onToggleLang={toggleLang} onToggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<ArztbriefPage s={s} c={c} lang={lang} ts={ts} />} />
          <Route path="/about" element={<AboutPage s={s} c={c} />} />
          <Route path="/legal" element={<LegalPage s={s} c={c} />} />
        </Routes>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
