/**
 * Orchestration glue: validate → prompt → LLM → parse → template → validate output → postprocess.
 * No memory. No autonomy. Draft generation only.
 */

import type { AnamneseInput } from "./inputSchema";
import { validateInput, enforceDraft } from "./constraints";
import { renderTemplate, type GeneratedSections } from "./template";
import { postprocess } from "./postprocess";

export interface GenerateResult {
  success: boolean;
  draft?: string;
  errors?: string[];
  /** true when enforceDraft() blocked the output (fail closed) */
  blocked?: boolean;
}

// ---------------------------------------------------------------------------
// LLM stub — replace with actual API call
// ---------------------------------------------------------------------------

async function callLLM(_prompt: string): Promise<string> {
  // TODO: wire up actual LLM endpoint (OpenAI, Anthropic, local, etc.)
  console.warn("[generateDraft] LLM call is a stub — returning placeholder prose.");
  return [
    "ANAMNESE:",
    "Der Patient stellt sich mit den oben genannten Beschwerden vor. Keine Angaben zu weiteren Details.",
    "---",
    "KLINISCHER BEFUND:",
    "[Klinischer Befund ausstehend – bitte ergänzen.]",
    "---",
    "BEURTEILUNG:",
    "Verdacht auf eine Erkrankung im Zusammenhang mit den geschilderten Beschwerden. Bei entsprechender Klinik weitere Diagnostik zu erwägen.",
    "---",
    "WEITERES VORGEHEN:",
    "Weitere Abklärung empfohlen. Wiedervorstellung bei Verschlechterung.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(input: AnamneseInput, promptTemplate: string): string {
  const beschwerden = input.aktuelleBeschwerden
    .filter((b) => b.trim())
    .map((b) => `  – ${b}`)
    .join("\n");

  const vorerkrankungen =
    input.vorerkrankungen.length > 0
      ? input.vorerkrankungen.map((v) => `  – ${v}`).join("\n")
      : "  – keine angegeben";

  const medikation =
    input.medikation.length > 0
      ? input.medikation.map((m) => `  – ${m}`).join("\n")
      : "  – keine angegeben";

  return [
    promptTemplate,
    "",
    "EINGABEDATEN:",
    `Hauptproblem: ${input.hauptproblem}`,
    `Zeitlicher Verlauf: ${input.zeitlicherVerlauf}`,
    `Unsicherheit: ${input.unsicherheit}`,
    "",
    "Aktuelle Beschwerden:",
    beschwerden,
    "",
    "Vorerkrankungen:",
    vorerkrankungen,
    "",
    "Medikation:",
    medikation,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Section parser
// ---------------------------------------------------------------------------

function parseSections(llmResponse: string): GeneratedSections {
  const parts = llmResponse.split("---").map((s) => s.trim());

  const extract = (label: string, fallback: string): string => {
    const part = parts.find((p) => p.toUpperCase().startsWith(label.toUpperCase()));
    if (!part) return fallback;
    // Remove the label line itself
    const lines = part.split("\n");
    return lines.slice(1).join("\n").trim() || fallback;
  };

  return {
    anamnese: extract("ANAMNESE", "[Anamnese – bitte ergänzen.]"),
    klinischerBefund: extract("KLINISCHER BEFUND", "[Klinischer Befund ausstehend – bitte ergänzen.]"),
    beurteilung: extract("BEURTEILUNG", "[Beurteilung – bitte ergänzen.]"),
    weiteresVorgehen: extract("WEITERES VORGEHEN", "[Weiteres Vorgehen – bitte ergänzen.]"),
  };
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function generateDraft(
  input: AnamneseInput,
  promptTemplate: string
): Promise<GenerateResult> {
  // 1. Validate input
  const validation = validateInput(input);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  // 2. Build prompt & call LLM
  const prompt = buildPrompt(input, promptTemplate);
  const llmResponse = await callLLM(prompt);

  // 3. Parse LLM response into sections
  const sections = parseSections(llmResponse);

  // 4. Assemble into template
  const raw = renderTemplate(input, sections);

  // 5. Post-process (tone, forbidden patterns, imperative softening)
  const draft = postprocess(raw);

  // 6. Enforce draft — fail closed on ANY violation
  const enforced = enforceDraft(draft, input);

  if (!enforced.ok) {
    return { success: false, blocked: true, errors: enforced.errors };
  }

  return { success: true, draft: enforced.text };
}
