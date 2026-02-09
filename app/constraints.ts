/**
 * Hard rules enforced in code — not in prompts.
 * If a constraint matters for patient safety, it lives here.
 *
 * Two layers:
 *   1. validateInput()  — pre-generation: is the input well-formed?
 *   2. validateOutput() — post-generation: does the draft violate safety rules?
 */

import type { AnamneseInput } from "./inputSchema";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// 1. INPUT VALIDATION (pre-generation)
// ---------------------------------------------------------------------------

export function validateInput(input: AnamneseInput): ValidationResult {
  const errors: string[] = [];

  if (!input.hauptproblem.trim()) {
    errors.push("Hauptproblem darf nicht leer sein.");
  }

  if (input.aktuelleBeschwerden.filter((b) => b.trim()).length === 0) {
    errors.push("Mindestens eine aktuelle Beschwerde ist erforderlich.");
  }

  if (!input.zeitlicherVerlauf) {
    errors.push("Zeitlicher Verlauf muss angegeben werden.");
  }

  if (!input.unsicherheit) {
    errors.push("Unsicherheit muss explizit angegeben werden (hoch / mittel / gering).");
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// 2. OUTPUT VALIDATION (post-generation)
// ---------------------------------------------------------------------------

/** Patterns that must NEVER appear in output — hard reject. */
const FORBIDDEN_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\bDiagnose\s*:/gi,
    reason: "Darf keine eigenständige Diagnose stellen.",
  },
  {
    pattern: /\bgesicherte?\s+Diagnose\b/gi,
    reason: "Darf keine Diagnose als gesichert darstellen.",
  },
  {
    pattern: /\bempfehle\b|\bsollte\s+(sofort\s+)?(beginnen|erhalten|bekommen)\b/gi,
    reason: "Keine imperativen Therapieanweisungen.",
  },
  {
    pattern: /\bmuss\s+(sofort\s+)?(operiert|behandelt|eingenommen)\b/gi,
    reason: "Keine imperativen Therapieanweisungen.",
  },
  {
    pattern: /\bmuss\s+erfolgen\b/gi,
    reason: "Keine imperativen Therapieanweisungen.",
  },
  {
    pattern: /\bist\s+indiziert\b/gi,
    reason: "Keine imperativen Therapieanweisungen (ist indiziert).",
  },
  {
    pattern: /\bist\s+erforderlich\b/gi,
    reason: "Keine imperativen Therapieanweisungen (ist erforderlich).",
  },
  {
    pattern: /\bTherapie\s+(einleiten|beginnen|durchführen|ist\s+indiziert|muss)\b/gi,
    reason: "Keine eigenständigen Therapieaussagen.",
  },
  {
    pattern: /\b(dringend|unbedingt)\s+empfohlen\b/gi,
    reason: "Keine imperativen Empfehlungen.",
  },
  {
    pattern: /\bgarantie|garantiert|sicher\s+heil/gi,
    reason: "Keine Ergebnisgarantien.",
  },
  {
    pattern: /\bPrognose\s*:/gi,
    reason: "Keine Prognosestellung.",
  },
];

/** Imperative treatment verbs that should not appear without hedging. */
const IMPERATIVE_TREATMENT = /\b(verabreichen|ansetzen|absetzen|verordnen)\b/gi;

/** Allowed ALLCAPS section headers — anything else is a violation. */
const ALLOWED_SECTION_HEADERS = new Set([
  "ANAMNESE",
  "KLINISCHER BEFUND",
  "BEURTEILUNG",
  "WEITERES VORGEHEN",
  "ENTWURF",
]);

/** Required hedging phrases — at least one must appear in Beurteilung. */
const HEDGING_PHRASES = [
  "Verdacht auf",
  "verdachtsweise",
  "bei entsprechender Klinik",
  "differentialdiagnostisch",
  "nicht auszuschließen",
  "möglicherweise",
  "ggf.",
  "gegebenenfalls",
  "zu erwägen",
  "in Betracht",
];

/** Uncertainty labels in ascending confidence order. */
const UNCERTAINTY_RANK: Record<string, number> = {
  hoch: 0,
  mittel: 1,
  gering: 2,
};

export interface OutputViolation {
  rule: string;
  detail: string;
}

