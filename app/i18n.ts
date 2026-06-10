/**
 * UI-only i18n. The generated Arztbrief is ALWAYS German.
 * Only form labels, helper text, and microcopy are translated.
 */

export type Lang = "de" | "en";

const STORAGE_KEY = "hbar-health-lang";

export function getStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en") return "en";
  } catch {
    // SSR or blocked localStorage — fall back
  }
  return "de";
}

export function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export interface Strings {
  brand: string;
  subtitle: string;
  hauptproblemLabel: string;
  hauptproblemPlaceholder: string;
  beschwerdenLabel: string;
  beschwerdenPlaceholder: string;
  verlaufLabel: string;
  verlaufAkut: string;
  verlaufSubakut: string;
  verlaufChronisch: string;
  vorerkrankungenLabel: string;
  vorerkrankungenPlaceholder: string;
  medikationLabel: string;
  medikationPlaceholder: string;
  bildgebungLabel: string;
  bildgebungPlaceholder: string;
  unsicherheitLabel: string;
  unsicherheitHoch: string;
  unsicherheitMittel: string;
  unsicherheitGering: string;
  unsicherheitHint: string;
  submitButton: string;
  submittingButton: string;
  addButton: string;
  removeTitle: string;
  errorHeading: string;
  warningHeading: string;
  blockedHeading: string;
  blockedExplanation: string;
  // Nav
  navAbout: string;
  navLegal: string;
  navHome: string;
  // Theme
  themeLight: string;
  themeDark: string;
  // Audio module
  audioTitle: string;
  audioUpload: string;
  audioRecord: string;
  audioStopRecord: string;
  audioConsent: string;
  audioTranscribing: string;
  audioTranscriptLabel: string;
  audioExtractFields: string;
  audioExtracting: string;
  audioApplyToForm: string;
  audioApplied: string;
  audioNoConsent: string;
  audioNoFile: string;
  audioFileTooLarge: string;
  audioMaxHint: string;
  audioTranscribeBtn: string;
  // About page
  aboutTitle: string;
  aboutWhatItDoes: string;
  aboutWhatItDoesNot: string;
  aboutHowToUse: string;
  aboutDoes1: string;
  aboutDoes2: string;
  aboutDoes3: string;
  aboutDoesNot1: string;
  aboutDoesNot2: string;
  aboutDoesNot3: string;
  aboutDoesNot4: string;
  aboutSafe1: string;
  aboutSafe2: string;
  aboutSafe3: string;
  // Legal page
  legalTitle: string;
  legalIntendedUse: string;
  legalIntendedUseText: string;
  legalNotIntendedUse: string;
  legalNotIntendedUseText: string;
  legalResponsibility: string;
  legalResponsibilityText: string;
  legalDataHandling: string;
  legalDataHandlingText: string;
  legalEscalation: string;
  legalEscalationText: string;
}

