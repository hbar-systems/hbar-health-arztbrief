/**
 * Local Protokoll — an app-side audit log of every AI call.
 *
 * Every task (Arztbrief, Zusammenfassung, Antwort) logs one entry per
 * llm.complete round-trip: when, which task, which model the brain used,
 * how many corpus sources, success, duration. Stored in localStorage
 * (capped), rendered on the Protokoll page. This is the practice-visible
 * half of the audit story; the brain keeps its own server-side JSONL log.
 */

export interface AuditEntry {
  /** ISO timestamp */
  ts: string;
  /** Task name, German (Arztbrief / Briefzusammenfassung / Antwortschreiben) */
  task: string;
  /** Model the brain reported using ("—" when the call failed before reply) */
  model: string;
  /** Number of corpus sources the RAG step retrieved */
  sources: number;
  ok: boolean;
  /** Round-trip duration in ms */
  ms: number;
}

const KEY = "hbar-health-protokoll";
const MAX_ENTRIES = 200;

export function readAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function logAudit(entry: AuditEntry): void {
  try {
    const all = readAudit();
    all.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage unavailable — the server-side brain log still has the call
  }
}

/**
 * DSGVO-Löschung (local scope): remove the Protokoll and any locally saved
 * drafts. Returns the number of removed keys. Brain-side deletion is a
 * separate, operator-level action.
 */
export function clearAllLocalData(): number {
  let removed = 0;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k === KEY || k.startsWith("hbar-health-arztbrief-draft-")) doomed.push(k);
    }
    for (const k of doomed) {
      localStorage.removeItem(k);
      removed++;
    }
  } catch {
    // ignore
  }
  return removed;
}