export function validateOutput(
  draft: string,
  inputUnsicherheit: AnamneseInput["unsicherheit"]
): OutputViolation[] {
  const violations: OutputViolation[] = [];

  // --- Forbidden patterns ---
  for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    if (pattern.test(draft)) {
      violations.push({ rule: "FORBIDDEN_PATTERN", detail: reason });
    }
  }

  // --- No imperative treatment without hedging context ---
  IMPERATIVE_TREATMENT.lastIndex = 0;
  if (IMPERATIVE_TREATMENT.test(draft)) {
    violations.push({
      rule: "IMPERATIVE_TREATMENT",
      detail: "Imperative Therapieverben ohne abschwächenden Kontext gefunden.",
    });
  }

  // --- Hedging check in Beurteilung section ---
  const beurteilungMatch = draft.match(/BEURTEILUNG\n([\s\S]*?)(?:\n[A-ZÄÖÜ]{2,}|\n*$)/);
  if (beurteilungMatch) {
    const beurteilung = beurteilungMatch[1];
    const hasHedging = HEDGING_PHRASES.some((phrase) =>
      beurteilung.toLowerCase().includes(phrase.toLowerCase())
    );
    if (!hasHedging) {
      violations.push({
        rule: "MISSING_HEDGING",
        detail: "Beurteilung enthält keine abschwächende Formulierung (z.B. 'Verdacht auf…').",
      });
    }
  }

  // --- Uncertainty must not be reduced ---
  const outputUnsicherheitMatch = draft.match(/Unsicherheit\s*:\s*(hoch|mittel|gering)/i);
  if (outputUnsicherheitMatch) {
    const outputLevel = outputUnsicherheitMatch[1].toLowerCase() as AnamneseInput["unsicherheit"];
    if (UNCERTAINTY_RANK[outputLevel] > UNCERTAINTY_RANK[inputUnsicherheit]) {
      violations.push({
        rule: "UNCERTAINTY_REDUCED",
        detail: `Unsicherheit wurde von "${inputUnsicherheit}" auf "${outputLevel}" reduziert. Das ist nicht erlaubt.`,
      });
    }
  }

  // --- Section allowlist: no hallucinated ALLCAPS headers ---
  const headerPattern = /^([A-ZÄÖÜ][A-ZÄÖÜ ]{2,})$/gm;
  let headerMatch: RegExpExecArray | null;
  while ((headerMatch = headerPattern.exec(draft)) !== null) {
    const header = headerMatch[1].trim();
    // Skip the separator lines and the ENTWURF prefix line
    if (header.includes("─")) continue;
    if (!ALLOWED_SECTION_HEADERS.has(header)) {
      violations.push({
        rule: "UNKNOWN_SECTION",
        detail: `Unerlaubter Abschnitt gefunden: "${header}". Nur erlaubt: ${[...ALLOWED_SECTION_HEADERS].join(", ")}.`,
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// 3. ENFORCE DRAFT — fail-closed gate
// ---------------------------------------------------------------------------

const ENTWURF_HEADER =
  "ENTWURF – nicht zur direkten Verwendung ohne Prüfung";

const ENTWURF_DISCLAIMER =
  "Dieser Text stellt einen unterstützenden Entwurf dar und ersetzt keine ärztliche Entscheidung.";

export type EnforceDraftResult =
  | { ok: true; text: string }
  | { ok: false; errors: string[] };

export function enforceDraft(
  draft: string,
  input: AnamneseInput
): EnforceDraftResult {
  const violations = validateOutput(draft, input.unsicherheit);

  // Fail closed: ANY violation blocks the draft
  if (violations.length > 0) {
    return {
      ok: false,
      errors: violations.map((v) => `[${v.rule}] ${v.detail}`),
    };
  }

  // Strip any existing ENTWURF header/disclaimer to avoid duplication
  let text = draft;
  text = text.replace(/^ENTWURF\s*[–—-][^\n]*\n*/i, "");
  text = text.replace(
    /\n*Dieser Text stellt einen unterstützenden Entwurf dar[^\n]*/i,
    ""
  );
  text = text.trim();

  // Always prepend + append
  text = ENTWURF_HEADER + "\n\n" + text + "\n\n" + ENTWURF_DISCLAIMER;

  return { ok: true, text };
}
