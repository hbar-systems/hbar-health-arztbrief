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

import promptText from "../prompts/draft_arztbrief.txt?raw";

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
  unsicherheit: "mittel",
};

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
    <nav style={{
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
// Home page (form)
// ---------------------------------------------------------------------------

function HomePage({ s, c, lang }: { s: Strings; c: ThemeColors; lang: Lang }) {
  const [input, setInput] = useState<AnamneseInput>(EMPTY_INPUT);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApplyAudio = (fields: Partial<AnamneseInput>) => {
    setInput((prev) => ({
      ...prev,
      ...fields,
      aktuelleBeschwerden: fields.aktuelleBeschwerden ?? prev.aktuelleBeschwerden,
      vorerkrankungen: fields.vorerkrankungen ?? prev.vorerkrankungen,
      medikation: fields.medikation ?? prev.medikation,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <p style={{ color: c.muted, fontSize: "0.82rem", margin: "0 0 1.25rem 0", lineHeight: 1.5 }}>
        {s.subtitle}
      </p>

      {/* Audio module (collapsed) */}
      <AudioModule s={s} c={c} lang={lang} onApply={handleApplyAudio} />

      <form onSubmit={handleSubmit}>
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
          type="submit"
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
        <div style={{
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
        <div style={{
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

      {/* Draft output */}
      {result?.draft && (
        <textarea
          readOnly
          value={result.draft}
          style={{
            width: "100%",
            minHeight: 420,
            marginTop: "1.25rem",
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            padding: "1rem",
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            whiteSpace: "pre-wrap",
            color: c.text,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
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
          <Route path="/" element={<HomePage s={s} c={c} lang={lang} />} />
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
