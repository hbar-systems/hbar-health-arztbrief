/**
 * Orchestration glue: validate → prompt → LLM → parse → template → validate output → postprocess.
 * No memory. No autonomy. Draft generation only.
 */

import type { AnamneseInput } from "./inputSchema";
import { validateInput, enforceDraft } from "./constraints";
import { renderTemplate, type GeneratedSections } from "./template";
import { postprocess } from "./postprocess";
import { llmComplete } from "./brainBridge";

export interface GenerateResult {
  success: boolean;
  draft?: string;
  errors?: string[];
  /** true when enforceDraft() blocked the output (fail closed) */
  blocked?: boolean;
}

// ---------------------------------------------------------------------------
// LLM call — via the brain-app bridge
// ---------------------------------------------------------------------------

async function callLLM(prompt: string): Promise<string> {
  // This app runs as a sandboxed brain-app iframe — it does not call any LLM
  // directly. It asks the host brain to generate via the `llm.complete` bridge
  // intent. The brain RAGs over its corpus and uses the operator's BYOK model.
  // See brainBridge.ts.
  const result = await llmComplete([{ role: "user", content: prompt }]);
  return result.text;
}

/** Map a bridge error code to a German message for the UI. */
function llmErrorMessage(e: unknown): string {
  const code = e instanceof Error ? e.message : String(e);
  const map: Record<string, string> = {
    not_in_brain:
      "Diese App muss innerhalb eines Brains laufen — sie ist nicht eingebettet.",
    permission_denied:
      "Der App fehlt die Berechtigung 'llm.invoke'. Im Brain unter Apps prüfen.",
    permit_failed:
      "Das Brain konnte kein Permit ausstellen (Governance-Kernel nicht erreichbar).",
    missing_messages: "Interner Fehler: keine Eingabe an das Brain übergeben.",
    llm_complete_timeout: "Zeitüberschreitung bei der Anfrage an das Brain.",
    llm_complete_network_error: "Netzwerkfehler bei der Anfrage an das Brain.",
    llm_complete_failed: "Das Brain konnte den Entwurf nicht erzeugen.",
  };
  return map[code] || `Fehler bei der Entwurfserstellung: ${code}`;
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
  // The brain runs under its own persona and emits sections headed
  // "Anamnese / Befund / Beurteilung / Procedere" — not the app's original
  // ALLCAPS + "---" contract. Parse by flexible header match: find each
  // section header line, capture the body up to the next header. Works for
  // the persona format and the legacy "---" format alike.
  const SECTIONS: { key: keyof GeneratedSections; aliases: string[]; fallback: string }[] = [
    { key: "anamnese", aliases: ["anamnese"], fallback: "[Anamnese – bitte ergänzen.]" },
    { key: "klinischerBefund", aliases: ["klinischer befund", "befund"], fallback: "[Klinischer Befund ausstehend – bitte ergänzen.]" },
    { key: "beurteilung", aliases: ["beurteilung"], fallback: "[Beurteilung – bitte ergänzen.]" },
    { key: "weiteresVorgehen", aliases: ["procedere", "weiteres vorgehen"], fallback: "[Weiteres Vorgehen – bitte ergänzen.]" },
  ];

  // Is this line a section header? Strip markdown (#, *, >), surrounding
  // whitespace and a trailing colon, then match whole-line — or
  // "<alias> /…" for headers like "Beurteilung / Verdachtsdiagnose".
  const headerKey = (line: string): keyof GeneratedSections | null => {
    const norm = line.replace(/^[#*>\s-]+/, "").replace(/[*:#\s]+$/, "").trim().toLowerCase();
    if (!norm || norm.length > 44) return null;
    for (const s of SECTIONS) {
      for (const a of s.aliases) {
        if (norm === a || norm.startsWith(a + " /") || norm.startsWith(a + "/")) return s.key;
      }
    }
    return null;
  };

  const collected: Partial<Record<keyof GeneratedSections, string[]>> = {};
  let current: keyof GeneratedSections | null = null;
  for (const line of llmResponse.split("\n")) {
    if (/^-{2,}$/.test(line.trim())) continue; // skip "---" separators
    const k = headerKey(line);
    if (k) {
      current = k;
      collected[k] = collected[k] || [];
      continue;
    }
    if (current) collected[current]!.push(line);
  }

  const body = (key: keyof GeneratedSections, fallback: string): string =>
    (collected[key] || []).join("\n").trim() || fallback;

  return {
    anamnese: body("anamnese", SECTIONS[0].fallback),
    klinischerBefund: body("klinischerBefund", SECTIONS[1].fallback),
    beurteilung: body("beurteilung", SECTIONS[2].fallback),
    weiteresVorgehen: body("weiteresVorgehen", SECTIONS[3].fallback),
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

  // 2. Build prompt & call the brain via the bridge
  const prompt = buildPrompt(input, promptTemplate);
  let llmResponse: string;
  try {
    llmResponse = await callLLM(prompt);
  } catch (e) {
    return { success: false, errors: [llmErrorMessage(e)] };
  }

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
