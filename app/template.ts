/**
 * Deterministic Arztbrief template (German, v0).
 * Structure is authoritative — no hallucinated sections.
 * The LLM fills prose for each section; this file owns the skeleton.
 */

import type { AnamneseInput } from "./inputSchema";

const HEADER =
  "ENTWURF – nicht zur direkten Verwendung ohne ärztliche Prüfung";

const DISCLAIMER =
  "Dieser Text stellt einen unterstützenden Entwurf dar und ersetzt keine ärztliche Entscheidung.";

const SEPARATOR = "──────────────────────────────────────";

export interface GeneratedSections {
  anamnese: string;
  klinischerBefund: string;
  beurteilung: string;
  weiteresVorgehen: string;
}

export function renderTemplate(
  input: AnamneseInput,
  sections: GeneratedSections
): string {
  return [
    HEADER,
    "",
    SEPARATOR,
    "",
    `Hauptproblem: ${input.hauptproblem}`,
    `Zeitlicher Verlauf: ${input.zeitlicherVerlauf}`,
    `Unsicherheit: ${input.unsicherheit}`,
    "",
    SEPARATOR,
    "",
    "ANAMNESE",
    sections.anamnese,
    "",
    SEPARATOR,
    "",
    "KLINISCHER BEFUND",
    sections.klinischerBefund,
    "",
    SEPARATOR,
    "",
    "BEURTEILUNG",
    sections.beurteilung,
    "",
    SEPARATOR,
    "",
    "WEITERES VORGEHEN",
    sections.weiteresVorgehen,
    "",
    SEPARATOR,
    "",
    DISCLAIMER,
  ].join("\n");
}
