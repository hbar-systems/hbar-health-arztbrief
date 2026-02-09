/**
 * Safety and tone enforcement applied AFTER generation.
 * Rules here are non-negotiable — they override LLM output.
 *
 * This is the last gate before the user sees text.
 */

// ---------------------------------------------------------------------------
// Forbidden patterns — redacted on sight
// ---------------------------------------------------------------------------

const FORBIDDEN_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /\bDiagnose\s*:\s*[^\n]+/gi,
    replacement: "[Diagnose entfernt – ärztliche Prüfung erforderlich]",
  },
  {
    pattern: /\bgesicherte?\s+Diagnose\b[^\n]*/gi,
    replacement: "[Diagnoseformulierung entfernt – ärztliche Prüfung erforderlich]",
  },
  {
    pattern: /\bPatient\s+(ist|wird)\s+(sterben|tot|verstorben)\b[^\n]*/gi,
    replacement: "[Prognostische Aussage entfernt]",
  },
  {
    pattern: /\bgarantie|garantiert|sicher\s+heil\b[^\n]*/gi,
    replacement: "[Ergebnisgarantie entfernt]",
  },
  {
    pattern: /\bPrognose\s*:\s*[^\n]+/gi,
    replacement: "[Prognose entfernt – nicht im Scope]",
  },
];

// ---------------------------------------------------------------------------
// Tone: sachlich, medizinisch-formal
// ---------------------------------------------------------------------------

const TONE_REPLACEMENTS: [RegExp, string][] = [
  [/\bder Patient klagt\b/gi, "der Patient berichtet"],
  [/\bdie Patientin klagt\b/gi, "die Patientin berichtet"],
  [/\bklagt über\b/gi, "berichtet über"],
  [/\bbehauptet\b/gi, "gibt an"],
  [/\bder Patient will\b/gi, "der Patient wünscht"],
  [/\bdie Patientin will\b/gi, "die Patientin wünscht"],
];

// ---------------------------------------------------------------------------
// Imperative softening: "muss operiert werden" → "ggf. operative Versorgung zu erwägen"
// ---------------------------------------------------------------------------

const IMPERATIVE_SOFTENERS: [RegExp, string][] = [
  [/\bmuss\s+operiert\s+werden\b/gi, "ggf. operative Versorgung zu erwägen"],
  [/\bmuss\s+behandelt\s+werden\b/gi, "eine Behandlung ist zu erwägen"],
  [/\bsofort\s+verabreichen\b/gi, "ggf. zeitnah zu verabreichen"],
  [/\bsofort\s+beginnen\b/gi, "zeitnah einzuleiten"],
];

// ---------------------------------------------------------------------------
// Main postprocess function
// ---------------------------------------------------------------------------

export function postprocess(draft: string): string {
  let result = draft;

  // 1. Redact forbidden patterns
  for (const { pattern, replacement } of FORBIDDEN_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(result)) {
      pattern.lastIndex = 0;
      result = result.replace(pattern, replacement);
    }
  }

  // 2. Tone adjustments
  for (const [find, replace] of TONE_REPLACEMENTS) {
    result = result.replace(find, replace);
  }

  // 3. Soften imperatives
  for (const [find, replace] of IMPERATIVE_SOFTENERS) {
    result = result.replace(find, replace);
  }

  // 4. Trim excessive whitespace
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}