const de: Strings = {
  brand: "hbar.health",
  subtitle: "Strukturierte Anamnese → ENTWURF Arztbrief. Kein Chat. Keine Diagnose.",
  hauptproblemLabel: "Hauptproblem *",
  hauptproblemPlaceholder: "Kurze Beschreibung des Hauptproblems",
  beschwerdenLabel: "Aktuelle Beschwerden *",
  beschwerdenPlaceholder: "Beschwerde",
  verlaufLabel: "Zeitlicher Verlauf *",
  verlaufAkut: "akut",
  verlaufSubakut: "subakut",
  verlaufChronisch: "chronisch",
  vorerkrankungenLabel: "Relevante Vorerkrankungen",
  vorerkrankungenPlaceholder: "Vorerkrankung",
  medikationLabel: "Medikation (optional)",
  medikationPlaceholder: "Medikament",
  bildgebungLabel: "Bildgebung / Radiologie (optional)",
  bildgebungPlaceholder: "z. B. Röntgen-Thorax o. p. B. — falls verfügbar",
  unsicherheitLabel: "Explizite Unsicherheit *",
  unsicherheitHoch: "hoch",
  unsicherheitMittel: "mittel",
  unsicherheitGering: "gering",
  unsicherheitHint: "Wird im Entwurf beibehalten oder erhöht — nie reduziert.",
  submitButton: "Entwurf erstellen.",
  submittingButton: "Generiere…",
  addButton: "+ Hinzufügen",
  removeTitle: "Entfernen",
  errorHeading: "Validierungsfehler:",
  warningHeading: "Hinweise (Constraint-Prüfung):",
  blockedHeading: "Entwurf blockiert (Sicherheitsprüfung):",
  blockedExplanation: "Der Entwurf wurde nicht ausgegeben, da Sicherheitsregeln verletzt wurden.",
  // Nav
  navAbout: "Über",
  navLegal: "Rechtliches",
  navHome: "Formular",
  // Theme
  themeLight: "Hell",
  themeDark: "Dunkel",
  // Audio
  audioTitle: "Optional: Audio (Transkription → Strukturierung)",
  audioUpload: "Audio hochladen",
  audioRecord: "Aufnahme starten",
  audioStopRecord: "Aufnahme stoppen",
  audioConsent: "Ich bestätige, dass die Einwilligung zur Verarbeitung dieser Aufnahme vorliegt.",
  audioTranscribing: "Transkribiere…",
  audioTranscriptLabel: "Transkript (editierbar)",
  audioExtractFields: "Felder extrahieren",
  audioExtracting: "Extrahiere…",
  audioApplyToForm: "In Formular übernehmen",
  audioApplied: "Felder übernommen.",
  audioNoConsent: "Bitte bestätigen Sie die Einwilligung vor der Verarbeitung.",
  audioNoFile: "Bitte laden Sie eine Audiodatei hoch oder nehmen Sie auf.",
  audioFileTooLarge: "Audiodatei zu groß. Maximal ~10 Minuten / 15 MB.",
  audioMaxHint: "Max. ~10 Min. Audio wird nicht gespeichert.",
  audioTranscribeBtn: "Transkribieren",
  // About
  aboutTitle: "Über hbar.health",
  aboutWhatItDoes: "Was dieses Tool tut",
  aboutWhatItDoesNot: "Was dieses Tool NICHT tut",
  aboutHowToUse: "Sichere Nutzung",
  aboutDoes1: "Wandelt strukturierte Anamnese-Eingaben in einen deutschen Arztbrief-Entwurf (ENTWURF) um.",
  aboutDoes2: "Erzwingt konservative, abschwächende Sprache (Arztdeutsch).",
  aboutDoes3: "Markiert jeden Entwurf als ENTWURF mit Haftungsausschluss.",
  aboutDoesNot1: "Stellt keine Diagnosen.",
  aboutDoesNot2: "Gibt keine Therapieempfehlungen.",
  aboutDoesNot3: "Trifft keine medizinischen Entscheidungen.",
  aboutDoesNot4: "Kein freier Chat — nur definierte Aufgaben mit Entwurfs-Ausgabe.",
  aboutSafe1: "Jeden Entwurf vor Verwendung prüfen und bearbeiten.",
  aboutSafe2: "Keine echten Patientenidentifikatoren eingeben (Prototyp).",
  aboutSafe3: "Nur als Entwurfshilfe verwenden — nie als Endprodukt.",
  // Legal
  legalTitle: "Rechtliche Hinweise",
  legalIntendedUse: "Bestimmungsgemäße Verwendung",
  legalIntendedUseText: "Dieses Tool ist ein Prototyp zur Unterstützung bei der Erstellung von Arztbrief-Entwürfen. Es dient ausschließlich als Dokumentationshilfe für Einzelpersonen und generiert nur Entwürfe, die einer ärztlichen Prüfung bedürfen.",
  legalNotIntendedUse: "Nicht bestimmungsgemäße Verwendung",
  legalNotIntendedUseText: "Dieses Tool ist NICHT bestimmt für: Diagnosestellung, Therapieentscheidungen, EHR-Integration, Produktiveinsatz oder Weitergabe an Dritte.",
  legalResponsibility: "Verantwortlichkeit",
  legalResponsibilityText: "Die Verantwortung für alle medizinischen Entscheidungen liegt ausschließlich beim behandelnden Arzt. Dieses Tool ersetzt keine ärztliche Beurteilung.",
  legalDataHandling: "Datenverarbeitung",
  legalDataHandlingText: "Standardmäßig werden keine Daten gespeichert. Audio wird nur zur Transkription verarbeitet und nicht für Training verwendet. Verwenden Sie in diesem Prototyp keine echten Patientenidentifikatoren.",
  legalEscalation: "Eskalationsauslöser",
  legalEscalationText: "Folgende Szenarien erfordern eine rechtliche Prüfung: Speicherung von Patientendaten, Verkauf an Kliniken, Integration in bestehende Systeme, Einsatz mit echten Patientendaten.",
};

