/**
 * Strings for the task-suite surfaces (task home, Zusammenfassung, Antwort,
 * Protokoll). Kept separate from i18n.ts so the original Arztbrief strings
 * stay untouched. Same rule: UI is DE/EN, generated documents are ALWAYS German.
 */

import type { Lang } from "./i18n";

export interface TaskStrings {
  // Task home
  homeTitle: string;
  homeIntro: string;
  cardArztbriefTitle: string;
  cardArztbriefDesc: string;
  cardSummaryTitle: string;
  cardSummaryDesc: string;
  cardReplyTitle: string;
  cardReplyDesc: string;
  cardProtokollTitle: string;
  cardProtokollDesc: string;
  ocrNote: string;
  sovereigntyLine: string;
  backToTasks: string;
  // Summary page
  summaryTitle: string;
  summaryIntro: string;
  summaryInputLabel: string;
  summaryPlaceholder: string;
  summaryButton: string;
  working: string;
  summaryResultTitle: string;
  // Reply page
  replyTitle: string;
  replyIntro: string;
  replyLetterLabel: string;
  replyLetterPlaceholder: string;
  replyPointsLabel: string;
  replyPointsPlaceholder: string;
  replyTypeLabel: string;
  replyTypeBefund: string;
  replyTypeTermin: string;
  replyTypeUeberweisung: string;
  replyTypeAllgemein: string;
  replyButton: string;
  replyResultTitle: string;
  // Output actions
  copyButton: string;
  copiedToast: string;
  copyFailedToast: string;
  printButton: string;
  draftBadge: string;
  modelLine: string;
  // Protokoll page
  protokollTitle: string;
  protokollIntro: string;
  protokollEmpty: string;
  colTime: string;
  colTask: string;
  colModel: string;
  colSources: string;
  colDuration: string;
  colStatus: string;
  statusOk: string;
  statusError: string;
  clearLocalButton: string;
  clearLocalConfirm: string;
  clearedToast: string;
  retentionNote: string;
  // Validation
  emptyInputError: string;
}

const de: TaskStrings = {
  homeTitle: "Praxis-Aufgaben",
  homeIntro: "Dokumentenarbeit der Praxis — jede Aufgabe erzeugt einen Entwurf zur ärztlichen Prüfung.",
  cardArztbriefTitle: "Arztbrief erstellen",
  cardArztbriefDesc: "Strukturierte Anamnese → Arztbrief-Entwurf mit Briefkopf, Druck und PVS-Übernahme.",
  cardSummaryTitle: "Eingehenden Brief zusammenfassen",
  cardSummaryDesc: "Befund, Entlassbrief oder Anfrage einfügen → strukturierte Zusammenfassung (Absender, Befunde, erbetene Aktion, Fristen).",
  cardReplyTitle: "Antwortschreiben entwerfen",
  cardReplyDesc: "Eingegangener Brief + Stichpunkte der Praxis → formeller Antwortentwurf.",
  cardProtokollTitle: "Protokoll",
  cardProtokollDesc: "Jede KI-Anfrage dieser App: Zeitpunkt, Aufgabe, Modell, Quellen. Volle Nachvollziehbarkeit.",
  ocrNote: "PDF/Scan-Eingang (OCR) finden Sie im eigenen Tab „Briefeingang“.",
  sovereigntyLine: "Läuft auf der Praxis-Instanz. Jede Anfrage im Protokoll. Keine Weitergabe an Dritte.",
  backToTasks: "← Aufgaben",
  summaryTitle: "Eingehenden Brief zusammenfassen",
  summaryIntro: "Text des eingegangenen Briefes einfügen. Die Zusammenfassung gibt nur wieder, was im Brief steht — keine Interpretation.",
  summaryInputLabel: "Brieftext *",
  summaryPlaceholder: "Text des eingegangenen Briefes hier einfügen…",
  summaryButton: "Zusammenfassen",
  working: "Verarbeite…",
  summaryResultTitle: "Zusammenfassung",
  replyTitle: "Antwortschreiben entwerfen",
  replyIntro: "Eingegangenen Brief und Stichpunkte angeben — der Entwurf verwendet ausschließlich diese Angaben.",
  replyLetterLabel: "Eingegangener Brief *",
  replyLetterPlaceholder: "Text des Briefes, auf den geantwortet wird…",
  replyPointsLabel: "Stichpunkte der Praxis für die Antwort *",
  replyPointsPlaceholder: "z. B. Befundkopie beilegen; Termin am … anbieten; Rückfrage zu …",
  replyTypeLabel: "Art der Antwort",
  replyTypeBefund: "Befundübermittlung",
  replyTypeTermin: "Terminbestätigung",
  replyTypeUeberweisung: "Überweisungsantwort",
  replyTypeAllgemein: "Allgemeine Korrespondenz",
  replyButton: "Entwurf erstellen",
  replyResultTitle: "Antwortentwurf",
  copyButton: "In Zwischenablage kopieren",
  copiedToast: "In Zwischenablage kopiert — im PVS einfügen.",
  copyFailedToast: "Kopieren nicht möglich — Text bitte manuell markieren.",
  printButton: "Drucken",
  draftBadge: "ENTWURF — ärztliche Prüfung erforderlich",
  modelLine: "Modell",
  protokollTitle: "Protokoll",
  protokollIntro: "Jede KI-Anfrage dieser App, lückenlos. Das Brain führt zusätzlich ein serverseitiges Protokoll.",
  protokollEmpty: "Noch keine Einträge. Einträge erscheinen mit der ersten Aufgabe.",
  colTime: "Zeitpunkt",
  colTask: "Aufgabe",
  colModel: "Modell",
  colSources: "Quellen",
  colDuration: "Dauer",
  colStatus: "Status",
  statusOk: "OK",
  statusError: "Fehler",
  clearLocalButton: "Lokale Daten löschen",
  clearLocalConfirm: "Protokoll und lokal gespeicherte Entwürfe dieser App werden gelöscht. Fortfahren?",
  clearedToast: "Lokale Daten gelöscht.",
  retentionNote: "Dieses Protokoll liegt ausschließlich lokal im Browser der Praxis (max. 200 Einträge). Briefinhalte werden hier nicht gespeichert.",
  emptyInputError: "Bitte zuerst den Brieftext einfügen.",
};

