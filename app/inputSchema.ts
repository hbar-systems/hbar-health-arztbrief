/**
 * Structured Anamnese input fields for v0.
 * Every field that enters the system is typed here — no free-form blobs.
 * No chat. No free text beyond the defined fields.
 */

export type ZeitlicherVerlauf = "akut" | "subakut" | "chronisch";

export type Unsicherheit = "hoch" | "mittel" | "gering";

export interface AnamneseInput {
  /** Short free text: what is the main problem? */
  hauptproblem: string;
  /** Bullet-style list of current complaints */
  aktuelleBeschwerden: string[];
  /** Temporal classification */
  zeitlicherVerlauf: ZeitlicherVerlauf;
  /** Relevant pre-existing conditions */
  vorerkrankungen: string[];
  /** Current medication — optional */
  medikation: string[];
  /** Explicit uncertainty level — REQUIRED */
  unsicherheit: Unsicherheit;
}
