/**
 * Free-text document tasks (Briefzusammenfassung, Antwortschreiben).
 *
 * Same bridge as the Arztbrief pipeline (llm.complete via the host shell),
 * but without the anamnesis schema: prompt template + pasted document text
 * in, draft text out. Every call is audit-logged. DEV builds outside a brain
 * return a mock so the UI is testable with `npm run dev`.
 */

import { llmComplete } from "./brainBridge";
import { logAudit } from "./audit";

export interface TaskResult {
  text: string;
  model: string;
  sources: string[];
}

/** Map a bridge error code to a German message for the UI. */
export function bridgeErrorMessage(e: unknown): string {
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
  return map[code] || `Fehler bei der Verarbeitung: ${code}`;
}

const MOCK_SUMMARY = [
  "ABSENDER: Radiologische Praxis Dr. Beispiel (Mock)",
  "DATUM: nicht angegeben",
  "ANLASS: Befundübermittlung nach Überweisung",
  "WESENTLICHE BEFUNDE: Röntgen-Thorax ohne pathologischen Befund (wie im Brief benannt).",
  "ERBETENE AKTION: Kenntnisnahme; keine weitere Aktion erbeten.",
  "FRISTEN: nicht angegeben",
].join("\n");

const MOCK_REPLY = [
  "Betreff: Ihre Anfrage (Mock-Entwurf)",
  "",
  "Sehr geehrte Frau Kollegin, sehr geehrter Herr Kollege,",
  "",
  "vielen Dank für Ihr Schreiben. Die erbetenen Unterlagen werden — vorbehaltlich",
  "ärztlicher Prüfung — zeitnah übermittelt.",
  "",
  "Mit freundlichen kollegialen Grüßen",
  "Dr. med. [Unterschrift]",
].join("\n");

/**
 * Run a free-text task: prompt template + document text -> draft.
 * Logs an audit entry (task name, model, sources, duration) on every path.
 */
export async function runTask(
  taskName: string,
  prompt: string,
  devMock: "summary" | "reply"
): Promise<TaskResult> {
  const started = Date.now();
  try {
    const result = await llmComplete([{ role: "user", content: prompt }]);
    logAudit({
      ts: new Date().toISOString(),
      task: taskName,
      model: result.model || "—",
      sources: result.sources.length,
      ok: true,
      ms: Date.now() - started,
    });
    return result;
  } catch (e) {
    const code = e instanceof Error ? e.message : String(e);
    if (import.meta.env.DEV && code === "not_in_brain") {
      return {
        text: devMock === "summary" ? MOCK_SUMMARY : MOCK_REPLY,
        model: "mock (dev)",
        sources: [],
      };
    }
    logAudit({
      ts: new Date().toISOString(),
      task: taskName,
      model: "—",
      sources: 0,
      ok: false,
      ms: Date.now() - started,
    });
    throw e;
  }
}