const en: TaskStrings = {
  homeTitle: "Practice tasks",
  homeIntro: "Practice document work — every task produces a draft for physician review.",
  cardArztbriefTitle: "Create Arztbrief",
  cardArztbriefDesc: "Structured anamnesis → draft Arztbrief with letterhead, print, and PVS handoff.",
  cardSummaryTitle: "Summarize incoming letter",
  cardSummaryDesc: "Paste a Befund, discharge letter, or inquiry → structured summary (sender, findings, requested action, deadlines).",
  cardReplyTitle: "Draft a reply",
  cardReplyDesc: "Incoming letter + the practice's bullet points → formal reply draft.",
  cardProtokollTitle: "Audit log",
  cardProtokollDesc: "Every AI request this app made: time, task, model, sources. Full traceability.",
  ocrNote: "PDF/scan intake (OCR) lives in the separate “Briefeingang” tab.",
  sovereigntyLine: "Runs on the practice's own instance. Every request logged. No third-party sharing.",
  backToTasks: "← Tasks",
  summaryTitle: "Summarize incoming letter",
  summaryIntro: "Paste the incoming letter's text. The summary reproduces only what the letter states — no interpretation.",
  summaryInputLabel: "Letter text *",
  summaryPlaceholder: "Paste the incoming letter's text here…",
  summaryButton: "Summarize",
  working: "Working…",
  summaryResultTitle: "Summary",
  replyTitle: "Draft a reply",
  replyIntro: "Provide the incoming letter and your bullet points — the draft uses only this input.",
  replyLetterLabel: "Incoming letter *",
  replyLetterPlaceholder: "Text of the letter being answered…",
  replyPointsLabel: "Practice bullet points for the reply *",
  replyPointsPlaceholder: "e.g. attach copy of findings; offer appointment on …; query about …",
  replyTypeLabel: "Reply type",
  replyTypeBefund: "Findings transmission",
  replyTypeTermin: "Appointment confirmation",
  replyTypeUeberweisung: "Referral response",
  replyTypeAllgemein: "General correspondence",
  replyButton: "Create draft",
  replyResultTitle: "Reply draft",
  copyButton: "Copy to clipboard",
  copiedToast: "Copied — paste into the PVS.",
  copyFailedToast: "Copy unavailable — please select the text manually.",
  printButton: "Print",
  draftBadge: "DRAFT — physician review required",
  modelLine: "Model",
  protokollTitle: "Audit log",
  protokollIntro: "Every AI request this app made, without gaps. The brain additionally keeps a server-side log.",
  protokollEmpty: "No entries yet. Entries appear with the first task.",
  colTime: "Time",
  colTask: "Task",
  colModel: "Model",
  colSources: "Sources",
  colDuration: "Duration",
  colStatus: "Status",
  statusOk: "OK",
  statusError: "Error",
  clearLocalButton: "Delete local data",
  clearLocalConfirm: "This deletes the log and locally saved drafts of this app. Continue?",
  clearedToast: "Local data deleted.",
  retentionNote: "This log lives only in the practice's browser (max. 200 entries). Letter contents are not stored here.",
  emptyInputError: "Please paste the letter text first.",
};

const strings: Record<Lang, TaskStrings> = { de, en };

export function tt(lang: Lang): TaskStrings {
  return strings[lang];
}