const en: Strings = {
  brand: "hbar.health",
  subtitle: "Structured anamnesis → DRAFT Arztbrief. No chat. No diagnosis.",
  hauptproblemLabel: "Main problem *",
  hauptproblemPlaceholder: "Brief description of the main problem",
  beschwerdenLabel: "Current complaints *",
  beschwerdenPlaceholder: "Complaint",
  verlaufLabel: "Temporal course *",
  verlaufAkut: "acute",
  verlaufSubakut: "subacute",
  verlaufChronisch: "chronic",
  vorerkrankungenLabel: "Relevant pre-existing conditions",
  vorerkrankungenPlaceholder: "Condition",
  medikationLabel: "Medication (optional)",
  medikationPlaceholder: "Medication",
  bildgebungLabel: "Imaging / radiology (optional)",
  bildgebungPlaceholder: "z. B. Röntgen-Thorax o. p. B. — falls verfügbar",
  unsicherheitLabel: "Explicit uncertainty *",
  unsicherheitHoch: "high",
  unsicherheitMittel: "moderate",
  unsicherheitGering: "low",
  unsicherheitHint: "Preserved or increased in the draft — never reduced.",
  submitButton: "Create draft",
  submittingButton: "Generating…",
  addButton: "+ Add",
  removeTitle: "Remove",
  errorHeading: "Validation errors:",
  warningHeading: "Notices (constraint check):",
  blockedHeading: "Draft blocked (safety check):",
  blockedExplanation: "The draft was not output because safety rules were violated.",
  // Nav
  navAbout: "About",
  navLegal: "Legal",
  navHome: "Form",
  // Theme
  themeLight: "Light",
  themeDark: "Dark",
  // Audio
  audioTitle: "Optional: Audio (Transcription → Structuring)",
  audioUpload: "Upload audio",
  audioRecord: "Start recording",
  audioStopRecord: "Stop recording",
  audioConsent: "I confirm that consent to process this recording is in place.",
  audioTranscribing: "Transcribing…",
  audioTranscriptLabel: "Transcript (editable)",
  audioExtractFields: "Extract fields",
  audioExtracting: "Extracting…",
  audioApplyToForm: "Apply to form",
  audioApplied: "Fields applied.",
  audioNoConsent: "Please confirm consent before processing.",
  audioNoFile: "Please upload an audio file or record one.",
  audioFileTooLarge: "Audio file too large. Max ~10 minutes / 15 MB.",
  audioMaxHint: "Max ~10 min. Audio is not stored.",
  audioTranscribeBtn: "Transcribe",
  // About
  aboutTitle: "About hbar.health",
  aboutWhatItDoes: "What this tool does",
  aboutWhatItDoesNot: "What this tool does NOT do",
  aboutHowToUse: "Safe usage",
  aboutDoes1: "Converts structured anamnesis input into a German draft Arztbrief (ENTWURF).",
  aboutDoes2: "Enforces conservative, hedging language (medical German).",
  aboutDoes3: "Labels every draft as ENTWURF with a disclaimer.",
  aboutDoesNot1: "Does not diagnose.",
  aboutDoesNot2: "Does not recommend treatment.",
  aboutDoesNot3: "Does not make medical decisions.",
  aboutDoesNot4: "No free-form chat — only defined tasks with draft output.",
  aboutSafe1: "Review and edit every draft before use.",
  aboutSafe2: "Do not enter real patient identifiers (prototype).",
  aboutSafe3: "Use only as a drafting aid — never as a final product.",
  // Legal
  legalTitle: "Legal Notice",
  legalIntendedUse: "Intended use",
  legalIntendedUseText: "This tool is a prototype to assist in drafting Arztbrief documents. It serves solely as a documentation aid for individuals and generates only drafts that require physician review.",
  legalNotIntendedUse: "Not intended for",
  legalNotIntendedUseText: "This tool is NOT intended for: diagnosis, therapy decisions, EHR integration, production deployment, or distribution to third parties.",
  legalResponsibility: "Responsibility",
  legalResponsibilityText: "Responsibility for all medical decisions lies solely with the treating physician. This tool does not replace medical judgment.",
  legalDataHandling: "Data handling",
  legalDataHandlingText: "No data is stored by default. Audio is processed only for transcription and is not used for training. Do not use real patient identifiers in this prototype.",
  legalEscalation: "Escalation triggers",
  legalEscalationText: "The following scenarios require legal review: storing patient data, selling to clinics, integrating with existing systems, use with real patient data.",
};

const strings: Record<Lang, Strings> = { de, en };

export function t(lang: Lang): Strings {
  return strings[lang];
}
